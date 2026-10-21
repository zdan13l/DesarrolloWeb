export type TipoIncidente = 'DANO_FISICO' | 'FALLA_FUNCIONAMIENTO' | 'ACCESORIO_FALTANTE' | 'CONDICION_INADECUADA';

export type SeveridadIncidente = 'LEVE' | 'MEDIA' | 'CRITICA';

export const TIPOS_INCIDENTE: readonly { valor: TipoIncidente; etiqueta: string }[] = [
  { valor: 'DANO_FISICO', etiqueta: 'Daño físico' },
  { valor: 'FALLA_FUNCIONAMIENTO', etiqueta: 'Falla de funcionamiento' },
  { valor: 'ACCESORIO_FALTANTE', etiqueta: 'Accesorio faltante' },
  { valor: 'CONDICION_INADECUADA', etiqueta: 'Condición inadecuada' },
];

export const SEVERIDADES: readonly { valor: SeveridadIncidente; etiqueta: string }[] = [
  { valor: 'LEVE', etiqueta: 'Leve' },
  { valor: 'MEDIA', etiqueta: 'Media' },
  { valor: 'CRITICA', etiqueta: 'Crítica (bloquea el recurso)' },
];

/** Respuesta de /api/incidentes. */
export interface Incidente {
  id: number;
  tipoIncidente: TipoIncidente;
  severidadIncidente: SeveridadIncidente;
  descripcion: string;
  fecha: string;
  recursoId: number;
  recursoNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  /** Verdadero si este reporte bloqueó el recurso (RN-04). */
  recursoBloqueado: boolean;
}

/** Cuerpo de POST /api/incidentes. */
export interface IncidenteRequest {
  tipoIncidente: TipoIncidente;
  severidadIncidente: SeveridadIncidente;
  descripcion: string;
  /** ISO-8601 UTC. */
  fecha: string;
  recursoId: number;
  usuarioId: number;
}

/** Lo mínimo de un recurso para elegirlo en un desplegable. */
export interface RecursoOpcion {
  id: number;
  nombre: string;
  estadoOperativo: string;
}

/** Lo mínimo de un usuario para elegirlo en un desplegable. */
export interface UsuarioOpcion {
  id: number;
  nombre: string;
  apellido: string;
}
