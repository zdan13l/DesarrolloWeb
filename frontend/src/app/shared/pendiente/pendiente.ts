import { Component, input } from '@angular/core';

/** Página de relleno para una ruta sin pantalla; muestra el `titulo` y el `grupo` recibidos desde `data`. */
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
