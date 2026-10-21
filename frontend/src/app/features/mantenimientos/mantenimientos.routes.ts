import { Routes } from '@angular/router';
import { Pendiente } from '../../shared/pendiente/pendiente';

/** Grupo 3. Cuelga de `/mantenimientos`. Reemplaza `Pendiente` por tus componentes. */
export const MANTENIMIENTOS_ROUTES: Routes = [
  { path: '', component: Pendiente, data: { titulo: 'Mantenimientos', grupo: 3 } },
  { path: 'nuevo', component: Pendiente, data: { titulo: 'Abrir mantenimiento', grupo: 3 } },
  { path: ':id', component: Pendiente, data: { titulo: 'Seguimiento del mantenimiento', grupo: 3 } },
];
