import { Routes } from '@angular/router';
import { rolGuard } from '../../core/auth/auth.guard';
import { PrestamoDevolucion } from './prestamo-devolucion';
import { PrestamoEntrega } from './prestamo-entrega';
import { PrestamosLista } from './prestamos-lista';

export const PRESTAMOS_ROUTES: Routes = [
  { path: '', component: PrestamosLista },
  { path: 'entrega', component: PrestamoEntrega, canActivate: [rolGuard('GESTOR', 'ADMINISTRADOR')] },
  { path: ':id/devolucion', component: PrestamoDevolucion, canActivate: [rolGuard('GESTOR', 'ADMINISTRADOR')] },
];
