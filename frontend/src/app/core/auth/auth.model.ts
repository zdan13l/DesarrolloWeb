export type Rol = 'SOLICITANTE' | 'GESTOR' | 'ADMINISTRADOR';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  usuario: UsuarioSesion;
}

export interface Sesion {
  token: string;
  usuario: UsuarioSesion;
  /** Momento en que vence el token, en milisegundos desde 1970. */
  expiraEn: number;
}
