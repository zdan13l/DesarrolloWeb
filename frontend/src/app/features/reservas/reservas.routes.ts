import { Routes } from '@angular/router';
import { ReservaForm } from './reserva-form';
import { ReservasLista } from './reservas-lista';

/** Grupo 2. Cuelga de `/reservas`. */
export const RESERVAS_ROUTES: Routes = [
  { path: '', component: ReservasLista, data: { titulo: 'Reservas', grupo: 2 } },
  { path: 'nueva', component: ReservaForm, data: { titulo: 'Nueva reserva', grupo: 2 } },
  { path: ':id/editar', component: ReservaForm, data: { titulo: 'Editar reserva', grupo: 2 } },
];
