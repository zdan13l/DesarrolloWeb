export type EstadoMantenimiento = 'ABIERTA' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA';

/** Mientras está en uno de estos estados el mantenimiento admite cambios y mantiene bloqueado el recurso. */
export const ESTADOS_ABIERTOS: readonly EstadoMantenimiento[] = ['ABIERTA', 'EN_PROCESO'];

export function estaAbierto(estado: EstadoMantenimiento): boolean {
  return ESTADOS_ABIERTOS.includes(estado);
}

/** Respuesta de /api/mantenimientos. */
export interface Mantenimiento {
  id: number;
  fechaApertura: string;
  fechaCierre: string | null;
  estadoMantenimiento: EstadoMantenimiento;
  diagnostico: string;
  observaciones: string;
  recursoId: number;
  recursoNombre: string;
}

/** Cuerpo de POST y PUT. El servidor fija el estado inicial y las fechas; `estadoMantenimiento` solo se usa en un PUT para pasar a EN_PROCESO. */
export interface MantenimientoRequest {
  diagnostico: string;
  observaciones: string;
  recursoId: number;
  estadoMantenimiento?: EstadoMantenimiento;
}

/** Lo mínimo de un recurso para elegirlo o para mostrar su estado. */
export interface RecursoOpcion {
  id: number;
  nombre: string;
  estadoOperativo: string;
}
