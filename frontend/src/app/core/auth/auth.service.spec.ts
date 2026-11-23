import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sesion } from './auth.model';
import { AuthService } from './auth.service';
import { leerClaims } from './jwt';

const USUARIO = { id: 3, nombre: 'Camila', apellido: 'Rojas', correo: 'camila@campus.edu', rol: 'GESTOR' } as const;

/** Fabrica un JWT con el payload dado. La firma es falsa: el frontend nunca la verifica. */
function crearJwt(claims: Record<string, unknown>): string {
  const codificar = (obj: unknown) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${codificar({ alg: 'HS256', typ: 'JWT' })}.${codificar(claims)}.firma`;
}

function jwtDe(usuario: { id: number; nombre: string; apellido: string; correo: string; rol: string }, venceEnMs: number, extra: Record<string, unknown> = {}): string {
  return crearJwt({
    sub: String(usuario.id),
    correo: usuario.correo,
    nombre: `${usuario.nombre} ${usuario.apellido}`,
    rol: usuario.rol,
    exp: Math.floor((Date.now() + venceEnMs) / 1000),
    ...extra,
  });
}

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
    const sesion = { ...sesionQueVence(3_600_000), token: jwtDe(USUARIO, 3_600_000) };
    localStorage.setItem('pontireservas.sesion', JSON.stringify(sesion));

    const auth = TestBed.inject(AuthService);

    expect(auth.haySesion()).toBe(true);
    expect(auth.usuario()?.correo).toBe('camila@campus.edu');
  });

  it('descarta una sesión guardada que ya venció', () => {
    localStorage.setItem('pontireservas.sesion', JSON.stringify(sesionQueVence(-1000)));

    expect(TestBed.inject(AuthService).haySesion()).toBe(false);
  });

  describe('sesión guardada editada a mano en localStorage', () => {
    function guardar(sesion: unknown): AuthService {
      localStorage.setItem('pontireservas.sesion', JSON.stringify(sesion));
      return TestBed.inject(AuthService);
    }

    it('descarta la sesión si se cambió el rol del usuario guardado', () => {
      const sesion = { ...sesionQueVence(3_600_000), token: jwtDe(USUARIO, 3_600_000) };
      const auth = guardar({ ...sesion, usuario: { ...USUARIO, rol: 'ADMINISTRADOR' } });

      expect(auth.haySesion()).toBe(false);
      expect(auth.rol()).toBeNull();
      expect(localStorage.getItem('pontireservas.sesion')).toBeNull();
    });

    it('descarta la sesión si se cambió el id o el correo del usuario guardado', () => {
      const token = jwtDe(USUARIO, 3_600_000);
      const base = { token, expiraEn: Date.now() + 3_600_000 };

      expect(guardar({ ...base, usuario: { ...USUARIO, id: 4 } }).haySesion()).toBe(false);
    });

    it('descarta la sesión si el rol del token no coincide con el del usuario guardado', () => {
      const token = jwtDe(USUARIO, 3_600_000, { rol: 'ADMINISTRADOR' });

      expect(guardar({ token, expiraEn: Date.now() + 3_600_000, usuario: USUARIO }).haySesion()).toBe(false);
    });

    it('si se alteran a la vez el token y el usuario guardado, la interfaz no lo detecta: lo rechaza el backend', () => {
      // El navegador no tiene el secreto y no puede verificar la firma. Con la firma falsa, la API
      // responde 401 y el authInterceptor cierra la sesión (ver auth.interceptor.spec.ts).
      const token = jwtDe(USUARIO, 3_600_000, { rol: 'ADMINISTRADOR' });
      const auth = guardar({ token, expiraEn: Date.now() + 3_600_000, usuario: { ...USUARIO, rol: 'ADMINISTRADOR' } });

      expect(auth.rol()).toBe('ADMINISTRADOR');
    });

    it('descarta la sesión si el token no es un JWT bien formado', () => {
      expect(guardar({ ...sesionQueVence(3_600_000), token: 'abc' }).haySesion()).toBe(false);
    });

    it('descarta la sesión si el JSON guardado está corrupto', () => {
      localStorage.setItem('pontireservas.sesion', '{no es json');

      expect(TestBed.inject(AuthService).haySesion()).toBe(false);
      expect(localStorage.getItem('pontireservas.sesion')).toBeNull();
    });

    it('toma el vencimiento del token, no el guardado: alargar expiraEn no sirve', () => {
      const sesion = { token: jwtDe(USUARIO, -1000), usuario: USUARIO, expiraEn: Date.now() + 99_999_999 };

      expect(guardar(sesion).haySesion()).toBe(false);
    });
  });

  describe('leerClaims', () => {
    it('lee id, correo, nombre con tildes, rol y vencimiento', () => {
      const claims = leerClaims(jwtDe({ ...USUARIO, nombre: 'María' }, 60_000));

      expect(claims).toMatchObject({ sub: '3', correo: 'camila@campus.edu', nombre: 'María Rojas', rol: 'GESTOR' });
    });

    it.each(['', 'abc', 'a.b', 'a.b.c', 'a.!!!.c'])('devuelve null para «%s»', (texto) => {
      expect(leerClaims(texto)).toBeNull();
    });

    it('devuelve null si faltan claims', () => {
      expect(leerClaims(crearJwt({ sub: '1' }))).toBeNull();
    });
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
