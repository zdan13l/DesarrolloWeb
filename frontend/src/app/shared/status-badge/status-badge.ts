import { Component, computed, input } from '@angular/core';

type Tono = 'ok' | 'info' | 'warn' | 'danger' | 'neutral';

const TONOS: Record<string, Tono> = {
  // Recursos
  DISPONIBLE: 'ok',
  RESERVADO: 'info',
  PRESTADO: 'warn',
  BLOQUEADO: 'danger',
  // Reservas
  CONFIRMADA: 'ok',
  FINALIZADA: 'neutral',
  CANCELADA: 'neutral',
  // Préstamos
  ACTIVO: 'info',
  DEVUELTO: 'ok',
  // Mantenimientos
  ABIERTA: 'warn',
  EN_PROCESO: 'info',
  // Severidad de incidentes
  LEVE: 'neutral',
  MEDIA: 'warn',
  CRITICA: 'danger',
  // Estado físico
  BUENO: 'ok',
  REGULAR: 'warn',
  DANADO: 'danger',
};

const ETIQUETAS: Record<string, string> = {
  CRITICA: 'Crítica',
  DANADO: 'Dañado',
  DANO_FISICO: 'Daño físico',
  FALLA_FUNCIONAMIENTO: 'Falla de funcionamiento',
  ACCESORIO_FALTANTE: 'Accesorio faltante',
  CONDICION_INADECUADA: 'Condición inadecuada',
};

/** Etiqueta de color para cualquier enum del backend: <app-status-badge [estado]="r.estadoOperativo" /> */
@Component({
  selector: 'app-status-badge',
  template: `<span class="badge badge--{{ tono() }}">{{ etiqueta() }}</span>`,
  styles: `
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge--ok {
      background: var(--ok-soft);
      color: var(--ok);
    }
    .badge--info {
      background: var(--primary-soft);
      color: var(--primary);
    }
    .badge--warn {
      background: var(--warn-soft);
      color: var(--warn);
    }
    .badge--danger {
      background: var(--danger-soft);
      color: var(--danger);
    }
    .badge--neutral {
      background: var(--neutral-soft);
      color: var(--muted);
    }
  `,
})
export class StatusBadge {
  readonly estado = input<string | null | undefined>();

  protected readonly tono = computed<Tono>(() => TONOS[this.estado() ?? ''] ?? 'neutral');

  protected readonly etiqueta = computed(() => {
    const valor = this.estado();
    if (!valor) return '—';
    if (ETIQUETAS[valor]) return ETIQUETAS[valor];
    const texto = valor.replaceAll('_', ' ').toLowerCase();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  });
}
