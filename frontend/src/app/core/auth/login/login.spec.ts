import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { errorInterceptor } from '../../interceptors/error.interceptor';
import { ToastService } from '../../../shared/toast/toast.service';
import { AuthService } from '../auth.service';
import { Login } from './login';

const RESPUESTA = {
  token: 'jwt-123',
  tipo: 'Bearer',
  expiraEnSegundos: 3600,
  usuario: { id: 3, nombre: 'Camila', apellido: 'Rojas', correo: 'camila@campus.edu', rol: 'GESTOR' },
};

describe('Login', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'login', component: Login },
            { path: '**', children: [] },
          ],
          withComponentInputBinding(),
        ),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function abrir(url = '/login') {
    const harness = await RouterTestingHarness.create(url);
    return harness.routeNativeElement as HTMLElement;
  }

  function escribir(raiz: HTMLElement, id: string, valor: string): void {
    const campo = raiz.querySelector<HTMLInputElement>(`#${id}`)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  async function enviar(raiz: HTMLElement) {
    raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await new Promise((resolver) => setTimeout(resolver));
  }

  it('no envía nada si faltan los datos y marca los campos', async () => {
    const raiz = await abrir();

    await enviar(raiz);

    backend.expectNone((r) => r.method === 'POST');
    expect(raiz.querySelectorAll('.form-error')).toHaveLength(2);
  });

  it('inicia sesión y lleva al inicio', async () => {
    const raiz = await abrir();
    escribir(raiz, 'correo', ' camila@campus.edu ');
    escribir(raiz, 'password', 'gestor12345');

    const envio = enviar(raiz);
    const peticion = backend.expectOne((r) => r.method === 'POST' && r.url.endsWith('/auth/login'));
    expect(peticion.request.body).toEqual({ correo: 'camila@campus.edu', password: 'gestor12345' });
    peticion.flush(RESPUESTA);
    await envio;
    await new Promise((resolver) => setTimeout(resolver));

    expect(TestBed.inject(AuthService).rol()).toBe('GESTOR');
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('vuelve a la pantalla que se había pedido', async () => {
    const raiz = await abrir('/login?returnUrl=%2Freservas');
    escribir(raiz, 'correo', 'camila@campus.edu');
    escribir(raiz, 'password', 'gestor12345');

    const envio = enviar(raiz);
    backend.expectOne((r) => r.url.endsWith('/auth/login')).flush(RESPUESTA);
    await envio;
    await new Promise((resolver) => setTimeout(resolver));

    expect(TestBed.inject(Router).url).toBe('/reservas');
  });

  it('ignora un destino que no sea una ruta interna', async () => {
    const raiz = await abrir('/login?returnUrl=https:%2F%2Fmalo.example');
    escribir(raiz, 'correo', 'camila@campus.edu');
    escribir(raiz, 'password', 'gestor12345');

    const envio = enviar(raiz);
    backend.expectOne((r) => r.url.endsWith('/auth/login')).flush(RESPUESTA);
    await envio;
    await new Promise((resolver) => setTimeout(resolver));

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('muestra el error del servidor en la propia pantalla, sin toast', async () => {
    const raiz = await abrir();
    escribir(raiz, 'correo', 'camila@campus.edu');
    escribir(raiz, 'password', 'mala-clave');

    const envio = enviar(raiz);
    backend
      .expectOne((r) => r.url.endsWith('/auth/login'))
      .flush({ message: 'Correo o contrasena incorrectos' }, { status: 401, statusText: 'Unauthorized' });
    await envio;

    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Correo o contrasena incorrectos');
    expect(TestBed.inject(ToastService).toasts()).toEqual([]);
    expect(TestBed.inject(AuthService).haySesion()).toBe(false);
  });
});
