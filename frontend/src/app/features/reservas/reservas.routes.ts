import { Routes } from '@angular/router';
import { Pendiente } from '../../shared/pendiente/pendiente';

/** Grupo 2. Cuelga de `/reservas`. Reemplaza `Pendiente` por tus componentes. */
export const RESERVAS_ROUTES: Routes = [
  { path: '', component: Pendiente, data: { titulo: 'Reservas', grupo: 2 } },
  { path: 'nueva', component: Pendiente, data: { titulo: 'Nueva reserva', grupo: 2 } },
  { path: ':id/editar', component: Pendiente, data: { titulo: 'Editar reserva', grupo: 2 } },
];
