import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Rol } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { Prestamo } from './prestamo.model';
import { PrestamosLista } from './prestamos-lista';

const HORA = 3_600_000;

function prestamo(id: number, estado: Prestamo['estadoPrestamo'], limiteEnMs: number, usuario = 'Luis Pérez'): Prestamo {
  return {
    id,
    fechaHoraEntrega: new Date(Date.now() - 24 * HORA).toISOString(),
    fechaHoraLimite: new Date(Date.now() + limiteEnMs).toISOString(),
    fechaHoraDevolucion: estado === 'DEVUELTO' ? new Date().toISOString() : null,
    estadoInicial: 'BUENO',
    estadoFinal: estado === 'DEVUELTO' ? 'BUENO' : null,
    observaciones: 'Sin novedades',
    accesorios: 'Cargador',
    estadoPrestamo: estado,
    recursoId: id,
    recursoNombre: `Equipo ${id}`,
    usuarioId: 2,
    usuarioNombre: usuario,
    reservaId: id,
    devolucionTardia: estado === 'DEVUELTO' ? true : null,
  };
}

const PRESTAMOS: Prestamo[] = [
  prestamo(1, 'ACTIVO', 5 * HORA),
  prestamo(2, 'ACTIVO', -2 * HORA),
  prestamo(3, 'DEVUELTO', -48 * HORA),
];

function iniciarSesion(rol: Rol, id = 1): void {
  TestBed.inject(AuthService).establecerSesion({
    token: 't',
    expiraEn: Date.now() + 3_600_000,
    usuario: { id, nombre: 'Ana', apellido: 'Martínez', correo: 'ana@campus.edu', rol },
  });
}

describe('PrestamosLista', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(rol: Rol, prestamos: Prestamo[] = PRESTAMOS, idSesion = 1) {
    iniciarSesion(rol, idSesion);
    const fixture = TestBed.createComponent(PrestamosLista);
    await fixture.whenStable();
    const consulta = backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/prestamos'));
    consulta.flush(prestamos);
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement, consulta };
  }

  function pestana(raiz: HTMLElement, texto: string): HTMLButtonElement {
    return Array.from(raiz.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find((b) => b.textContent?.includes(texto))!;
  }

  it('hace una sola consulta y separa activos, vencidos e historial', async () => {
    const { raiz } = await abrir('GESTOR');

    expect(pestana(raiz, 'Activos').textContent).toContain('(2)');
    expect(pestana(raiz, 'Vencidos').textContent).toContain('(1)');
    expect(pestana(raiz, 'Historial').textContent).toContain('(1)');
    backend.expectNone((r) => r.params.has('vencidos'));
  });

  it('la pestaña de vencidos solo muestra los activos con plazo pasado', async () => {
    const { fixture, raiz } = await abrir('GESTOR');

    pestana(raiz, 'Vencidos').click();
    await fixture.whenStable();

    const filas = raiz.querySelectorAll('tbody tr');
    expect(filas).toHaveLength(1);
    expect(filas[0].textContent).toContain('Equipo 2');
  });

  it('el historial muestra la devolución y si fue tardía', async () => {
    const { fixture, raiz } = await abrir('GESTOR');

    pestana(raiz, 'Historial').click();
    await fixture.whenStable();

    expect(raiz.querySelector('thead')?.textContent).toContain('Tardía');
    expect(raiz.querySelector('tbody')?.textContent).toContain('Sí');
  });

  it.each<Rol>(['GESTOR', 'ADMINISTRADOR'])('el rol %s pide todos los préstamos, ve a quién se prestó y puede entregar y devolver', async (rol) => {
    const { consulta, raiz } = await abrir(rol);

    expect(consulta.request.params.has('usuarioId')).toBe(false);
    expect(raiz.querySelector('h1')?.textContent).toContain('Préstamos');
    expect(raiz.querySelector('thead')?.textContent).toContain('Prestado a');
    expect(raiz.querySelector('a[href="/prestamos/entrega"]')).not.toBeNull();
    expect(raiz.querySelector('a[href="/prestamos/1/devolucion"]')?.textContent).toContain('Registrar devolución');
  });

  it('el solicitante pide solo los suyos y no puede entregar ni devolver', async () => {
    const { consulta, raiz } = await abrir('SOLICITANTE', PRESTAMOS, 2);

    expect(consulta.request.params.get('usuarioId')).toBe('2');
    expect(raiz.querySelector('h1')?.textContent).toContain('Mis préstamos');
    expect(raiz.querySelector('thead')?.textContent).not.toContain('Prestado a');
    expect(raiz.querySelector('a[href="/prestamos/entrega"]')).toBeNull();
    expect(raiz.querySelector('a[href*="devolucion"]')).toBeNull();
    expect(raiz.querySelector('thead')?.textContent).not.toContain('Acciones');
  });

  it('un préstamo devuelto no ofrece registrar devolución', async () => {
    const { fixture, raiz } = await abrir('GESTOR');

    pestana(raiz, 'Historial').click();
    await fixture.whenStable();

    expect(raiz.querySelector('a[href*="devolucion"]')).toBeNull();
  });

  it('muestra mensajes vacíos según la pestaña', async () => {
    const { fixture, raiz } = await abrir('GESTOR', []);

    expect(raiz.textContent).toContain('No hay préstamos activos');
    pestana(raiz, 'Vencidos').click();
    await fixture.whenStable();
    expect(raiz.textContent).toContain('No hay préstamos vencidos');
    pestana(raiz, 'Historial').click();
    await fixture.whenStable();
    expect(raiz.textContent).toContain('Aún no hay devoluciones registradas');
  });
});
