export type EstadoPrestamo = 'ACTIVO' | 'DEVUELTO';
export type EstadoFisico = 'BUENO' | 'REGULAR' | 'DANADO';

export interface Prestamo {
  id: number;
  fechaHoraEntrega: string;
  fechaHoraLimite: string;
  fechaHoraDevolucion: string | null;
  estadoInicial: EstadoFisico;
  estadoFinal: EstadoFisico | null;
  observaciones: string;
  accesorios: string;
  estadoPrestamo: EstadoPrestamo;
  recursoId: number;
  recursoNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  reservaId: number;
  devolucionTardia: boolean | null;
}

/** Entrega (CU5). El estado, la fecha de devolución y el estado final los fija el servidor. */
export interface PrestamoRequest {
  fechaHoraEntrega: string;
  fechaHoraLimite: string;
  estadoInicial: EstadoFisico;
  observaciones: string;
  accesorios: string;
  recursoId: number;
  usuarioId: number;
  reservaId: number;
}

/** Devolución (CU6). */
export interface DevolucionRequest {
  estadoFinal: EstadoFisico;
  observaciones?: string;
}

/** Reserva que puede respaldar una entrega. */
export interface ReservaParaEntrega {
  id: number;
  recursoId: number;
  recursoNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estadoReserva: string;
}
