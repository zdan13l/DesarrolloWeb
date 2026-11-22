import { Routes } from '@angular/router';
import { rolGuard } from '../../core/auth/auth.guard';
import { RecursoForm } from './recurso-form';

export const RECURSOS_ROUTES: Routes = [
  { path: 'nuevo', component: RecursoForm, canActivate: [rolGuard('ADMINISTRADOR')] },
  { path: ':id/editar', component: RecursoForm, canActivate: [rolGuard('ADMINISTRADOR')] },
];
