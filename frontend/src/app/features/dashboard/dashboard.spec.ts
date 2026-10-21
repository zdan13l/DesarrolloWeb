import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { Conteo, EstadoRecursoFila, Resumen } from './indicador.model';

const ESTADOS: EstadoRecursoFila[] = [
  { recursoId: 1, nombre: 'Aula 101', categoria: 'Aulas', ubicacion: 'Edificio A', estado: 'RESERVADO' },
  { recursoId: 2, nombre: 'Portátil Dell', categoria: 'Equipos', ubicacion: 'Bodega', estado: 'BLOQUEADO' },
  { recursoId: 3, nombre: 'Proyector', categoria: 'Equipos', ubicacion: 'Bodega', estado: 'DISPONIBLE' },
];
const POR_RECURSO: Conteo[] = [
  { id: 1, nombre: 'Aula 101', totalReservas: 4 },
  { id: 3, nombre: 'Proyector', totalReservas: 2 },
];
const POR_CATEGORIA: Conteo[] = [{ id: 1, nombre: 'Aulas', totalReservas: 4 }];
const RESUMEN: Resumen = {
  recursosPorEstado: { DISPONIBLE: 1, RESERVADO: 1, PRESTADO: 0, BLOQUEADO: 1 },
  devolucionesTardias: 3,
  incidentesRegistrados: 5,
};

describe('Dashboard', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    backend = TestBed.inject(HttpTestingController);
  });

  /** La petición vigente de un indicador (las canceladas por un error o una recarga se ignoran). */
  function vigente(fin: string): TestRequest {
    const abiertas = backend.match((r) => r.url.endsWith(`/indicadores/${fin}`)).filter((r) => !r.cancelled);
    expect(abiertas).toHaveLength(1);
    return abiertas[0];
  }

  function responderTodo(): void {
    vigente('estado-recursos').flush(ESTADOS);
    vigente('reservas-por-recurso').flush(POR_RECURSO);
    vigente('reservas-por-categoria').flush(POR_CATEGORIA);
    vigente('resumen').flush(RESUMEN);
  }

  async function crear() {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    return fixture;
  }

  it('pide los cuatro indicadores a la vez y muestra las cifras', async () => {
    const fixture = await crear();
    responderTodo();
    await fixture.whenStable();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Devoluciones tardías');
    const fichas = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.ficha__valor')).map((e) =>
      e.textContent?.trim(),
    );
    expect(fichas).toEqual(['1', '1', '0', '1', '3', '5']);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr')).toHaveLength(3);
  });

  it('filtra la tabla al pulsar una ficha de estado y vuelve a mostrar todo al pulsarla de nuevo', async () => {
    const fixture = await crear();
    responderTodo();
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    const bloqueados = raiz.querySelectorAll<HTMLButtonElement>('.ficha--boton')[3];

    bloqueados.click();
    await fixture.whenStable();
    const filas = raiz.querySelectorAll('section.seccion tbody tr');
    expect(filas).toHaveLength(1);
    expect(filas[0].textContent).toContain('Portátil Dell');
    expect(bloqueados.getAttribute('aria-pressed')).toBe('true');

    bloqueados.click();
    await fixture.whenStable();
    expect(raiz.querySelectorAll('section.seccion tbody tr')).toHaveLength(3);
  });

  it('dibuja las barras proporcionales al mayor valor y permite ver la tabla equivalente', async () => {
    const fixture = await crear();
    responderTodo();
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;

    const barras = raiz.querySelectorAll<HTMLElement>('.barras')[0].querySelectorAll<HTMLElement>('.barras__barra');
    expect(barras[0].style.width).toBe('100%');
    expect(barras[1].style.width).toBe('50%');

    const botonTabla = raiz.querySelector<HTMLButtonElement>('.grafico__cabecera button')!;
    botonTabla.click();
    await fixture.whenStable();
    expect(raiz.querySelector('.grafico table')?.textContent).toContain('Aula 101');
    expect(botonTabla.textContent).toContain('Ver gráfico');
  });

  it('muestra el error con la opción de reintentar y vuelve a pedir los datos', async () => {
    const fixture = await crear();
    // Al fallar una consulta, forkJoin cancela las demás.
    vigente('estado-recursos').flush({ message: 'caído' }, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('No se pudieron cargar');

    raiz.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    await fixture.whenStable();
    responderTodo();
    await fixture.whenStable();

    expect(raiz.querySelector('[role="alert"]')).toBeNull();
  });
});
