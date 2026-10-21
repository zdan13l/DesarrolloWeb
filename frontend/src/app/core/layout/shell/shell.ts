import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { ToastContainer } from '../../../shared/toast/toast-container';

interface EnlaceMenu {
  ruta: string;
  etiqueta: string;
  /** El tablero (`/`) solo debe quedar activo en la ruta exacta. */
  exacto?: boolean;
}

interface SeccionMenu {
  titulo?: string;
  enlaces: EnlaceMenu[];
}

/** Marco de toda la aplicación: barra lateral, barra superior, mensajes y diálogo de confirmación. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainer, ConfirmDialog],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  protected readonly menuAbierto = signal(false);

  protected readonly secciones: SeccionMenu[] = [
    {
      enlaces: [
        { ruta: '/', etiqueta: 'Tablero', exacto: true },
        { ruta: '/catalogo', etiqueta: 'Catálogo' },
        { ruta: '/reservas', etiqueta: 'Reservas' },
        { ruta: '/prestamos', etiqueta: 'Préstamos' },
        { ruta: '/incidentes', etiqueta: 'Incidentes' },
        { ruta: '/mantenimientos', etiqueta: 'Mantenimientos' },
      ],
    },
    {
      titulo: 'Administración',
      enlaces: [
        { ruta: '/admin/categorias', etiqueta: 'Categorías' },
        { ruta: '/admin/ubicaciones', etiqueta: 'Ubicaciones' },
        { ruta: '/admin/usuarios', etiqueta: 'Usuarios' },
      ],
    },
  ];

  constructor() {
    // En teléfono el menú se cierra al navegar.
    inject(Router)
      .events.pipe(
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
}
