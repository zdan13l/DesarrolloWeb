import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <h1>Acceso denegado</h1>
    </header>
    <section class="card">
      <p>Tu rol no tiene permisos para ver esta pantalla.</p>
      <a class="btn btn--primario" routerLink="/">Volver al tablero</a>
    </section>
  `,
})
export class AccesoDenegado {}
