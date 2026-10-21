import { Routes } from '@angular/router';
import { IncidenteForm } from './incidente-form';
import { IncidentesLista } from './incidentes-lista';

/** Grupo 3. Cuelga de `/incidentes`. */
export const INCIDENTES_ROUTES: Routes = [
  { path: '', component: IncidentesLista },
  { path: 'reportar', component: IncidenteForm },
];
