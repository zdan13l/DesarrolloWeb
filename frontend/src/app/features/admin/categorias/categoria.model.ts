/** Respuesta de /api/categorias. */
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

/** Cuerpo de POST y PUT /api/categorias. */
export interface CategoriaRequest {
  nombre: string;
  descripcion: string | null;
}
