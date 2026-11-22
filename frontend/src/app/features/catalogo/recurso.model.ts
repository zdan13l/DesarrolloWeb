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

export interface FranjaOcupada {
  fechaHoraInicio: string;
  fechaHoraFin: string;
  tipoOcupacion: 'RESERVA' | 'PRESTAMO';
}

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
