import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Rol } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { RecursoDetalle } from './recurso-detalle';
import { Recurso } from './recurso.model';

const RECURSO: Recurso = {
  id: 7,
  nombre: 'Proyector portátil',
  tipoRecurso: 'EQUIPO',
  descripcion: 'Proyector para préstamo',
  caracteristicas: 'HDMI, 3000 lúmenes',
  modalidadRecurso: 'PRESTABLE',
  estadoOperativo: 'DISPONIBLE',
  categoriaId: 3,
  categoriaNombre: 'Equipos audiovisuales',
  ubicacionId: 2,
  ubicacionNombre: 'Bodega',
};

function iniciarSesion(rol: Rol): void {
  TestBed.inject(AuthService).establecerSesion({
    token: 't',
    expiraEn: Date.now() + 3_600_000,
    usuario: { id: 1, nombre: 'Ana', apellido: 'Martínez', correo: 'ana@campus.edu', rol },
  });
}

describe('RecursoDetalle', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(rol: Rol, recurso: Recurso = RECURSO) {
    iniciarSesion(rol);
    const fixture = TestBed.createComponent(RecursoDetalle);
    fixture.componentRef.setInput('id', '7');
    await fixture.whenStable();
    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/recursos/7')).flush(recurso);
    backend.expectOne((r) => r.url.endsWith('/recursos/7/disponibilidad')).flush([]);
    await fixture.whenStable();
    return fixture;
  }

  function boton(raiz: HTMLElement, texto: string): HTMLElement | undefined {
    return Array.from(raiz.querySelectorAll<HTMLElement>('a, button')).find((e) => e.textContent?.includes(texto));
  }

  it('muestra los datos del recurso y su estado', async () => {
    const fixture = await abrir('SOLICITANTE');
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain('Proyector portátil');
    expect(texto).toContain('Disponible');
    expect(texto).toContain('Bodega');
    expect(texto).toContain('HDMI, 3000 lúmenes');
  });

  it('todos los roles pueden reservar', async () => {
    for (const rol of ['SOLICITANTE', 'GESTOR', 'ADMINISTRADOR'] as Rol[]) {
      const fixture = await abrir(rol);
      expect(boton(fixture.nativeElement, 'Reservar')?.getAttribute('href')).toContain('/reservas/nueva');
      fixture.destroy();
    }
  });

  it.each<[Rol, boolean]>([
    ['SOLICITANTE', false],
    ['GESTOR', false],
    ['ADMINISTRADOR', true],
  ])('el rol %s ve «Editar»: %s', async (rol, visible) => {
    const fixture = await abrir(rol);

    expect(boton(fixture.nativeElement, 'Editar') !== undefined).toBe(visible);
  });

  it.each<[Rol, boolean]>([
    ['SOLICITANTE', false],
    ['GESTOR', true],
    ['ADMINISTRADOR', true],
  ])('el rol %s ve «Habilitar recurso» en un recurso bloqueado: %s', async (rol, visible) => {
    const fixture = await abrir(rol, { ...RECURSO, estadoOperativo: 'BLOQUEADO' });

    expect(boton(fixture.nativeElement, 'Habilitar recurso') !== undefined).toBe(visible);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('bloqueado');
  });

  it('un recurso disponible no ofrece habilitar', async () => {
    const fixture = await abrir('GESTOR');

    expect(boton(fixture.nativeElement, 'Habilitar recurso')).toBeUndefined();
  });

  it('habilitar manda el PATCH y vuelve a leer el recurso', async () => {
    const fixture = await abrir('GESTOR', { ...RECURSO, estadoOperativo: 'BLOQUEADO' });
    const raiz = fixture.nativeElement as HTMLElement;

    boton(raiz, 'Habilitar recurso')!.click();
    backend.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/recursos/7/habilitar')).flush(RECURSO);
    await fixture.whenStable();
    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/recursos/7')).flush(RECURSO);
    await fixture.whenStable();

    expect(TestBed.inject(ToastService).toasts().map((t) => t.mensaje)).toContain('Recurso habilitado');
    expect(boton(raiz, 'Habilitar recurso')).toBeUndefined();
  });

  it('muestra las franjas ocupadas del día ordenadas por hora', async () => {
    iniciarSesion('SOLICITANTE');
    const fixture = TestBed.createComponent(RecursoDetalle);
    fixture.componentRef.setInput('id', '7');
    await fixture.whenStable();
    backend.expectOne((r) => r.url.endsWith('/recursos/7')).flush(RECURSO);
    backend.expectOne((r) => r.url.endsWith('/disponibilidad')).flush([
      { fechaHoraInicio: '2026-10-12T20:00:00Z', fechaHoraFin: '2026-10-12T21:00:00Z', tipoOcupacion: 'PRESTAMO' },
      { fechaHoraInicio: '2026-10-12T14:00:00Z', fechaHoraFin: '2026-10-12T15:00:00Z', tipoOcupacion: 'RESERVA' },
    ]);
    await fixture.whenStable();

    const franjas = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.franjas li')).map((li) =>
      li.textContent,
    );
    expect(franjas).toHaveLength(2);
    expect(franjas[0]).toContain('Reserva');
    expect(franjas[1]).toContain('Préstamo');
  });

  it('avisa que el recurso está libre cuando no hay franjas', async () => {
    const fixture = await abrir('SOLICITANTE');

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('libre todo el día');
  });

  it('cambiar el día consulta la disponibilidad de esa fecha', async () => {
    const fixture = await abrir('SOLICITANTE');
    const campo = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#fecha')!;

    campo.value = '2026-12-24';
    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const consulta = backend.expectOne((r) => r.url.endsWith('/recursos/7/disponibilidad'));
    expect(consulta.request.params.get('fecha')).toBe('2026-12-24');
    consulta.flush([]);
  });

  it('avisa si el recurso no se pudo cargar', async () => {
    iniciarSesion('SOLICITANTE');
    const fixture = TestBed.createComponent(RecursoDetalle);
    fixture.componentRef.setInput('id', '7');
    await fixture.whenStable();

    backend
      .expectOne((r) => r.method === 'GET' && r.url.endsWith('/recursos/7'))
      .flush({ message: 'No existe' }, { status: 404, statusText: 'Not Found' });
    backend.expectOne((r) => r.url.endsWith('/disponibilidad')).flush([]);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No se pudo cargar el recurso');
  });
});
