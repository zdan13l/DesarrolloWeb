import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of toasts(); track t.id) {
        <div class="toast toast--{{ t.tipo }}" [attr.role]="t.tipo === 'error' ? 'alert' : 'status'">
          <div class="toast__cuerpo">
            <p class="toast__mensaje">{{ t.mensaje }}</p>
            @if (t.detalles.length) {
              <ul class="toast__detalles">
                @for (d of t.detalles; track d) {
                  <li>{{ d }}</li>
                }
              </ul>
            }
          </div>
          <button type="button" class="toast__cerrar" aria-label="Cerrar mensaje" (click)="cerrar(t.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: min(380px, calc(100vw - 32px));
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 14px;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      border-left-width: 4px;
      background: var(--surface);
      box-shadow: 0 6px 20px rgb(0 0 0 / 0.14);
    }
    .toast--exito { border-left-color: var(--ok); }
    .toast--error { border-left-color: var(--danger); }
    .toast--info { border-left-color: var(--primary); }
    .toast__cuerpo { flex: 1; min-width: 0; }
    .toast__mensaje { margin: 0; font-weight: 600; overflow-wrap: anywhere; }
    .toast__detalles { margin: 6px 0 0; padding-left: 18px; color: var(--muted); font-size: 0.875rem; }
    .toast__cerrar {
      border: 0;
      background: none;
      color: var(--muted);
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
    }
  `,
})
export class ToastContainer {
  private readonly servicio = inject(ToastService);
  protected readonly toasts = this.servicio.toasts;

  protected cerrar(id: number): void {
    this.servicio.cerrar(id);
  }
}
