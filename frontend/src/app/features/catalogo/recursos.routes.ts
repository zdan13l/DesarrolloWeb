import { Routes } from '@angular/router';
import { Pendiente } from '../../shared/pendiente/pendiente';

/** Grupo 2. Cuelga de `/recursos` (formulario de recurso). Reemplaza `Pendiente` por tus componentes. */
export const RECURSOS_ROUTES: Routes = [
  { path: 'nuevo', component: Pendiente, data: { titulo: 'Nuevo recurso', grupo: 2 } },
  { path: ':id/editar', component: Pendiente, data: { titulo: 'Editar recurso', grupo: 2 } },
];
