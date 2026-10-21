import { Routes } from '@angular/router';
import { Pendiente } from '../../shared/pendiente/pendiente';

/** Grupo 3. Raíz `/`: estado de recursos e indicadores. Reemplaza `Pendiente` por tus componentes. */
export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: Pendiente, data: { titulo: 'Tablero', grupo: 3 } },
];
