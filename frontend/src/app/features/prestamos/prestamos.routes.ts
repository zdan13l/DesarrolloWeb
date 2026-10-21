import { Routes } from '@angular/router';
import { Pendiente } from '../../shared/pendiente/pendiente';

/** Grupo 2. Cuelga de `/prestamos`. Reemplaza `Pendiente` por tus componentes. */
export const PRESTAMOS_ROUTES: Routes = [
  { path: '', component: Pendiente, data: { titulo: 'Préstamos', grupo: 2 } },
  { path: 'entrega', component: Pendiente, data: { titulo: 'Registrar entrega', grupo: 2 } },
  { path: ':id/devolucion', component: Pendiente, data: { titulo: 'Registrar devolución', grupo: 2 } },
];
