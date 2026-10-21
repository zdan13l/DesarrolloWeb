import { Routes } from '@angular/router';
import { Pendiente } from '../../shared/pendiente/pendiente';

/** Grupo 2. Cuelga de `/catalogo`. Reemplaza `Pendiente` por tus componentes. */
export const CATALOGO_ROUTES: Routes = [
  { path: '', component: Pendiente, data: { titulo: 'Catálogo', grupo: 2 } },
  { path: ':id', component: Pendiente, data: { titulo: 'Detalle del recurso', grupo: 2 } },
];
