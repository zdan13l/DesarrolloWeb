import { Routes } from '@angular/router';
import { CatalogoLista } from './catalogo-lista';
import { RecursoDetalle } from './recurso-detalle';

export const CATALOGO_ROUTES: Routes = [
  { path: '', component: CatalogoLista },
  { path: ':id', component: RecursoDetalle },
];
