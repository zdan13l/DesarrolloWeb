/** Respuesta de /api/usuarios. */
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  rolId: number | null;
  rolNombre: string | null;
}

/** Cuerpo de POST y PUT /api/usuarios. */
export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  rolId: number;
}

/** Respuesta de /api/roles. */
export interface Rol {
  id: number;
  nombre: string;
}
