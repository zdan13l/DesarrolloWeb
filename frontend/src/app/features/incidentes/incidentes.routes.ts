import { Routes } from '@angular/router';
import { rolGuard } from '../../core/auth/auth.guard';
import { IncidenteForm } from './incidente-form';
import { IncidentesLista } from './incidentes-lista';

// Cualquier rol reporta; solo gestor y administrador consultan los reportes.
export const INCIDENTES_ROUTES: Routes = [
  { path: '', component: IncidentesLista, canActivate: [rolGuard('GESTOR', 'ADMINISTRADOR')] },
  { path: 'reportar', component: IncidenteForm },
];
