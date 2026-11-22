import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Rol } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Reserva } from './reserva.model';
import { ReservasLista } from './reservas-lista';

const MANANA = '2026-12-01T15:00:00Z';

function reserva(id: number, estado: Reserva['estadoReserva'], usuario = 'Ana Martínez'): Reserva {
  return {
    id,
    fechaHoraInicio: MANANA,
    fechaHoraFin: '2026-12-01T17:00:00Z',
    fechaCreacion: '2026-11-20T10:00:00Z',
    estadoReserva: estado,
    recursoId: 1,
    recursoNombre: `Recurso ${id}`,
    usuarioId: 1,
    usuarioNombre: usuario,
  };
}

function iniciarSesion(rol: Rol, id = 1): void {
  TestBed.inject(AuthService).establecerSesion({
    token: 't',
    expiraEn: Date.now() + 3_600_000,
    usuario: { id, nombre: 'Ana', apellido: 'Martínez', correo: 'ana@campus.edu', rol },
  });
}

describe('ReservasLista', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(rol: Rol, reservas: Reserva[], idSesion = 1) {
    iniciarSesion(rol, idSesion);
    const fixture = TestBed.createComponent(ReservasLista);
    await fixture.whenStable();
    const consulta = backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/reservas'));
    consulta.flush(reservas);
    await fixture.whenStable();
    return { fixture, consulta };
  }

  it('el solicitante pide solo sus reservas y ve el título «Mis reservas»', async () => {
    const { fixture, consulta } = await abrir('SOLICITANTE', [reserva(1, 'CONFIRMADA')], 7);
    const raiz = fixture.nativeElement as HTMLElement;

    expect(consulta.request.params.get('usuarioId')).toBe('7');
    expect(raiz.querySelector('h1')?.textContent).toContain('Mis reservas');
    expect(raiz.querySelector('thead')?.textContent).not.toContain('Reservado por');
  });

  it.each<Rol>(['GESTOR', 'ADMINISTRADOR'])('el rol %s pide todas las reservas y ve quién reservó', async (rol) => {
    const { fixture, consulta } = await abrir(rol, [reserva(1, 'CONFIRMADA', 'Luis Pérez')]);
    const raiz = fixture.nativeElement as HTMLElement;

    expect(consulta.request.params.has('usuarioId')).toBe(false);
    expect(raiz.querySelector('h1')?.textContent).toContain('Reservas');
    expect(raiz.querySelector('thead')?.textContent).toContain('Reservado por');
    expect(raiz.querySelector('tbody')?.textContent).toContain('Luis Pérez');
  });

  it('solo las reservas confirmadas se pueden editar o cancelar', async () => {
    const { fixture } = await abrir('SOLICITANTE', [
      reserva(1, 'CONFIRMADA'),
      reserva(2, 'CANCELADA'),
      reserva(3, 'FINALIZADA'),
    ]);

    const filas = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(filas[0].textContent).toContain('Editar');
    expect(filas[0].textContent).toContain('Cancelar');
    expect(filas[1].textContent).not.toContain('Editar');
    expect(filas[2].textContent).not.toContain('Cancelar');
  });

  it('el enlace de editar apunta a la reserva', async () => {
    const { fixture } = await abrir('SOLICITANTE', [reserva(5, 'CONFIRMADA')]);

    const editar = (fixture.nativeElement as HTMLElement).querySelector('tbody a');
    expect(editar?.getAttribute('href')).toBe('/reservas/5/editar');
  });

  it('muestra un mensaje distinto cuando el solicitante no tiene reservas', async () => {
    const { fixture } = await abrir('SOLICITANTE', []);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aún no tienes reservas');
  });

  it('cancela con confirmación, avisa y vuelve a leer la lista', async () => {
    const { fixture } = await abrir('SOLICITANTE', [reserva(1, 'CONFIRMADA')]);
    const raiz = fixture.nativeElement as HTMLElement;
    const confirm = TestBed.inject(ConfirmService);

    raiz.querySelector<HTMLButtonElement>('tbody button')!.click();
    expect(confirm.pendiente()?.opciones.peligro).toBe(true);
    confirm.pendiente()?.resolver(true);
    backend.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/reservas/1/cancelar')).flush(reserva(1, 'CANCELADA'));
    await fixture.whenStable();
    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/reservas')).flush([reserva(1, 'CANCELADA')]);
    await fixture.whenStable();

    expect(TestBed.inject(ToastService).toasts().map((t) => t.mensaje)).toContain('Reserva cancelada');
    expect(raiz.querySelector('tbody')?.textContent).not.toContain('Cancelar');
  });

  it('no cancela si se rechaza la confirmación', async () => {
    const { fixture } = await abrir('SOLICITANTE', [reserva(1, 'CONFIRMADA')]);
    const confirm = TestBed.inject(ConfirmService);

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('tbody button')!.click();
    confirm.pendiente()?.resolver(false);

    backend.expectNone((r) => r.method === 'PATCH');
  });

  it('si el servidor rechaza la cancelación vuelve a leer la lista por si cambió el estado', async () => {
    const { fixture } = await abrir('SOLICITANTE', [reserva(1, 'CONFIRMADA')]);
    const confirm = TestBed.inject(ConfirmService);

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('tbody button')!.click();
    confirm.pendiente()?.resolver(true);
    backend
      .expectOne((r) => r.method === 'PATCH')
      .flush({ message: 'La reserva ya inició' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/reservas')).flush([reserva(1, 'FINALIZADA')]);
  });
});
