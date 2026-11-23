import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IncidenteForm } from './incidente-form';
import { AuthService } from '../../core/auth/auth.service';
import { Incidente } from './incidente.model';

describe('IncidenteForm', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    localStorage.clear();
    TestBed.inject(AuthService).establecerSesion({
      token: 't',
      expiraEn: Date.now() + 3_600_000,
      usuario: { id: 2, nombre: 'Luis', apellido: 'Pérez', correo: 'luis@campus.edu', rol: 'SOLICITANTE' },
    });
  });

  async function crear() {
    const fixture = TestBed.createComponent(IncidenteForm);
    await fixture.whenStable();
    backend
      .expectOne((r) => r.url.endsWith('/recursos'))
      .flush([{ id: 7, nombre: 'Proyector', estadoOperativo: 'DISPONIBLE' }]);
    await fixture.whenStable();
    return fixture;
  }

  function elegir(raiz: HTMLElement, id: string, valor: string): void {
    const campo = raiz.querySelector<HTMLSelectElement>(`#${id}`)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('change'));
  }

  /** Para los desplegables con [ngValue] (sus opciones no llevan el valor real): se elige por posición. */
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

  async function llenar(fixture: Awaited<ReturnType<typeof crear>>, severidad: string): Promise<HTMLElement> {
    const raiz = fixture.nativeElement as HTMLElement;
    elegirPosicion(raiz, 'recurso', 1); // la posición 0 es el texto «Selecciona un recurso»
    elegir(raiz, 'tipo', 'DANO_FISICO');
    elegir(raiz, 'severidad', severidad);
    escribir(raiz, 'descripcion', '  Se rompió el lente  ');
    await fixture.whenStable();
    return raiz;
  }

  it('muestra como reportante al usuario de la sesión, sin desplegable de usuarios', async () => {
    const fixture = await crear();
    const raiz = fixture.nativeElement as HTMLElement;

    expect(raiz.querySelector<HTMLInputElement>('#reportante')?.value).toBe('Luis Pérez');
    expect(raiz.querySelector('#usuario')).toBeNull();
  });

  it('el solicitante no ve enlaces a la lista de incidentes', async () => {
    const fixture = await crear();
    const enlaces = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );

    expect(enlaces).not.toContain('/incidentes');
  });

  it('gestor y administrador sí ven el enlace a la lista de incidentes', async () => {
    TestBed.inject(AuthService).establecerSesion({
      token: 't',
      expiraEn: Date.now() + 3_600_000,
      usuario: { id: 3, nombre: 'Camila', apellido: 'Rojas', correo: 'camila@campus.edu', rol: 'GESTOR' },
    });
    const fixture = await crear();
    const enlaces = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );

    expect(enlaces).toContain('/incidentes');
  });

  it('no envía nada y marca los campos si el formulario está incompleto', async () => {
    const fixture = await crear();
    const raiz = fixture.nativeElement as HTMLElement;

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    backend.expectNone((r) => r.method === 'POST');
    expect(raiz.querySelectorAll('.form-error').length).toBeGreaterThanOrEqual(3);
  });

  it('avisa antes de enviar que un incidente crítico bloquea el recurso', async () => {
    const fixture = await crear();
    const raiz = await llenar(fixture, 'LEVE');
    expect(raiz.querySelector('.alerta--aviso')).toBeNull();

    elegir(raiz, 'severidad', 'CRITICA');
    await fixture.whenStable();

    expect(raiz.querySelector('.alerta--aviso')?.textContent).toContain('bloquea el recurso');
  });

  it('envía el reporte en el formato de la API y confirma el bloqueo del recurso', async () => {
    const fixture = await crear();
    const raiz = await llenar(fixture, 'CRITICA');

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const peticion = backend.expectOne((r) => r.method === 'POST' && r.url.endsWith('/incidentes'));
    expect(peticion.request.body).toMatchObject({
      tipoIncidente: 'DANO_FISICO',
      severidadIncidente: 'CRITICA',
      descripcion: 'Se rompió el lente',
      recursoId: 7,
    });
    expect(peticion.request.body.usuarioId).toBeUndefined();
    expect(peticion.request.body.fecha).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    const respuesta: Incidente = {
      id: 1,
      tipoIncidente: 'DANO_FISICO',
      severidadIncidente: 'CRITICA',
      descripcion: 'Se rompió el lente',
      fecha: peticion.request.body.fecha,
      recursoId: 7,
      recursoNombre: 'Proyector',
      usuarioId: 2,
      usuarioNombre: 'Luis',
      recursoBloqueado: true,
    };
    peticion.flush(respuesta);
    await fixture.whenStable();

    const texto = raiz.textContent ?? '';
    expect(texto).toContain('Incidente reportado');
    expect(texto).toContain('BLOQUEADO');
  });

  it('no menciona el bloqueo cuando el incidente no es crítico', async () => {
    const fixture = await crear();
    const raiz = await llenar(fixture, 'LEVE');

    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    backend.expectOne((r) => r.method === 'POST').flush({
      id: 2,
      tipoIncidente: 'DANO_FISICO',
      severidadIncidente: 'LEVE',
      descripcion: 'x',
      fecha: '2026-10-12T15:30:00Z',
      recursoId: 7,
      recursoNombre: 'Proyector',
      usuarioId: 2,
      usuarioNombre: 'Luis',
      recursoBloqueado: false,
    } satisfies Incidente);
    await fixture.whenStable();

    expect(raiz.textContent).toContain('Incidente reportado');
    expect(raiz.querySelector('.alerta--aviso')).toBeNull();
  });
});
