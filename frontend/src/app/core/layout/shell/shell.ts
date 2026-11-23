import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Rol } from '../../auth/auth.model';
import { AuthService } from '../../auth/auth.service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { ToastContainer } from '../../../shared/toast/toast-container';

interface EnlaceMenu {
  ruta: string;
  etiqueta: string;
  /** El tablero (`/`) solo debe quedar activo en la ruta exacta. */
  exacto?: boolean;
  /** Roles que ven el enlace; sin indicar, lo ven todos. */
  roles?: Rol[];
}

interface SeccionMenu {
  titulo?: string;
  /** Roles que ven la sección; sin indicar, la ven todos. */
  roles?: Rol[];
  enlaces: EnlaceMenu[];
}

const GESTION: Rol[] = ['GESTOR', 'ADMINISTRADOR'];

const ETIQUETA_ROL: Record<Rol, string> = {
  SOLICITANTE: 'Solicitante',
  GESTOR: 'Gestor',
  ADMINISTRADOR: 'Administrador',
};

/** Marco de toda la aplicación: barra lateral, barra superior, mensajes y diálogo de confirmación. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainer, ConfirmDialog],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  protected readonly menuAbierto = signal(false);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly usuario = this.auth.usuario;

  private readonly secciones: SeccionMenu[] = [
    {
      enlaces: [
        { ruta: '/', etiqueta: 'Tablero', exacto: true, roles: GESTION },
        { ruta: '/catalogo', etiqueta: 'Catálogo' },
        { ruta: '/reservas', etiqueta: 'Reservas' },
        { ruta: '/prestamos', etiqueta: 'Préstamos' },
        { ruta: '/incidentes', etiqueta: 'Incidentes', roles: GESTION },
        { ruta: '/incidentes/reportar', etiqueta: 'Reportar incidente', roles: ['SOLICITANTE'] },
        { ruta: '/mantenimientos', etiqueta: 'Mantenimientos', roles: GESTION },
      ],
    },
    {
      titulo: 'Administración',
      roles: ['ADMINISTRADOR'],
      enlaces: [
        { ruta: '/admin/categorias', etiqueta: 'Categorías' },
        { ruta: '/admin/ubicaciones', etiqueta: 'Ubicaciones' },
        { ruta: '/admin/usuarios', etiqueta: 'Usuarios' },
      ],
    },
  ];

  /** Menú según el rol de la sesión: solo lo que el usuario puede abrir. */
  protected readonly seccionesVisibles = computed(() => {
    const rol = this.auth.rol();
    const visible = (roles?: Rol[]) => roles === undefined || (rol !== null && roles.includes(rol));
    return this.secciones
      .filter((seccion) => visible(seccion.roles))
      .map((seccion) => ({ ...seccion, enlaces: seccion.enlaces.filter((enlace) => visible(enlace.roles)) }))
      .filter((seccion) => seccion.enlaces.length > 0);
  });

  constructor() {
    // En teléfono el menú se cierra al navegar.
    this.router.events.pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.menuAbierto.set(false));
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected etiquetaRol(rol: Rol): string {
    return ETIQUETA_ROL[rol];
  }

  /** Termina la sesión y lleva al login sin recordar la pantalla actual. */
  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigate(['/login']);
  }
}
