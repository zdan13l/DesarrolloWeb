import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ToastService } from '../../shared/toast/toast.service';
import { OMITIR_TOAST_ERROR, errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let toast: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
  });

  afterEach(() => backend.verify());

  it('muestra el campo message del formato único de error (409)', () => {
    let fallo: unknown;
    http.post('/api/reservas', {}).subscribe({ error: (e) => (fallo = e) });

    backend.expectOne('/api/reservas').flush(
      { status: 409, error: 'Conflict', message: 'El recurso no está disponible en el horario solicitado', errors: [] },
      { status: 409, statusText: 'Conflict' },
    );

    expect(toast.toasts().map((t) => t.mensaje)).toEqual(['El recurso no está disponible en el horario solicitado']);
    expect(fallo).toBeTruthy(); // el error original se relanza para el componente
  });

  it('lista cada campo inválido de un 400', () => {
    http.post('/api/usuarios', {}).subscribe({ error: () => undefined });

    backend.expectOne('/api/usuarios').flush(
      {
        status: 400,
        message: 'Hay campos invalidos en la solicitud',
        errors: [{ campo: 'correo', mensaje: 'El correo es obligatorio' }],
      },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(toast.toasts()[0].detalles).toEqual(['correo: El correo es obligatorio']);
  });

  it('avisa que no hay conexión cuando el servidor no responde', () => {
    http.get('/api/recursos').subscribe({ error: () => undefined });

    backend.expectOne('/api/recursos').error(new ProgressEvent('error'));

    expect(toast.toasts()[0].mensaje).toContain('No se pudo conectar');
  });

  it('no muestra toast si la petición lo omite', () => {
    const context = new HttpContext().set(OMITIR_TOAST_ERROR, true);
    http.post('/api/reservas', {}, { context }).subscribe({ error: () => undefined });

    backend.expectOne('/api/reservas').flush({ message: 'conflicto' }, { status: 409, statusText: 'Conflict' });

    expect(toast.toasts()).toEqual([]);
  });
});
