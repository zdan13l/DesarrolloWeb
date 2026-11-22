import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Rol } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { CatalogoLista } from './catalogo-lista';
import { Recurso } from './recurso.model';

const AULA: Recurso = {
  id: 1,
  nombre: 'Aula 101',
  tipoRecurso: 'ESPACIO',
  descripcion: 'Aula estándar',
  caracteristicas: 'Capacidad 40',
  modalidadRecurso: 'RESERVABLE',
  estadoOperativo: 'DISPONIBLE',
  categoriaId: 1,
  categoriaNombre: 'Aulas',
  ubicacionId: 1,
  ubicacionNombre: 'Edificio A',
};
const PORTATIL: Recurso = {
  ...AULA,
  id: 4,
  nombre: 'Portátil Dell',
  tipoRecurso: 'EQUIPO',
  modalidadRecurso: 'AMBAS',
  estadoOperativo: 'BLOQUEADO',
  categoriaId: 2,
  categoriaNombre: 'Equipos',
};

function iniciarSesion(rol: Rol): void {
  TestBed.inject(AuthService).establecerSesion({
    token: 't',
    expiraEn: Date.now() + 3_600_000,
    usuario: { id: 1, nombre: 'Ana', apellido: 'Martínez', correo: 'ana@campus.edu', rol },
  });
}

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

describe('CatalogoLista', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(rol: Rol = 'SOLICITANTE', recursos: Recurso[] = [AULA, PORTATIL]) {
    iniciarSesion(rol);
    const fixture = TestBed.createComponent(CatalogoLista);
    await fixture.whenStable();
    backend.expectOne((r) => r.url.endsWith('/categorias')).flush([
      { id: 1, nombre: 'Aulas' },
      { id: 2, nombre: 'Equipos' },
    ]);
    backend.expectOne((r) => r.url.endsWith('/ubicaciones')).flush([{ id: 1, nombre: 'Edificio A' }]);
    backend.expectOne((r) => r.url.endsWith('/recursos')).flush(recursos);
    await fixture.whenStable();
    return fixture;
  }

  it('lista los recursos con su estado', async () => {
    const fixture = await abrir();
    const filas = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');

    expect(filas).toHaveLength(2);
    expect(filas[0].textContent).toContain('Aula 101');
    expect(filas[0].textContent).toContain('Espacio');
    expect(filas[1].textContent).toContain('Portátil Dell');
    expect(filas[1].textContent).toContain('Bloqueado');
  });

  it.each<[Rol, boolean]>([
    ['SOLICITANTE', false],
    ['GESTOR', false],
    ['ADMINISTRADOR', true],
  ])('el rol %s ve el botón «Nuevo recurso»: %s', async (rol, visible) => {
    const fixture = await abrir(rol);

    const boton = (fixture.nativeElement as HTMLElement).querySelector('a[href="/recursos/nuevo"]');
    expect(boton !== null).toBe(visible);
  });

  it('cada recurso enlaza a su detalle', async () => {
    const fixture = await abrir();

    const enlaces = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(enlaces).toEqual(['/catalogo/1', '/catalogo/4']);
  });

  it('filtrar vuelve a consultar con los parámetros elegidos', async () => {
    const fixture = await abrir();
    const raiz = fixture.nativeElement as HTMLElement;

    const categoria = raiz.querySelector<HTMLSelectElement>('#f-categoria')!;
    categoria.selectedIndex = 2;
    categoria.dispatchEvent(new Event('change'));
    const tipo = raiz.querySelector<HTMLSelectElement>('#f-tipo')!;
    tipo.selectedIndex = 2;
    tipo.dispatchEvent(new Event('change'));
    await esperar(350);

    const consulta = backend.expectOne((r) => r.url.endsWith('/recursos'));
    expect(consulta.request.params.get('categoriaId')).toBe('2');
    expect(consulta.request.params.get('tipo')).toBe('EQUIPO');
    consulta.flush([PORTATIL]);
    await fixture.whenStable();
    expect(raiz.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('muestra un mensaje cuando ningún recurso coincide', async () => {
    const fixture = await abrir('SOLICITANTE', []);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ningún recurso coincide');
  });

  it('limpiar los filtros vuelve a pedir todos los recursos', async () => {
    const fixture = await abrir();
    const raiz = fixture.nativeElement as HTMLElement;
    const estado = raiz.querySelector<HTMLSelectElement>('#f-estado')!;
    estado.selectedIndex = 3;
    estado.dispatchEvent(new Event('change'));
    await esperar(350);
    backend.expectOne((r) => r.url.endsWith('/recursos') && r.params.get('estado') === 'BLOQUEADO').flush([PORTATIL]);
    await fixture.whenStable();

    raiz.querySelector<HTMLButtonElement>('form button')!.click();
    await esperar(350);

    const consulta = backend.expectOne((r) => r.url.endsWith('/recursos'));
    expect(consulta.request.params.keys()).toEqual([]);
    consulta.flush([AULA, PORTATIL]);
  });
});
