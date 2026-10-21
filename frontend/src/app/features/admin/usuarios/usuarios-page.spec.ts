import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { Usuario } from './usuario.model';
import { UsuariosPage } from './usuarios-page';

const ANA: Usuario = {
  id: 1,
  nombre: 'Ana',
  apellido: 'Martínez',
  correo: 'ana@campus.edu',
  activo: true,
  rolId: 1,
  rolNombre: 'Solicitante',
};

describe('UsuariosPage', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    backend = TestBed.inject(HttpTestingController);
  });

  async function crear() {
    const fixture = TestBed.createComponent(UsuariosPage);
    await fixture.whenStable();
    backend.expectOne((r) => r.url.endsWith('/roles')).flush([{ id: 1, nombre: 'Solicitante' }]);
    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/usuarios')).flush([ANA]);
    await fixture.whenStable();
    return fixture;
  }

  function boton(raiz: HTMLElement, texto: string): HTMLButtonElement {
    const encontrado = Array.from(raiz.querySelectorAll('button')).find((b) => b.textContent?.includes(texto));
    if (!encontrado) throw new Error(`No hay un botón con «${texto}»`);
    return encontrado;
  }

  function escribir(raiz: HTMLElement, id: string, valor: string): void {
    const campo = raiz.querySelector<HTMLInputElement>(`#${id}`)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  it('lista los usuarios con su nombre completo y rol', async () => {
    const fixture = await crear();
    const fila = (fixture.nativeElement as HTMLElement).querySelector('tbody tr')!.textContent ?? '';

    expect(fila).toContain('Ana Martínez');
    expect(fila).toContain('ana@campus.edu');
    expect(fila).toContain('Solicitante');
    expect(fila).toContain('Sí');
  });

  it('crea un usuario, valida el correo y recarga la lista', async () => {
    const fixture = await crear();
    const raiz = fixture.nativeElement as HTMLElement;

    boton(raiz, 'Nuevo usuario').click();
    await fixture.whenStable();
    escribir(raiz, 'nombre', 'Luis');
    escribir(raiz, 'apellido', 'Pérez');
    escribir(raiz, 'correo', 'no-es-un-correo');
    const rol = raiz.querySelector<HTMLSelectElement>('#rol')!;
    rol.selectedIndex = 1; // la posición 0 es el texto «Selecciona un rol»
    rol.dispatchEvent(new Event('change'));
    boton(raiz, 'Guardar').click();
    await fixture.whenStable();
    backend.expectNone((r) => r.method === 'POST');
    expect(raiz.querySelector('.form-error')?.textContent).toContain('correo válido');

    escribir(raiz, 'correo', ' luis@campus.edu ');
    await fixture.whenStable();
    boton(raiz, 'Guardar').click();
    const post = backend.expectOne((r) => r.method === 'POST' && r.url.endsWith('/usuarios'));
    expect(post.request.body).toEqual({
      nombre: 'Luis',
      apellido: 'Pérez',
      correo: 'luis@campus.edu',
      activo: true,
      rolId: 1,
    });
    post.flush({ ...ANA, id: 2, nombre: 'Luis' });
    await fixture.whenStable();

    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/usuarios')).flush([ANA]);
    await fixture.whenStable();
    expect(raiz.querySelector('form')).toBeNull();
  });

  it('edita un usuario con PUT sobre su id', async () => {
    const fixture = await crear();
    const raiz = fixture.nativeElement as HTMLElement;

    boton(raiz, 'Editar').click();
    await fixture.whenStable();
    expect(raiz.querySelector<HTMLInputElement>('#correo')!.value).toBe('ana@campus.edu');
    escribir(raiz, 'nombre', 'Ana María');
    boton(raiz, 'Guardar').click();

    const put = backend.expectOne((r) => r.method === 'PUT' && r.url.endsWith('/usuarios/1'));
    expect(put.request.body.nombre).toBe('Ana María');
    put.flush(ANA);
  });

  it('elimina solo después de confirmar', async () => {
    const fixture = await crear();
    const raiz = fixture.nativeElement as HTMLElement;
    const confirm = TestBed.inject(ConfirmService);

    boton(raiz, 'Eliminar').click();
    confirm.pendiente()?.resolver(false);
    backend.expectNone((r) => r.method === 'DELETE');

    boton(raiz, 'Eliminar').click();
    confirm.pendiente()?.resolver(true);
    backend.expectOne((r) => r.method === 'DELETE' && r.url.endsWith('/usuarios/1')).flush(null, {
      status: 204,
      statusText: 'No Content',
    });
    await fixture.whenStable();
    backend.expectOne((r) => r.method === 'GET' && r.url.endsWith('/usuarios')).flush([]);
    await fixture.whenStable();

    expect(raiz.textContent).toContain('Todavía no hay usuarios');
  });

  it('conserva la lista cuando el servidor rechaza el borrado con 409', async () => {
    const fixture = await crear();
    const raiz = fixture.nativeElement as HTMLElement;
    const confirm = TestBed.inject(ConfirmService);

    boton(raiz, 'Eliminar').click();
    confirm.pendiente()?.resolver(true);
    backend
      .expectOne((r) => r.method === 'DELETE')
      .flush({ message: 'tiene reservas' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    backend.expectNone((r) => r.method === 'GET'); // no recarga: nada cambió
    expect(raiz.textContent).toContain('Ana Martínez');
  });
});
