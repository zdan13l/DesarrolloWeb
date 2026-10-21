export type TipoRecurso = 'ESPACIO' | 'EQUIPO';
export type ModalidadRecurso = 'RESERVABLE' | 'PRESTABLE' | 'AMBAS';
export type EstadoOperativo = 'DISPONIBLE' | 'PRESTADO' | 'BLOQUEADO';

export interface Recurso {
  id: number;
  nombre: string;
  tipoRecurso: TipoRecurso;
  descripcion: string;
  caracteristicas: string;
  modalidadRecurso: ModalidadRecurso;
  estadoOperativo: EstadoOperativo;
  categoriaId: number;
  categoriaNombre: string;
  ubicacionId: number;
  ubicacionNombre: string;
}

export interface RecursoRequest {
  nombre: string;
  tipoRecurso: TipoRecurso;
  descripcion: string;
  caracteristicas: string;
  modalidadRecurso: ModalidadRecurso;
  estadoOperativo: EstadoOperativo;
  categoriaId: number;
  ubicacionId: number;
}

/** Franja de un día en la que el recurso ya está comprometido. */
export interface FranjaOcupada {
  fechaHoraInicio: string;
  fechaHoraFin: string;
  tipoOcupacion: 'RESERVA' | 'PRESTAMO';
}

/** Filtros del catálogo; un valor vacío o nulo significa "sin filtrar". */
export interface FiltrosRecurso {
  categoriaId: number | null;
  ubicacionId: number | null;
  tipo: TipoRecurso | null;
  estado: EstadoOperativo | null;
}

export interface OpcionCatalogo {
  id: number;
  nombre: string;
}
