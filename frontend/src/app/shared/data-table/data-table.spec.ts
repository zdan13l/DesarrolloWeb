import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Columna, DataTable } from './data-table';

interface Recurso {
  nombre: string;
  estadoOperativo: string;
  creado: string | null;
  activo: boolean | null;
}

@Component({
  imports: [DataTable],
  template: `
    <app-data-table [columnas]="columnas" [filas]="filas" [acciones]="acc" mensajeVacio="Sin recursos" />
    <ng-template #acc let-recurso><button class="accion">Editar {{ recurso.nombre }}</button></ng-template>
  `,
})
class Anfitrion {
  columnas: Columna<Recurso>[] = [
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'estadoOperativo', etiqueta: 'Estado', tipo: 'estado' },
    { clave: 'creado', etiqueta: 'Creado', tipo: 'fecha' },
    { clave: 'activo', etiqueta: 'Activo', tipo: 'booleano' },
    { clave: 'calculado', etiqueta: 'Calculado', valor: (r) => r.nombre.length },
  ];
  filas: Recurso[] = [
    { nombre: 'Sala 1', estadoOperativo: 'BLOQUEADO', creado: '2026-10-12T15:30:00Z', activo: true },
    { nombre: 'Proyector', estadoOperativo: 'EN_PROCESO', creado: null, activo: null },
  ];
}

describe('DataTable', () => {
  it('pinta cada tipo de columna, las acciones por fila y los valores calculados', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const filas = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');

    expect(filas).toHaveLength(2);
    const primera = filas[0].textContent ?? '';
    expect(primera).toContain('Sala 1');
    expect(primera).toContain('Bloqueado'); // badge
    expect(primera).toMatch(/12\/10\/2026/); // fecha
    expect(primera).toContain('Sí');
    expect(primera).toContain('6'); // columna calculada
    expect(filas[0].querySelector('.accion')?.textContent).toContain('Editar Sala 1');

    const segunda = filas[1].textContent ?? '';
    expect(segunda).toContain('En proceso');
    expect(segunda).toContain('—'); // fecha y booleano nulos
  });

  it('muestra el mensaje cuando no hay filas', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.filas = [];
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('.tabla__mensaje')?.textContent).toContain(
      'Sin recursos',
    );
  });
});
