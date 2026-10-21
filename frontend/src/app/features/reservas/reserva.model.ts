export type EstadoReserva = 'CONFIRMADA' | 'FINALIZADA' | 'CANCELADA';

export interface Reserva {
  id: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  fechaCreacion: string;
  estadoReserva: EstadoReserva;
  recursoId: number;
  recursoNombre: string;
  usuarioId: number;
  usuarioNombre: string;
}

/** El estado no se envía: el servidor crea la reserva CONFIRMADA y solo cambia con `cancelar`. */
export interface ReservaRequest {
  fechaHoraInicio: string;
  fechaHoraFin: string;
  recursoId: number;
  usuarioId: number;
}

export interface OpcionRecurso {
  id: number;
  nombre: string;
}

export interface OpcionUsuario {
  id: number;
  nombre: string;
  apellido: string;
}
