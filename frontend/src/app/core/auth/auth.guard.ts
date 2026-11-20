import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from './auth.model';
import { AuthService } from './auth.service';

/** Exige una sesión vigente; si no la hay, lleva al login y recuerda a dónde se quería ir. */
export const autenticadoGuard: CanActivateFn = (_ruta, estado) => {
  if (inject(AuthService).haySesion()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } });
};

/** Exige que el usuario tenga alguno de los roles indicados: `canActivate: [rolGuard('GESTOR', 'ADMINISTRADOR')]`. */
export function rolGuard(...roles: Rol[]): CanActivateFn {
  return () => {
    if (inject(AuthService).tieneRol(...roles)) {
      return true;
    }
    return inject(Router).createUrlTree(['/acceso-denegado']);
  };
}
