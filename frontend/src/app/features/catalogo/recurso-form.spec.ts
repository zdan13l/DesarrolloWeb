import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RecursoForm } from './recurso-form';
import { Recurso } from './recurso.model';

const RECURSO: Recurso = {
  id: 7,
  nombre: 'Proyector portátil',
  tipoRecurso: 'EQUIPO',
  descripcion: 'Proyector para préstamo',
  caracteristicas: 'HDMI, 3000 lúmenes',
  modalidadRecurso: 'PRESTABLE',
  estadoOperativo: 'BLOQUEADO',
  categoriaId: 3,
  categoriaNombre: 'Equipos audiovisuales',
  ubicacionId: 2,
  ubicacionNombre: 'Bodega',
};

describe('RecursoForm', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(id?: string) {
    const fixture = TestBed.createComponent(RecursoForm);
    if (id) fixture.componentRef.setInput('id', id);
    await fixture.whenStable();
    backend.expectOne((r) => r.url.endsWith('/categorias')).flush([
      { id: 3, nombre: 'Equipos audiovisuales' },
      { id: 4, nombre: 'Aulas' },
    ]);
    backend.expectOne((r) => r.url.endsWith('/ubicaciones')).flush([
      { id: 2, nombre: 'Bodega' },
      { id: 5, nombre: 'Edificio A' },
    ]);
    if (id) {
      backend.expectOne((r) => r.method === 'GET' && r.url.endsWith(`/recursos/${id}`)).flush(RECURSO);
    }
    await fixture.whenStable();
    return fixture;
  }

  function escribir(raiz: HTMLElement, id: string, valor: string): void {
    const campo = raiz.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  function elegirPosicion(raiz: HTMLElement, id: string, posicion: number): void {
    const campo = raiz.querySelector<HTMLSelectElement>(`#${id}`)!;
    campo.selectedIndex = posicion;
    campo.dispatchEvent(new Event('change'));
  }

  it('no envía nada si faltan datos obligatorios', async () => {
    const fixture = await abrir();
    const raiz = fixture.nativeElement as HTMLElement;

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    backend.expectNone((r) => r.method === 'POST');
    expect(raiz.querySelectorAll('.form-error').length).toBeGreaterThanOrEqual(5);
  });

  it('un nombre de solo espacios no es válido', async () => {
    const fixture = await abrir();
    const raiz = fixture.nativeElement as HTMLElement;

    escribir(raiz, 'nombre', '   ');
    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(raiz.textContent).toContain('El nombre es obligatorio');
  });

  it('crea un recurso nuevo disponible y abre su detalle', async () => {
    const fixture = await abrir();
    const raiz = fixture.nativeElement as HTMLElement;
    escribir(raiz, 'nombre', 'Sala de juntas');
    escribir(raiz, 'descripcion', 'Sala con mesa grande');
    escribir(raiz, 'caracteristicas', 'Capacidad 12');
    elegirPosicion(raiz, 'categoria', 2);
    elegirPosicion(raiz, 'ubicacion', 2);
    await fixture.whenStable();

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const peticion = backend.expectOne((r) => r.method === 'POST' && r.url.endsWith('/recursos'));
    expect(peticion.request.body).toEqual({
      nombre: 'Sala de juntas',
      tipoRecurso: 'ESPACIO',
      modalidadRecurso: 'RESERVABLE',
      categoriaId: 4,
      ubicacionId: 5,
      descripcion: 'Sala con mesa grande',
      caracteristicas: 'Capacidad 12',
      estadoOperativo: 'DISPONIBLE',
    });
    peticion.flush({ ...RECURSO, id: 9 });
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/catalogo/9');
  });

  it('al editar carga los datos y conserva el estado operativo', async () => {
    const fixture = await abrir('7');
    const raiz = fixture.nativeElement as HTMLElement;

    expect(raiz.querySelector('h1')?.textContent).toContain('Editar recurso');
    expect(raiz.querySelector<HTMLInputElement>('#nombre')!.value).toBe('Proyector portátil');
    expect(raiz.querySelector<HTMLSelectElement>('#tipo')!.value).toBe('EQUIPO');
    escribir(raiz, 'nombre', 'Proyector Epson');
    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    const peticion = backend.expectOne((r) => r.method === 'PUT' && r.url.endsWith('/recursos/7'));
    expect(peticion.request.body.nombre).toBe('Proyector Epson');
    expect(peticion.request.body.estadoOperativo).toBe('BLOQUEADO');
    expect(peticion.request.body.categoriaId).toBe(3);
    peticion.flush(RECURSO);
  });

  it('avisa si el recurso a editar no se pudo cargar', async () => {
    const fixture = TestBed.createComponent(RecursoForm);
    fixture.componentRef.setInput('id', '7');
    await fixture.whenStable();
    backend.expectOne((r) => r.url.endsWith('/categorias')).flush([]);
    backend.expectOne((r) => r.url.endsWith('/ubicaciones')).flush([]);
    backend
      .expectOne((r) => r.url.endsWith('/recursos/7'))
      .flush({ message: 'No existe' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No se pudo cargar el recurso a editar');
  });
});
