import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Rol } from '../../auth/auth.model';
import { AuthService } from '../../auth/auth.service';
import { Shell } from './shell';

@Component({ template: 'login' })
class LoginFalso {}

describe('Shell (menú lateral)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'login', component: LoginFalso }]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  async function crear(rol: Rol) {
    TestBed.inject(AuthService).establecerSesion({
      token: 't',
      expiraEn: Date.now() + 3_600_000,
      usuario: { id: 1, nombre: 'Ana', apellido: 'Martínez', correo: 'ana@campus.edu', rol },
    });
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function enlaces(raiz: HTMLElement): string[] {
    return Array.from(raiz.querySelectorAll('.lateral__enlace')).map((a) => a.textContent?.trim() ?? '');
  }

  it('solicitante: catálogo, reservas, préstamos y reportar incidente, sin administración', async () => {
    const raiz = await crear('SOLICITANTE');

    expect(enlaces(raiz)).toEqual(['Catálogo', 'Reservas', 'Préstamos', 'Reportar incidente']);
    expect(raiz.querySelector('.lateral__titulo')).toBeNull();
  });

  it('gestor: agrega tablero, incidentes y mantenimientos, sin administración', async () => {
    const raiz = await crear('GESTOR');

    expect(enlaces(raiz)).toEqual(['Tablero', 'Catálogo', 'Reservas', 'Préstamos', 'Incidentes', 'Mantenimientos']);
    expect(raiz.querySelector('.lateral__titulo')).toBeNull();
  });

  it('administrador: ve todo, incluida la sección de administración', async () => {
    const raiz = await crear('ADMINISTRADOR');

    expect(enlaces(raiz)).toEqual([
      'Tablero',
      'Catálogo',
      'Reservas',
      'Préstamos',
      'Incidentes',
      'Mantenimientos',
      'Categorías',
      'Ubicaciones',
      'Usuarios',
    ]);
    expect(raiz.querySelector('.lateral__titulo')?.textContent).toContain('Administración');
  });

  it('muestra el nombre y el rol del usuario de la sesión', async () => {
    const raiz = await crear('GESTOR');

    expect(raiz.querySelector('.lateral__nombre')?.textContent).toContain('Ana Martínez');
    expect(raiz.querySelector('.lateral__rol')?.textContent).toContain('Gestor');
  });

  it('cerrar sesión borra la sesión y lleva al login', async () => {
    const raiz = await crear('GESTOR');
    const auth = TestBed.inject(AuthService);

    raiz.querySelector<HTMLButtonElement>('.lateral__salir')!.click();
    await TestBed.inject(Router).navigateByUrl('/login');

    expect(auth.haySesion()).toBe(false);
    expect(auth.usuario()).toBeNull();
    expect(localStorage.getItem('pontireservas.sesion')).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('sin sesión no muestra el bloque de usuario', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('.lateral__usuario')).toBeNull();
  });
});
