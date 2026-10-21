import { Routes } from '@angular/router';
import { CategoriasPage } from './categorias/categorias-page';
import { UbicacionesPage } from './ubicaciones/ubicaciones-page';
import { UsuariosPage } from './usuarios/usuarios-page';

/** Grupo 3. Cuelga de `/admin`: CRUD de datos maestros. */
export const ADMIN_ROUTES: Routes = [
  { path: 'categorias', component: CategoriasPage },
  { path: 'ubicaciones', component: UbicacionesPage },
  { path: 'usuarios', component: UsuariosPage },
];
