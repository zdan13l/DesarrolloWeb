import { Routes } from '@angular/router';
import { MantenimientoDetalle } from './mantenimiento-detalle';
import { MantenimientoForm } from './mantenimiento-form';
import { MantenimientosLista } from './mantenimientos-lista';

// `nuevo` va antes de `:id` para que no se tome como un identificador.
export const MANTENIMIENTOS_ROUTES: Routes = [
  { path: '', component: MantenimientosLista },
  { path: 'nuevo', component: MantenimientoForm },
  { path: ':id', component: MantenimientoDetalle },
];
