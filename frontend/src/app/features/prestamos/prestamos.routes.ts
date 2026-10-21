import { Routes } from '@angular/router';
import { PrestamoDevolucion } from './prestamo-devolucion';
import { PrestamoEntrega } from './prestamo-entrega';
import { PrestamosLista } from './prestamos-lista';

/** Grupo 2. Cuelga de `/prestamos`. */
export const PRESTAMOS_ROUTES: Routes = [
  { path: '', component: PrestamosLista, data: { titulo: 'Préstamos', grupo: 2 } },
  { path: 'entrega', component: PrestamoEntrega, data: { titulo: 'Registrar entrega', grupo: 2 } },
  { path: ':id/devolucion', component: PrestamoDevolucion, data: { titulo: 'Registrar devolución', grupo: 2 } },
];
