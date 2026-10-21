import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';
import { NotFound } from './shared/not-found/not-found';

/*
 * Cada área funcional se carga de forma perezosa desde su propio archivo de rutas, así cada grupo
 * edita solo el suyo y este archivo no cambia. Los datos `titulo` y `grupo` de las rutas llegan como
 * inputs a los componentes (withComponentInputBinding), igual que los parámetros como `:id`.
 */
export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        pathMatch: 'full',
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
        loadChildren: () =>
          import('./features/mantenimientos/mantenimientos.routes').then((m) => m.MANTENIMIENTOS_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      { path: '**', component: NotFound },
    ],
  },
];
