import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { autenticadoGuard, inicioGuard, rolGuard } from './auth.guard';
import { Rol } from './auth.model';
import { AuthService } from './auth.service';

@Component({ template: 'zona' })
class Zona {}

describe('guards de autenticación', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: Zona },
          { path: 'acceso-denegado', component: Zona },
          { path: 'catalogo', component: Zona },
          { path: 'inicio', component: Zona, canActivate: [inicioGuard] },
          { path: 'privada', component: Zona, canActivate: [autenticadoGuard] },
          { path: 'gestion', component: Zona, canActivate: [autenticadoGuard, rolGuard('GESTOR', 'ADMINISTRADOR')] },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  function iniciarSesion(rol: Rol): void {
    TestBed.inject(AuthService).establecerSesion({
      token: 't',
      expiraEn: Date.now() + 3_600_000,
      usuario: { id: 1, nombre: 'Ana', apellido: 'Martínez', correo: 'ana@campus.edu', rol },
    });
  }

  it('autenticadoGuard deja pasar con sesión', async () => {
    iniciarSesion('SOLICITANTE');
    await RouterTestingHarness.create('/privada');

    expect(TestBed.inject(Router).url).toBe('/privada');
  });

  it('autenticadoGuard redirige al login sin sesión', async () => {
    await RouterTestingHarness.create('/privada');

    expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2Fprivada');
  });

  it('rolGuard deja pasar a un rol permitido', async () => {
    iniciarSesion('GESTOR');
    await RouterTestingHarness.create('/gestion');

    expect(TestBed.inject(Router).url).toBe('/gestion');
  });

  it('rolGuard lleva a acceso denegado a un rol no permitido', async () => {
    iniciarSesion('SOLICITANTE');
    await RouterTestingHarness.create('/gestion');

    expect(TestBed.inject(Router).url).toBe('/acceso-denegado');
  });

  it.each(['GESTOR', 'ADMINISTRADOR'] as Rol[])('inicioGuard deja entrar al tablero a %s', async (rol) => {
    iniciarSesion(rol);
    await RouterTestingHarness.create('/inicio');

    expect(TestBed.inject(Router).url).toBe('/inicio');
  });

  it('inicioGuard lleva al solicitante al catálogo', async () => {
    iniciarSesion('SOLICITANTE');
    await RouterTestingHarness.create('/inicio');

    expect(TestBed.inject(Router).url).toBe('/catalogo');
  });
});
