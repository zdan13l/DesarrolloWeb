/** Estado que muestra el tablero. RESERVADO se calcula en el servidor a partir de las reservas vigentes. */
export type EstadoRecurso = 'DISPONIBLE' | 'RESERVADO' | 'PRESTADO' | 'BLOQUEADO';

export const ESTADOS_RECURSO: readonly EstadoRecurso[] = ['DISPONIBLE', 'RESERVADO', 'PRESTADO', 'BLOQUEADO'];

/** GET /api/indicadores/estado-recursos */
export interface EstadoRecursoFila {
  recursoId: number;
  nombre: string;
  categoria: string;
  ubicacion: string;
  estado: EstadoRecurso;
}

/** GET /api/indicadores/reservas-por-recurso y /reservas-por-categoria */
export interface Conteo {
  id: number;
  nombre: string;
  totalReservas: number;
}

/** GET /api/indicadores/resumen */
export interface Resumen {
  recursosPorEstado: Record<EstadoRecurso, number>;
  devolucionesTardias: number;
  incidentesRegistrados: number;
}
