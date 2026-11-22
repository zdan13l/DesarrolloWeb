import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Rol } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ReservaForm } from './reserva-form';
import { Reserva } from './reserva.model';

const RECURSOS = [
  { id: 1, nombre: 'Aula 101' },
  { id: 2, nombre: 'Laboratorio' },
];
const USUARIOS = [
  { id: 1, nombre: 'Ana', apellido: 'Martínez' },
  { id: 2, nombre: 'Luis', apellido: 'Pérez' },
];
const RESERVA: Reserva = {
  id: 9,
  fechaHoraInicio: '2026-12-01T15:00:00Z',
  fechaHoraFin: '2026-12-01T17:00:00Z',
  fechaCreacion: '2026-11-20T10:00:00Z',
  estadoReserva: 'CONFIRMADA',
  recursoId: 2,
  recursoNombre: 'Laboratorio',
  usuarioId: 2,
  usuarioNombre: 'Luis Pérez',
};

function iniciarSesion(rol: Rol): void {
  TestBed.inject(AuthService).establecerSesion({
    token: 't',
    expiraEn: Date.now() + 3_600_000,
    usuario: { id: 1, nombre: 'Ana', apellido: 'Martínez', correo: 'ana@campus.edu', rol },
  });
}

describe('ReservaForm', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(rol: Rol, entradas: { id?: string; recursoId?: string } = {}) {
    iniciarSesion(rol);
    const fixture = TestBed.createComponent(ReservaForm);
    if (entradas.id) fixture.componentRef.setInput('id', entradas.id);
    if (entradas.recursoId) fixture.componentRef.setInput('recursoId', entradas.recursoId);
    await fixture.whenStable();
    backend.expectOne((r) => r.url.endsWith('/recursos')).flush(RECURSOS);
    if (rol !== 'SOLICITANTE') {
      backend
        .expectOne((r) => r.url.endsWith('/usuarios') && r.params.get('activos') === 'true')
        .flush(USUARIOS);
    }
    if (entradas.id) {
      backend.expectOne((r) => r.method === 'GET' && r.url.endsWith(`/reservas/${entradas.id}`)).flush(RESERVA);
    }
    await fixture.whenStable();
    return fixture;
  }

  function elegirPosicion(raiz: HTMLElement, id: string, posicion: number): void {
    const campo = raiz.querySelector<HTMLSelectElement>(`#${id}`)!;
    campo.selectedIndex = posicion;
    campo.dispatchEvent(new Event('change'));
  }

  function escribir(raiz: HTMLElement, id: string, valor: string): void {
    const campo = raiz.querySelector<HTMLInputElement>(`#${id}`)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  function llenarHorario(raiz: HTMLElement): void {
    escribir(raiz, 'inicio', '2026-12-01T10:00');
    escribir(raiz, 'fin', '2026-12-01T12:00');
  }

  it('el solicitante no elige usuario ni consulta la lista de usuarios', async () => {
    const fixture = await abrir('SOLICITANTE');
    const raiz = fixture.nativeElement as HTMLElement;

    expect(raiz.querySelector('#usuario')).toBeNull();
    expect(raiz.textContent).toContain('Ana Martínez');
    backend.expectNone((r) => r.url.endsWith('/usuarios'));
  });

  it('el solicitante reserva siempre a su nombre', async () => {
    const fixture = await abrir('SOLICITANTE');
    const raiz = fixture.nativeElement as HTMLElement;
    elegirPosicion(raiz, 'recurso', 2);
    llenarHorario(raiz);
    await fixture.whenStable();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const peticion = backend.expectOne((r) => r.method === 'POST' && r.url.endsWith('/reservas'));

    expect(peticion.request.body.usuarioId).toBe(1);
    expect(peticion.request.body.recursoId).toBe(2);
    expect(peticion.request.body.estadoReserva).toBeUndefined();
    expect(peticion.request.body.fechaHoraInicio).toMatch(/Z$/);
    peticion.flush({ ...RESERVA, usuarioId: 1 });
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/reservas');
    expect(TestBed.inject(ToastService).toasts().map((t) => t.mensaje)).toContain('Reserva creada');
  });

  it.each<Rol>(['GESTOR', 'ADMINISTRADOR'])('el rol %s elige a nombre de quién reserva, empezando por sí mismo', async (rol) => {
    const fixture = await abrir(rol);
    const raiz = fixture.nativeElement as HTMLElement;
    const usuario = raiz.querySelector<HTMLSelectElement>('#usuario')!;

    expect(usuario.options.length).toBe(3);
    expect(usuario.options[usuario.selectedIndex].textContent).toContain('Ana Martínez');

    elegirPosicion(raiz, 'usuario', 2);
    elegirPosicion(raiz, 'recurso', 1);
    llenarHorario(raiz);
    await fixture.whenStable();
    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    const peticion = backend.expectOne((r) => r.method === 'POST');
    expect(peticion.request.body.usuarioId).toBe(2);
    peticion.flush(RESERVA);
  });

  it('el recurso llega preseleccionado desde el detalle', async () => {
    const fixture = await abrir('SOLICITANTE', { recursoId: '2' });
    const recurso = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>('#recurso')!;

    expect(recurso.options[recurso.selectedIndex].textContent).toContain('Laboratorio');
  });

  it('no envía nada si faltan el recurso o las fechas', async () => {
    const fixture = await abrir('SOLICITANTE');
    const raiz = fixture.nativeElement as HTMLElement;

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    backend.expectNone((r) => r.method === 'POST');
    expect(raiz.textContent).toContain('Selecciona un recurso');
    expect(raiz.textContent).toContain('La fecha de inicio es obligatoria');
  });

  it('muestra el conflicto de horario en el propio formulario, sin toast', async () => {
    const fixture = await abrir('SOLICITANTE');
    const raiz = fixture.nativeElement as HTMLElement;
    elegirPosicion(raiz, 'recurso', 1);
    llenarHorario(raiz);
    await fixture.whenStable();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    backend
      .expectOne((r) => r.method === 'POST')
      .flush(
        { status: 409, message: 'El recurso no está disponible en el horario solicitado', errors: [] },
        { status: 409, statusText: 'Conflict' },
      );
    await fixture.whenStable();

    const alerta = raiz.querySelector('[role="alert"]');
    expect(alerta?.textContent).toContain('conflicto');
    expect(alerta?.textContent).toContain('El recurso no está disponible en el horario solicitado');
    expect(TestBed.inject(ToastService).toasts()).toEqual([]);
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('el aviso de error desaparece al corregir un campo', async () => {
    const fixture = await abrir('SOLICITANTE');
    const raiz = fixture.nativeElement as HTMLElement;
    elegirPosicion(raiz, 'recurso', 1);
    llenarHorario(raiz);
    await fixture.whenStable();
    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    backend.expectOne((r) => r.method === 'POST').flush({ message: 'conflicto' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();
    expect(raiz.querySelector('[role="alert"]')).not.toBeNull();

    escribir(raiz, 'fin', '2026-12-01T13:00');
    await fixture.whenStable();

    expect(raiz.querySelector('[role="alert"]')).toBeNull();
  });

  it('al editar carga la reserva y la guarda con PUT', async () => {
    const fixture = await abrir('GESTOR', { id: '9' });
    const raiz = fixture.nativeElement as HTMLElement;

    expect(raiz.querySelector('h1')?.textContent).toContain('Editar reserva');
    expect(raiz.querySelector<HTMLSelectElement>('#recurso')!.selectedOptions[0].textContent).toContain('Laboratorio');
    expect(raiz.querySelector<HTMLSelectElement>('#usuario')!.selectedOptions[0].textContent).toContain('Luis Pérez');

    escribir(raiz, 'fin', '2026-12-01T20:00');
    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const peticion = backend.expectOne((r) => r.method === 'PUT' && r.url.endsWith('/reservas/9'));

    expect(peticion.request.body.usuarioId).toBe(2);
    expect(peticion.request.body.recursoId).toBe(2);
    peticion.flush(RESERVA);
    await fixture.whenStable();
    expect(TestBed.inject(ToastService).toasts().map((t) => t.mensaje)).toContain('Reserva actualizada');
  });

  it('avisa si la reserva a editar no se pudo cargar', async () => {
    iniciarSesion('SOLICITANTE');
    const fixture = TestBed.createComponent(ReservaForm);
    fixture.componentRef.setInput('id', '9');
    await fixture.whenStable();
    backend.expectOne((r) => r.url.endsWith('/recursos')).flush(RECURSOS);
    backend.expectOne((r) => r.url.endsWith('/reservas/9')).flush({ message: 'No existe' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No se pudo cargar la reserva a editar');
  });
});
