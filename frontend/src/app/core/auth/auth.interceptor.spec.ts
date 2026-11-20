import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  function iniciarSesion(): void {
    auth.establecerSesion({
      token: 'jwt-123',
      expiraEn: Date.now() + 3_600_000,
      usuario: { id: 1, nombre: 'Ana', apellido: 'Martínez', correo: 'ana@campus.edu', rol: 'SOLICITANTE' },
    });
  }

  it('agrega el token a las peticiones a la API', () => {
    iniciarSesion();

    http.get(`${environment.apiUrl}/recursos`).subscribe();

    const peticion = backend.expectOne(`${environment.apiUrl}/recursos`);
    expect(peticion.request.headers.get('Authorization')).toBe('Bearer jwt-123');
    peticion.flush([]);
  });

  it('no manda el token a direcciones que no son de la API', () => {
    iniciarSesion();

    http.get('https://otro-sitio.example/datos').subscribe();

    const peticion = backend.expectOne('https://otro-sitio.example/datos');
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush({});
  });

  it('sin sesión no agrega encabezado', () => {
    http.get(`${environment.apiUrl}/recursos`).subscribe({ error: () => undefined });

    const peticion = backend.expectOne(`${environment.apiUrl}/recursos`);
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush([]);
  });

  it('un 401 cierra la sesión y lleva al login recordando la pantalla', async () => {
    iniciarSesion();
    await router.navigateByUrl('/reservas');

    http.get(`${environment.apiUrl}/reservas`).subscribe({ error: () => undefined });
    backend
      .expectOne(`${environment.apiUrl}/reservas`)
      .flush({ message: 'token vencido' }, { status: 401, statusText: 'Unauthorized' });
    await new Promise((resolver) => setTimeout(resolver));

    expect(auth.haySesion()).toBe(false);
    expect(router.url).toBe('/login?returnUrl=%2Freservas');
  });

  it('un 401 del propio login no cierra nada ni redirige', async () => {
    await router.navigateByUrl('/login');

    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe({ error: () => undefined });
    backend
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ message: 'Correo o contrasena incorrectos' }, { status: 401, statusText: 'Unauthorized' });
    await new Promise((resolver) => setTimeout(resolver));

    expect(router.url).toBe('/login');
  });

  it('un 403 conserva la sesión', () => {
    iniciarSesion();

    http.get(`${environment.apiUrl}/usuarios`).subscribe({ error: () => undefined });
    backend
      .expectOne(`${environment.apiUrl}/usuarios`)
      .flush({ message: 'sin permisos' }, { status: 403, statusText: 'Forbidden' });

    expect(auth.haySesion()).toBe(true);
  });
});
