import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OMITIR_TOAST_ERROR } from '../interceptors/error.interceptor';
import { LoginRequest, LoginResponse, Rol, Sesion, UsuarioSesion } from './auth.model';
import { leerClaims } from './jwt';

const CLAVE_SESION = 'pontireservas.sesion';

/** Sesión del usuario: token, datos y rol. Se conserva en localStorage hasta que el token vence. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly _sesion = signal<Sesion | null>(this.leerSesionGuardada());

  readonly usuario = computed(() => this._sesion()?.usuario ?? null);
  readonly rol = computed(() => this.usuario()?.rol ?? null);
  readonly token = computed(() => this._sesion()?.token ?? null);

  login(credenciales: LoginRequest): Observable<UsuarioSesion> {
    const context = new HttpContext().set(OMITIR_TOAST_ERROR, true);
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciales, { context }).pipe(
      tap((respuesta) =>
        this.establecerSesion({
          token: respuesta.token,
          usuario: respuesta.usuario,
          expiraEn: Date.now() + respuesta.expiraEnSegundos * 1000,
        }),
      ),
      map((respuesta) => respuesta.usuario),
    );
  }

  establecerSesion(sesion: Sesion): void {
    this._sesion.set(sesion);
    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
      // Sin almacenamiento disponible la sesión dura mientras la pestaña siga abierta.
    }
  }

  /** Indica si hay una sesión cuyo token no ha vencido; si venció, la cierra. */
  haySesion(): boolean {
    const sesion = this._sesion();
    if (sesion === null) return false;
    if (Date.now() >= sesion.expiraEn) {
      this.cerrarSesion();
      return false;
    }
    return true;
  }

  tieneRol(...roles: Rol[]): boolean {
    const actual = this.rol();
    return actual !== null && roles.includes(actual);
  }

  cerrarSesion(): void {
    this._sesion.set(null);
    this.borrarGuardada();
  }

  private borrarGuardada(): void {
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      // Nada que limpiar si el almacenamiento no está disponible.
    }
  }

  /** Cierra la sesión y lleva al login, recordando la pantalla actual para volver después de entrar. */
  expulsar(): void {
    const destino = this.router.url;
    this.cerrarSesion();
    if (!destino.startsWith('/login')) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: destino } });
    }
  }

  /**
   * Recupera la sesión de localStorage, que el usuario puede editar a mano. Por eso el rol, el id y el
   * vencimiento deben coincidir con lo que dice el propio token; si algo no cuadra se descarta la sesión.
   * (La firma del token solo la puede verificar el backend, que lo hace en cada petición.)
   */
  private leerSesionGuardada(): Sesion | null {
    try {
      const guardada = localStorage.getItem(CLAVE_SESION);
      if (guardada === null) return null;
      const sesion = JSON.parse(guardada) as Sesion;
      const claims = leerClaims(sesion.token);
      const coincide =
        claims !== null &&
        claims.sub === String(sesion.usuario?.id) &&
        claims.rol === sesion.usuario.rol &&
        claims.correo === sesion.usuario.correo;
      if (!coincide || Date.now() >= claims.exp * 1000) {
        this.borrarGuardada();
        return null;
      }
      return { ...sesion, expiraEn: claims.exp * 1000 };
    } catch {
      this.borrarGuardada();
      return null;
    }
  }
}
