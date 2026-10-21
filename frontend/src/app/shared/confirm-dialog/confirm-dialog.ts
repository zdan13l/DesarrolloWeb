import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { ConfirmService } from './confirm.service';

/** Va una sola vez en el layout; se controla con ConfirmService. */
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <dialog
      #dlg
      class="dialogo"
      aria-labelledby="dialogo-titulo"
      (cancel)="cancelar($event)"
      (click)="clicEnFondo($event)"
    >
      @if (pendiente(); as p) {
        <div class="dialogo__contenido">
          <h2 id="dialogo-titulo" class="dialogo__titulo">{{ p.opciones.titulo }}</h2>
          <p class="dialogo__mensaje">{{ p.opciones.mensaje }}</p>
          <div class="dialogo__acciones">
            <button type="button" class="btn" (click)="p.resolver(false)">
              {{ p.opciones.textoCancelar ?? 'Cancelar' }}
            </button>
            <button
              type="button"
              class="btn"
              [class.btn--peligro]="p.opciones.peligro"
              [class.btn--primario]="!p.opciones.peligro"
              (click)="p.resolver(true)"
            >
              {{ p.opciones.textoConfirmar ?? 'Confirmar' }}
            </button>
          </div>
        </div>
      }
    </dialog>
  `,
  styles: `
    .dialogo {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0;
      width: min(440px, calc(100vw - 32px));
      background: var(--surface);
      color: var(--text);
      box-shadow: 0 16px 48px rgb(0 0 0 / 0.3);
    }
    .dialogo::backdrop {
      background: rgb(0 0 0 / 0.45);
    }
    .dialogo__contenido {
      padding: 20px;
    }
    .dialogo__titulo {
      margin: 0 0 8px;
      font-size: 1.125rem;
    }
    .dialogo__mensaje {
      margin: 0 0 20px;
      color: var(--muted);
    }
    .dialogo__acciones {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      flex-wrap: wrap;
    }
  `,
})
export class ConfirmDialog {
  private readonly confirm = inject(ConfirmService);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  protected readonly pendiente = this.confirm.pendiente;

  constructor() {
    effect(() => {
      const abierto = this.pendiente() !== null;
      const el = this.dialogo().nativeElement;
      // <dialog> nativo: maneja el foco y la tecla Esc.
      if (typeof el.showModal !== 'function') return;
      if (abierto && !el.open) el.showModal();
      if (!abierto && el.open) el.close();
    });
  }

  /** Esc: se cierra como "cancelar" en vez de dejar el diálogo huérfano. */
  protected cancelar(evento: Event): void {
    evento.preventDefault();
    this.pendiente()?.resolver(false);
  }

  /** Clic sobre el fondo oscuro (el propio <dialog>, no su contenido). */
  protected clicEnFondo(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) {
      this.pendiente()?.resolver(false);
    }
  }
}
