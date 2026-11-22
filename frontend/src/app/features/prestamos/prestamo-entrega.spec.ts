import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ToastService } from '../../shared/toast/toast.service';
import { PrestamoEntrega } from './prestamo-entrega';
import { Prestamo, ReservaParaEntrega } from './prestamo.model';

function reserva(id: number, estado: string): ReservaParaEntrega {
  return {
    id,
    recursoId: 10 + id,
    recursoNombre: `Equipo ${id}`,
    usuarioId: 20 + id,
    usuarioNombre: `Usuario ${id}`,
    fechaHoraInicio: '2026-12-01T15:00:00Z',
    fechaHoraFin: '2026-12-01T17:00:00Z',
    estadoReserva: estado,
  };
}

describe('PrestamoEntrega', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(reservas: ReservaParaEntrega[] = [reserva(1, 'CONFIRMADA'), reserva(2, 'CANCELADA'), reserva(3, 'CONFIRMADA')]) {
    const fixture = TestBed.createComponent(PrestamoEntrega);
    await fixture.whenStable();
    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/reservas')).flush(reservas);
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement };
  }

  function elegirPosicion(raiz: HTMLElement, id: string, posicion: number): void {
    const campo = raiz.querySelector<HTMLSelectElement>(`#${id}`)!;
    campo.selectedIndex = posicion;
    campo.dispatchEvent(new Event('change'));
  }

  function escribir(raiz: HTMLElement, id: string, valor: string): void {
    const campo = raiz.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  it('ofrece solo las reservas confirmadas', async () => {
    const { raiz } = await abrir();
    const opciones = Array.from(raiz.querySelectorAll<HTMLOptionElement>('#reserva option')).map((o) => o.textContent);

    expect(opciones).toHaveLength(3);
    expect(opciones[1]).toContain('Equipo 1');
    expect(opciones[2]).toContain('Equipo 3');
  });

  it('avisa cuando no hay reservas confirmadas', async () => {
    const { raiz } = await abrir([reserva(1, 'CANCELADA')]);

    expect(raiz.textContent).toContain('No hay reservas confirmadas disponibles');
  });

  it('al elegir la reserva propone la hora límite con el fin de la reserva', async () => {
    const { fixture, raiz } = await abrir();

    elegirPosicion(raiz, 'reserva', 1);
    await fixture.whenStable();

    const limite = raiz.querySelector<HTMLInputElement>('#limite')!.value;
    const esperado = new Date('2026-12-01T17:00:00Z');
    expect(new Date(limite).getTime()).toBe(new Date(esperado.getFullYear(), esperado.getMonth(), esperado.getDate(), esperado.getHours(), esperado.getMinutes()).getTime());
  });

  it('no envía nada si faltan la reserva, los accesorios o las observaciones', async () => {
    const { fixture, raiz } = await abrir();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    backend.expectNone((r) => r.method === 'POST');
    expect(raiz.textContent).toContain('Selecciona la reserva que respalda la entrega');
    expect(raiz.textContent).toContain('Indica los accesorios entregados');
    expect(raiz.textContent).toContain('Las observaciones son obligatorias');
  });

  it('registra la entrega con el recurso y el usuario de la reserva', async () => {
    const { fixture, raiz } = await abrir();
    elegirPosicion(raiz, 'reserva', 2);
    elegirPosicion(raiz, 'estadoInicial', 1);
    escribir(raiz, 'accesorios', 'Cargador y mouse');
    escribir(raiz, 'observaciones', 'Sin novedades');
    await fixture.whenStable();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const peticion = backend.expectOne((r) => r.method === 'POST' && r.url.endsWith('/prestamos'));

    expect(peticion.request.body).toMatchObject({
      recursoId: 13,
      usuarioId: 23,
      reservaId: 3,
      estadoInicial: 'REGULAR',
      accesorios: 'Cargador y mouse',
      observaciones: 'Sin novedades',
    });
    expect(peticion.request.body.fechaHoraEntrega).toMatch(/Z$/);
    expect(peticion.request.body.fechaHoraLimite).toMatch(/Z$/);
    expect(peticion.request.body.estadoPrestamo).toBeUndefined();
    peticion.flush({} as Prestamo);
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/prestamos');
    expect(TestBed.inject(ToastService).toasts().map((t) => t.mensaje)).toContain('Entrega registrada');
  });

  it('muestra el 409 en el formulario, sin toast', async () => {
    const { fixture, raiz } = await abrir();
    elegirPosicion(raiz, 'reserva', 1);
    escribir(raiz, 'accesorios', 'Ninguno');
    escribir(raiz, 'observaciones', 'Sin novedades');
    await fixture.whenStable();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    backend
      .expectOne((r) => r.method === 'POST')
      .flush(
        { status: 409, message: 'El recurso está BLOQUEADO y no puede ser prestado', errors: [] },
        { status: 409, statusText: 'Conflict' },
      );
    await fixture.whenStable();

    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('BLOQUEADO');
    expect(TestBed.inject(ToastService).toasts()).toEqual([]);
  });
});
