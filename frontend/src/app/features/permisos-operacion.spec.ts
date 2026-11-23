import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { Rol } from '../core/auth/auth.model';
import { AuthService } from '../core/auth/auth.service';

describe('permisos por rol en las rutas de operación', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding()), provideHttpClient(), provideHttpClientTesting()],
    });
    harness = await RouterTestingHarness.create();
  });

  async function ir(rol: Rol, url: string): Promise<string> {
    const auth = TestBed.inject(AuthService);
    auth.cerrarSesion();
    auth.establecerSesion({
      token: 't',
      expiraEn: Date.now() + 3_600_000,
      usuario: { id: 1, nombre: 'Ana', apellido: 'Martínez', correo: 'ana@campus.edu', rol },
    });
    await harness.navigateByUrl(url);
    return TestBed.inject(Router).url;
  }

  const soloGestion = [
    '/prestamos/entrega',
    '/prestamos/4/devolucion',
    '/incidentes',
    '/mantenimientos',
    '/mantenimientos/nuevo',
    '/mantenimientos/1',
  ];
  const soloAdministrador = [
    '/recursos/nuevo',
    '/recursos/3/editar',
    '/admin/categorias',
    '/admin/ubicaciones',
    '/admin/usuarios',
  ];
  const abiertas = [
    '/catalogo',
    '/catalogo/3',
    '/reservas',
    '/reservas/nueva',
    '/reservas/2/editar',
    '/prestamos',
    '/incidentes/reportar',
  ];

  it.each(abiertas)('%s está abierta a los tres roles', async (url) => {
    expect(await ir('SOLICITANTE', url)).toBe(url);
    expect(await ir('GESTOR', url)).toBe(url);
    expect(await ir('ADMINISTRADOR', url)).toBe(url);
  });

  it.each(soloGestion)('%s exige gestor o administrador', async (url) => {
    expect(await ir('SOLICITANTE', url)).toBe('/acceso-denegado');
    expect(await ir('GESTOR', url)).toBe(url);
    expect(await ir('ADMINISTRADOR', url)).toBe(url);
  });

  it.each(soloAdministrador)('%s exige administrador', async (url) => {
    expect(await ir('SOLICITANTE', url)).toBe('/acceso-denegado');
    expect(await ir('GESTOR', url)).toBe('/acceso-denegado');
    expect(await ir('ADMINISTRADOR', url)).toBe(url);
  });

  it('el tablero (/) es para gestor y administrador; el solicitante pasa al catálogo', async () => {
    expect(await ir('SOLICITANTE', '/')).toBe('/catalogo');
    expect(await ir('GESTOR', '/')).toBe('/');
    expect(await ir('ADMINISTRADOR', '/')).toBe('/');
  });
});
