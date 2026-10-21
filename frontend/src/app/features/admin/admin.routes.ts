import { Routes } from '@angular/router';
import { Pendiente } from '../../shared/pendiente/pendiente';

/** Grupo 3. Cuelga de `/admin`. Reemplaza `Pendiente` por tus componentes. */
export const ADMIN_ROUTES: Routes = [
  { path: 'categorias', component: Pendiente, data: { titulo: 'Categorías', grupo: 3 } },
  { path: 'ubicaciones', component: Pendiente, data: { titulo: 'Ubicaciones', grupo: 3 } },
  { path: 'usuarios', component: Pendiente, data: { titulo: 'Usuarios', grupo: 3 } },
];
