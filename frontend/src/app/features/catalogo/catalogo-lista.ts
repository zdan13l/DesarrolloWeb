import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, startWith, switchMap, tap } from 'rxjs';
import { Columna, DataTable } from '../../shared/data-table/data-table';
import { EstadoOperativo, FiltrosRecurso, OpcionCatalogo, Recurso, TipoRecurso } from './recurso.model';
import { RecursoService } from './recurso.service';

/** CU1. Catálogo con filtros por categoría, ubicación, tipo y estado. */
@Component({
  selector: 'app-catalogo-lista',
  imports: [ReactiveFormsModule, RouterLink, DataTable],
  template: `
    <header class="page-header">
      <h1>Catálogo</h1>
      <a class="btn btn--primario" routerLink="/recursos/nuevo">Nuevo recurso</a>
    </header>

    <form class="card" [formGroup]="filtros">
      <div class="form-grid">
        <div class="form-field">
          <label for="f-categoria">Categoría</label>
          <select id="f-categoria" formControlName="categoriaId">
            <option [ngValue]="null">Todas</option>
            @for (c of categorias(); track c.id) {
              <option [ngValue]="c.id">{{ c.nombre }}</option>
            }
          </select>
        </div>
        <div class="form-field">
          <label for="f-ubicacion">Ubicación</label>
          <select id="f-ubicacion" formControlName="ubicacionId">
            <option [ngValue]="null">Todas</option>
            @for (u of ubicaciones(); track u.id) {
              <option [ngValue]="u.id">{{ u.nombre }}</option>
            }
          </select>
        </div>
        <div class="form-field">
          <label for="f-tipo">Tipo</label>
          <select id="f-tipo" formControlName="tipo">
            <option [ngValue]="null">Todos</option>
            @for (t of tipos; track t.valor) {
              <option [ngValue]="t.valor">{{ t.etiqueta }}</option>
            }
          </select>
        </div>
        <div class="form-field">
          <label for="f-estado">Estado</label>
          <select id="f-estado" formControlName="estado">
            <option [ngValue]="null">Todos</option>
            @for (e of estados; track e.valor) {
              <option [ngValue]="e.valor">{{ e.etiqueta }}</option>
            }
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn--pequeno" (click)="limpiar()">Limpiar filtros</button>
      </div>
    </form>

    <section class="card">
      <app-data-table
        [columnas]="columnas"
        [filas]="recursos()"
        [cargando]="cargando()"
        [acciones]="acciones"
        mensajeVacio="Ningún recurso coincide con los filtros."
      />
      <ng-template #acciones let-recurso>
        <a class="btn btn--pequeno" [routerLink]="['/catalogo', recurso.id]">Ver detalle</a>
      </ng-template>
    </section>
  `,
})
export class CatalogoLista {
  private readonly servicio = inject(RecursoService);

  protected readonly tipos: { valor: TipoRecurso; etiqueta: string }[] = [
    { valor: 'ESPACIO', etiqueta: 'Espacio' },
    { valor: 'EQUIPO', etiqueta: 'Equipo' },
  ];
  protected readonly estados: { valor: EstadoOperativo; etiqueta: string }[] = [
    { valor: 'DISPONIBLE', etiqueta: 'Disponible' },
    { valor: 'PRESTADO', etiqueta: 'Prestado' },
    { valor: 'BLOQUEADO', etiqueta: 'Bloqueado' },
  ];

  protected readonly filtros = new FormGroup({
    categoriaId: new FormControl<number | null>(null),
    ubicacionId: new FormControl<number | null>(null),
    tipo: new FormControl<TipoRecurso | null>(null),
    estado: new FormControl<EstadoOperativo | null>(null),
  });

  protected readonly cargando = signal(true);

  protected readonly categorias = toSignal(this.opciones(this.servicio.categorias()), { initialValue: [] });
  protected readonly ubicaciones = toSignal(this.opciones(this.servicio.ubicaciones()), { initialValue: [] });

  /**
   * Una consulta por cambio de filtros: debounceTime junta los clics seguidos, distinctUntilChanged evita
   * repetir la misma consulta y switchMap descarta la respuesta anterior si llega una nueva.
   */
  protected readonly recursos = toSignal(
    this.filtros.valueChanges.pipe(
      debounceTime(300),
      startWith(null),
      map((): FiltrosRecurso => this.filtros.getRawValue()),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(() => this.cargando.set(true)),
      switchMap((filtros) =>
        this.servicio.listar(filtros).pipe(
          // El interceptor ya avisó del error; la lista queda vacía y los filtros siguen activos.
          catchError(() => of<Recurso[]>([])),
          finalize(() => this.cargando.set(false)),
        ),
      ),
    ),
    { initialValue: [] as Recurso[] },
  );

  protected readonly columnas: Columna<Recurso>[] = [
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'tipoRecurso', etiqueta: 'Tipo', valor: (r) => (r.tipoRecurso === 'ESPACIO' ? 'Espacio' : 'Equipo') },
    { clave: 'categoriaNombre', etiqueta: 'Categoría' },
    { clave: 'ubicacionNombre', etiqueta: 'Ubicación' },
    { clave: 'modalidadRecurso', etiqueta: 'Modalidad', valor: (r) => r.modalidadRecurso.toLowerCase() },
    { clave: 'estadoOperativo', etiqueta: 'Estado', tipo: 'estado' },
  ];

  protected limpiar(): void {
    this.filtros.reset();
  }

  private opciones(origen: ReturnType<RecursoService['categorias']>) {
    return origen.pipe(
      map((lista): OpcionCatalogo[] => lista),
      catchError(() => of<OpcionCatalogo[]>([])),
    );
  }
}
