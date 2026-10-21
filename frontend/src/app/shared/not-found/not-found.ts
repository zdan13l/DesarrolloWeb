import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <h1>Página no encontrada</h1>
    </header>
    <section class="card">
      <p>La dirección que buscas no existe o fue movida.</p>
      <a class="btn btn--primario" routerLink="/">Volver al tablero</a>
    </section>
  `,
})
export class NotFound {}
