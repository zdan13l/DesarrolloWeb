import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';

describe('App', () => {
  it('should create the app', () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

describe('rutas de la SPA', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding()), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(AuthService).establecerSesion({
      token: 'token-de-prueba',
      expiraEn: Date.now() + 3_600_000,
      usuario: { id: 4, nombre: 'Diego', apellido: 'Ramírez', correo: 'diego@campus.edu', rol: 'ADMINISTRADOR' },
    });
  });

  const casos: [string, string][] = [
    ['/', 'Tablero'],
    ['/catalogo', 'Catálogo'],
    ['/catalogo/5', 'Detalle del recurso'],
    ['/recursos/nuevo', 'Nuevo recurso'],
    ['/recursos/3/editar', 'Editar recurso'],
    ['/reservas', 'Reservas'],
    ['/reservas/nueva', 'Nueva reserva'],
    ['/reservas/2/editar', 'Editar reserva'],
    ['/prestamos', 'Préstamos'],
    ['/prestamos/entrega', 'Registrar entrega'],
    ['/prestamos/4/devolucion', 'Registrar devolución'],
    ['/incidentes', 'Incidentes'],
    ['/incidentes/reportar', 'Reportar incidente'],
    ['/mantenimientos', 'Mantenimientos'],
    ['/mantenimientos/nuevo', 'Abrir mantenimiento'],
    ['/mantenimientos/1', 'Seguimiento del mantenimiento'],
    ['/admin/categorias', 'Categorías'],
    ['/admin/ubicaciones', 'Ubicaciones'],
    ['/admin/usuarios', 'Usuarios'],
    ['/acceso-denegado', 'Acceso denegado'],
    ['/esto-no-existe', 'Página no encontrada'],
  ];

  it.each(casos)('%s muestra "%s"', async (url, titulo) => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    const pagina = harness.routeNativeElement as HTMLElement;
    expect(pagina.querySelector('main h1')?.textContent).toContain(titulo);
    expect(pagina.querySelector('nav')).toBeTruthy();
  });
});

describe('acceso a la SPA', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding()), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('sin sesión lleva al login y recuerda la pantalla pedida', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/reservas');

    const router = TestBed.inject(Router);
    expect(router.url).toBe('/login?returnUrl=%2Freservas');
    expect((harness.routeNativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('PontiReservas');
  });

  it('el login es accesible sin sesión', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login');

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
