import { Routes } from '@angular/router';
import { RecursoForm } from './recurso-form';

/** Grupo 2. Cuelga de `/recursos` (formulario de recurso). */
export const RECURSOS_ROUTES: Routes = [
  { path: 'nuevo', component: RecursoForm, data: { titulo: 'Nuevo recurso', grupo: 2 } },
  { path: ':id/editar', component: RecursoForm, data: { titulo: 'Editar recurso', grupo: 2 } },
];
