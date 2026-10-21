import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { ToastService } from '../../shared/toast/toast.service';
import { MantenimientoDetalle } from './mantenimiento-detalle';
import { Mantenimiento } from './mantenimiento.model';

function mantenimiento(estado: Mantenimiento['estadoMantenimiento']): Mantenimiento {
  return {
    id: 4,
    fechaApertura: '2026-10-12T15:30:00Z',
    fechaCierre: estado === 'FINALIZADA' || estado === 'CANCELADA' ? '2026-10-13T10:00:00Z' : null,
    estadoMantenimiento: estado,
    diagnostico: 'Falla de fuente',
    observaciones: 'Pendiente',
    recursoId: 9,
    recursoNombre: 'Portátil Dell',
  };
}

describe('MantenimientoDetalle', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(estado: Mantenimiento['estadoMantenimiento'], estadoRecurso = 'BLOQUEADO') {
    const fixture = TestBed.createComponent(MantenimientoDetalle);
    fixture.componentRef.setInput('id', '4');
    await fixture.whenStable();
    await responderCarga(fixture, estado, estadoRecurso);
    return fixture;
  }

  async function responderCarga(
    fixture: ComponentFixture<MantenimientoDetalle>,
    estado: Mantenimiento['estadoMantenimiento'],
    estadoRecurso: string,
  ) {
    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/mantenimientos/4')).flush(mantenimiento(estado));
    backend
      .expectOne((r) => r.method === 'GET' && r.url.endsWith('/recursos/9'))
      .flush({ id: 9, nombre: 'Portátil Dell', estadoOperativo: estadoRecurso });
    await fixture.whenStable();
  }

  function boton(raiz: HTMLElement, texto: string): HTMLButtonElement {
    const encontrado = Array.from(raiz.querySelectorAll('button')).find((b) => b.textContent?.includes(texto));
    if (!encontrado) throw new Error(`No hay un botón con «${texto}»`);
    return encontrado;
  }

  function peticion(metodo: string, fin: string): TestRequest {
    return backend.expectOne((r) => r.method === metodo && r.url.endsWith(fin));
  }

  it('muestra el recurso y su estado actual junto al mantenimiento', async () => {
    const fixture = await abrir('ABIERTA');
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain('Portátil Dell');
    expect(texto).toContain('Bloqueado');
    expect(texto).toContain('Abierta');
  });

  it('pasa de ABIERTA a EN_PROCESO con un PUT que conserva el diagnóstico', async () => {
    const fixture = await abrir('ABIERTA');
    const raiz = fixture.nativeElement as HTMLElement;

    boton(raiz, 'Pasar a').click();
    const put = peticion('PUT', '/mantenimientos/4');
    expect(put.request.body).toEqual({
      diagnostico: 'Falla de fuente',
      observaciones: 'Pendiente',
      recursoId: 9,
      estadoMantenimiento: 'EN_PROCESO',
    });
    put.flush(mantenimiento('EN_PROCESO'));
    await fixture.whenStable();

    // Vuelve a leer el estado real del servidor.
    await responderCarga(fixture, 'EN_PROCESO', 'BLOQUEADO');
    expect(raiz.textContent).toContain('En proceso');
    expect(() => boton(raiz, 'Pasar a')).toThrow(); // ya no se ofrece
  });

  it('finaliza dejando el recurso disponible por defecto (RN-05)', async () => {
    const fixture = await abrir('EN_PROCESO');
    const raiz = fixture.nativeElement as HTMLElement;

    boton(raiz, 'Finalizar…').click();
    await fixture.whenStable();
    boton(raiz, 'Finalizar mantenimiento').click();

    const patch = peticion('PATCH', '/mantenimientos/4/finalizar');
    expect(patch.request.params.get('habilitarRecurso')).toBe('true');
    patch.flush(mantenimiento('FINALIZADA'));
    await fixture.whenStable();
    await responderCarga(fixture, 'FINALIZADA', 'DISPONIBLE');

    expect(raiz.textContent).toContain('ya está finalizado');
    expect(raiz.textContent).not.toContain('Habilitar recurso');
  });

  it('finaliza sin habilitar y ofrece habilitar el recurso después', async () => {
    const fixture = await abrir('ABIERTA');
    const raiz = fixture.nativeElement as HTMLElement;

    boton(raiz, 'Finalizar…').click();
    await fixture.whenStable();
    const casilla = raiz.querySelector<HTMLInputElement>('.panel-finalizar input[type="checkbox"]')!;
    casilla.click();
    await fixture.whenStable();
    boton(raiz, 'Finalizar mantenimiento').click();

    const patch = peticion('PATCH', '/mantenimientos/4/finalizar');
    expect(patch.request.params.get('habilitarRecurso')).toBe('false');
    patch.flush(mantenimiento('FINALIZADA'));
    await fixture.whenStable();
    await responderCarga(fixture, 'FINALIZADA', 'BLOQUEADO');

    expect(raiz.textContent).toContain('sigue');

    boton(raiz, 'Habilitar recurso').click();
    peticion('PATCH', '/recursos/9/habilitar').flush({ id: 9, nombre: 'Portátil Dell', estadoOperativo: 'DISPONIBLE' });
    await fixture.whenStable();
    await responderCarga(fixture, 'FINALIZADA', 'DISPONIBLE');
    expect(() => boton(raiz, 'Habilitar recurso')).toThrow();
  });

  it('pide confirmación antes de cancelar y no cancela si se rechaza', async () => {
    const fixture = await abrir('ABIERTA');
    const raiz = fixture.nativeElement as HTMLElement;
    const confirm = TestBed.inject(ConfirmService);

    boton(raiz, 'Cancelar mantenimiento').click();
    expect(confirm.pendiente()?.opciones.peligro).toBe(true);
    confirm.pendiente()?.resolver(false);
    backend.expectNone((r) => r.method === 'PATCH');

    boton(raiz, 'Cancelar mantenimiento').click();
    confirm.pendiente()?.resolver(true);
    peticion('PATCH', '/mantenimientos/4/cancelar').flush(mantenimiento('CANCELADA'));
    await fixture.whenStable();
    await responderCarga(fixture, 'CANCELADA', 'BLOQUEADO');

    expect(raiz.textContent).toContain('ya está cancelado');
    expect(TestBed.inject(ToastService).toasts().map((t) => t.mensaje)).toContain('Mantenimiento cancelado.');
  });

  it('no ofrece acciones sobre un mantenimiento ya cerrado', async () => {
    const fixture = await abrir('FINALIZADA', 'DISPONIBLE');
    const raiz = fixture.nativeElement as HTMLElement;

    expect(raiz.querySelector('form')).toBeNull();
    expect(() => boton(raiz, 'Finalizar…')).toThrow();
    expect(() => boton(raiz, 'Cancelar mantenimiento')).toThrow();
  });

  it('avisa cuando el mantenimiento no existe', async () => {
    const fixture = TestBed.createComponent(MantenimientoDetalle);
    fixture.componentRef.setInput('id', '4');
    await fixture.whenStable();

    peticion('GET', '/mantenimientos/4').flush({ message: 'No existe' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No se encontró el mantenimiento');
  });
});
