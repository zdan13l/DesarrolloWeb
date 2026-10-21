import { Routes } from '@angular/router';
import { Pendiente } from '../../shared/pendiente/pendiente';

/** Grupo 3. Cuelga de `/incidentes`. Reemplaza `Pendiente` por tus componentes. */
export const INCIDENTES_ROUTES: Routes = [
  { path: '', component: Pendiente, data: { titulo: 'Incidentes', grupo: 3 } },
  { path: 'reportar', component: Pendiente, data: { titulo: 'Reportar incidente', grupo: 3 } },
];
