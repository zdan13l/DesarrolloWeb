/** Respuesta de /api/ubicaciones. */
export interface Ubicacion {
  id: number;
  nombre: string;
  edificio: string;
  piso: number;
  detalle: string | null;
}

/** Cuerpo de POST y PUT /api/ubicaciones. */
export interface UbicacionRequest {
  nombre: string;
  edificio: string;
  piso: number;
  detalle: string | null;
}
