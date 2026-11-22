import { Routes } from '@angular/router';
import { ReservaForm } from './reserva-form';
import { ReservasLista } from './reservas-lista';

export const RESERVAS_ROUTES: Routes = [
  { path: '', component: ReservasLista },
  { path: 'nueva', component: ReservaForm },
  { path: ':id/editar', component: ReservaForm },
];
