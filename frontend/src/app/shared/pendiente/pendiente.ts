import { Component, input } from '@angular/core';

/**
 * Página de relleno para las rutas que aún no tienen su pantalla.
 * Cada grupo la reemplaza por su componente en su archivo *.routes.ts.
 * Recibe `titulo` y `grupo` desde `data` de la ruta.
 */
@Component({
  selector: 'app-pendiente',
  template: `
    <header class="page-header">
      <h1>{{ titulo() }}</h1>
    </header>
    <section class="card">
      <p>Esta pantalla aún no está implementada.</p>
      @if (grupo()) {
        <p class="texto-suave">Le corresponde al grupo {{ grupo() }}.</p>
      }
    </section>
  `,
})
export class Pendiente {
  readonly titulo = input('Pendiente');
  readonly grupo = input<number>();
}
