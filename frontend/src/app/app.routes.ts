import { Routes } from '@angular/router';
import { autenticadoGuard, inicioGuard, rolGuard } from './core/auth/auth.guard';
import { Login } from './core/auth/login/login';
import { Shell } from './core/layout/shell/shell';
import { AccesoDenegado } from './shared/acceso-denegado/acceso-denegado';
import { NotFound } from './shared/not-found/not-found';

// Cada área se carga de forma perezosa desde su archivo de rutas. Los `data` y los parámetros de ruta
// llegan como inputs de los componentes (withComponentInputBinding).
export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Shell,
    canActivate: [autenticadoGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [inicioGuard],
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'catalogo',
        loadChildren: () => import('./features/catalogo/catalogo.routes').then((m) => m.CATALOGO_ROUTES),
      },
      {
        path: 'recursos',
        loadChildren: () => import('./features/catalogo/recursos.routes').then((m) => m.RECURSOS_ROUTES),
      },
      {
        path: 'reservas',
        loadChildren: () => import('./features/reservas/reservas.routes').then((m) => m.RESERVAS_ROUTES),
      },
      {
        path: 'prestamos',
        loadChildren: () => import('./features/prestamos/prestamos.routes').then((m) => m.PRESTAMOS_ROUTES),
      },
      {
        path: 'incidentes',
        loadChildren: () => import('./features/incidentes/incidentes.routes').then((m) => m.INCIDENTES_ROUTES),
      },
      {
        path: 'mantenimientos',
        canActivate: [rolGuard('GESTOR', 'ADMINISTRADOR')],
        loadChildren: () =>
          import('./features/mantenimientos/mantenimientos.routes').then((m) => m.MANTENIMIENTOS_ROUTES),
      },
      {
        path: 'admin',
        canActivate: [rolGuard('ADMINISTRADOR')],
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      { path: 'acceso-denegado', component: AccesoDenegado },
      { path: '**', component: NotFound },
    ],
  },
];
