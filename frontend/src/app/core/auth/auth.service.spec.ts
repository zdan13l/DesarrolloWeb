import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sesion } from './auth.model';
import { AuthService } from './auth.service';

const USUARIO = { id: 3, nombre: 'Camila', apellido: 'Rojas', correo: 'camila@campus.edu', rol: 'GESTOR' } as const;

function sesionQueVence(enMs: number): Sesion {
  return { token: 'abc', usuario: USUARIO, expiraEn: Date.now() + enMs };
}

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('inicia sin sesión', () => {
    const auth = TestBed.inject(AuthService);

    expect(auth.haySesion()).toBe(false);
    expect(auth.usuario()).toBeNull();
    expect(auth.rol()).toBeNull();
    expect(auth.token()).toBeNull();
  });

  it('el login guarda el token, el usuario y su vencimiento', () => {
    const auth = TestBed.inject(AuthService);
    const backend = TestBed.inject(HttpTestingController);
    let usuario;

    auth.login({ correo: 'camila@campus.edu', password: 'gestor12345' }).subscribe((u) => (usuario = u));
    const peticion = backend.expectOne((r) => r.method === 'POST' && r.url.endsWith('/auth/login'));
    expect(peticion.request.body).toEqual({ correo: 'camila@campus.edu', password: 'gestor12345' });
    peticion.flush({ token: 'jwt-123', tipo: 'Bearer', expiraEnSegundos: 3600, usuario: USUARIO });

    expect(usuario).toEqual(USUARIO);
    expect(auth.haySesion()).toBe(true);
    expect(auth.token()).toBe('jwt-123');
    expect(auth.rol()).toBe('GESTOR');
    expect(JSON.parse(localStorage.getItem('pontireservas.sesion')!).token).toBe('jwt-123');
  });

  it('un login fallido no deja sesión', () => {
    const auth = TestBed.inject(AuthService);
    const backend = TestBed.inject(HttpTestingController);

    auth.login({ correo: 'x@campus.edu', password: 'mala' }).subscribe({ error: () => undefined });
    backend
      .expectOne((r) => r.url.endsWith('/auth/login'))
      .flush({ message: 'Correo o contrasena incorrectos' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.haySesion()).toBe(false);
  });

  it('recupera la sesión guardada al volver a abrir la aplicación', () => {
    localStorage.setItem('pontireservas.sesion', JSON.stringify(sesionQueVence(3_600_000)));

    const auth = TestBed.inject(AuthService);

    expect(auth.haySesion()).toBe(true);
    expect(auth.usuario()?.correo).toBe('camila@campus.edu');
  });

  it('descarta una sesión guardada que ya venció', () => {
    localStorage.setItem('pontireservas.sesion', JSON.stringify(sesionQueVence(-1000)));

    expect(TestBed.inject(AuthService).haySesion()).toBe(false);
  });

  it('cierra la sesión cuando el token vence mientras la aplicación está abierta', () => {
    const auth = TestBed.inject(AuthService);
    auth.establecerSesion(sesionQueVence(-1));

    expect(auth.haySesion()).toBe(false);
    expect(auth.token()).toBeNull();
    expect(localStorage.getItem('pontireservas.sesion')).toBeNull();
  });

  it('tieneRol acepta cualquiera de los roles indicados', () => {
    const auth = TestBed.inject(AuthService);
    auth.establecerSesion(sesionQueVence(3_600_000));

    expect(auth.tieneRol('GESTOR', 'ADMINISTRADOR')).toBe(true);
    expect(auth.tieneRol('SOLICITANTE')).toBe(false);
  });

  it('cerrarSesion borra la sesión y lo guardado', () => {
    const auth = TestBed.inject(AuthService);
    auth.establecerSesion(sesionQueVence(3_600_000));

    auth.cerrarSesion();

    expect(auth.haySesion()).toBe(false);
    expect(localStorage.getItem('pontireservas.sesion')).toBeNull();
  });
});
