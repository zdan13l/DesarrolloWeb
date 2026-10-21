import { Routes } from '@angular/router';
import { CatalogoLista } from './catalogo-lista';
import { RecursoDetalle } from './recurso-detalle';

/** Grupo 2. Cuelga de `/catalogo`. */
export const CATALOGO_ROUTES: Routes = [
  { path: '', component: CatalogoLista, data: { titulo: 'Catálogo', grupo: 2 } },
  { path: ':id', component: RecursoDetalle, data: { titulo: 'Detalle del recurso', grupo: 2 } },
];
