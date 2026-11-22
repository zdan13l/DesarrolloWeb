import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ToastService } from '../../shared/toast/toast.service';
import { PrestamoDevolucion } from './prestamo-devolucion';
import { Prestamo } from './prestamo.model';

const ACTIVO: Prestamo = {
  id: 5,
  fechaHoraEntrega: '2026-11-20T15:00:00Z',
  fechaHoraLimite: '2026-11-22T15:00:00Z',
  fechaHoraDevolucion: null,
  estadoInicial: 'BUENO',
  estadoFinal: null,
  observaciones: 'Sin novedades',
  accesorios: 'Cargador y mouse',
  estadoPrestamo: 'ACTIVO',
  recursoId: 4,
  recursoNombre: 'Portátil Dell',
  usuarioId: 2,
  usuarioNombre: 'Luis Pérez',
  reservaId: 1,
  devolucionTardia: null,
};

describe('PrestamoDevolucion', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(prestamo: Prestamo = ACTIVO) {
    const fixture = TestBed.createComponent(PrestamoDevolucion);
    fixture.componentRef.setInput('id', '5');
    await fixture.whenStable();
    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/prestamos/5')).flush(prestamo);
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement };
  }

  it('muestra los datos del préstamo que se va a devolver', async () => {
    const { raiz } = await abrir();
    const texto = raiz.textContent ?? '';

    expect(texto).toContain('Portátil Dell');
    expect(texto).toContain('Luis Pérez');
    expect(texto).toContain('Cargador y mouse');
    expect(raiz.querySelector('form')).not.toBeNull();
  });

  it('un préstamo ya devuelto no permite otra devolución', async () => {
    const { raiz } = await abrir({ ...ACTIVO, estadoPrestamo: 'DEVUELTO', estadoFinal: 'BUENO' });

    expect(raiz.textContent).toContain('ya fue devuelto');
    expect(raiz.querySelector('form')).toBeNull();
  });

  it('registra la devolución con el estado final y las observaciones', async () => {
    const { fixture, raiz } = await abrir();
    const estado = raiz.querySelector<HTMLSelectElement>('#estadoFinal')!;
    estado.value = 'DANADO';
    estado.dispatchEvent(new Event('change'));
    const observaciones = raiz.querySelector<HTMLTextAreaElement>('#observaciones')!;
    observaciones.value = '  Pantalla rayada  ';
    observaciones.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const peticion = backend.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/prestamos/5/devolucion'));

    expect(peticion.request.body).toEqual({ estadoFinal: 'DANADO', observaciones: 'Pantalla rayada' });
    peticion.flush({ ...ACTIVO, estadoPrestamo: 'DEVUELTO', devolucionTardia: false });
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/prestamos');
    expect(TestBed.inject(ToastService).toasts().map((t) => t.mensaje)).toContain('Devolución registrada');
  });

  it('sin observaciones no las envía', async () => {
    const { raiz } = await abrir();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const peticion = backend.expectOne((r) => r.method === 'PATCH');

    expect(peticion.request.body).toEqual({ estadoFinal: 'BUENO' });
    peticion.flush({ ...ACTIVO, estadoPrestamo: 'DEVUELTO', devolucionTardia: false });
  });

  it('avisa cuando la devolución es tardía', async () => {
    const { raiz } = await abrir();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    backend.expectOne((r) => r.method === 'PATCH').flush({ ...ACTIVO, estadoPrestamo: 'DEVUELTO', devolucionTardia: true });

    expect(TestBed.inject(ToastService).toasts().map((t) => t.mensaje)).toContain('Devolución registrada (fuera de plazo)');
  });

  it('muestra el 409 en el formulario, sin toast', async () => {
    const { fixture, raiz } = await abrir();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    backend
      .expectOne((r) => r.method === 'PATCH')
      .flush(
        { status: 409, message: 'El préstamo ya ha sido devuelto anteriormente', errors: [] },
        { status: 409, statusText: 'Conflict' },
      );
    await fixture.whenStable();

    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('ya ha sido devuelto');
    expect(TestBed.inject(ToastService).toasts()).toEqual([]);
  });

  it('avisa si el préstamo no se pudo cargar', async () => {
    const fixture = TestBed.createComponent(PrestamoDevolucion);
    fixture.componentRef.setInput('id', '5');
    await fixture.whenStable();
    backend.expectOne((r) => r.url.endsWith('/prestamos/5')).flush({ message: 'No existe' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No se pudo cargar el préstamo');
  });
});
