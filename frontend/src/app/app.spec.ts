import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  it('should create the app', () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

describe('rutas de la SPA', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding()), provideHttpClient()],
    });
  });

  // Cada ruta del Word (sección 6.2) debe resolver a su pantalla, con el layout alrededor.
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
