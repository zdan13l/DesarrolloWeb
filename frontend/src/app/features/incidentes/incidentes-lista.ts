import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, map, of, startWith, switchMap, tap } from 'rxjs';
import { Columna, DataTable } from '../../shared/data-table/data-table';
import { Incidente } from './incidente.model';
import { IncidenteService } from './incidente.service';

@Component({
  selector: 'app-incidentes-lista',
  imports: [ReactiveFormsModule, RouterLink, DataTable],
  templateUrl: './incidentes-lista.html',
  styles: `
    .filtros {
      margin-bottom: 16px;
      max-width: 420px;
    }
  `,
})
export class IncidentesLista {
  private readonly servicio = inject(IncidenteService);

  protected readonly cargando = signal(true);
  protected readonly filtroRecurso = new FormControl<number | null>(null);

  protected readonly recursos = toSignal(this.servicio.recursos().pipe(catchError(() => of([]))), {
    initialValue: [],
  });

  /** Cada cambio del filtro lanza una consulta y descarta la anterior si seguía en vuelo. */
  protected readonly incidentes = toSignal(
    this.filtroRecurso.valueChanges.pipe(
      startWith(this.filtroRecurso.value),
      tap(() => this.cargando.set(true)),
      switchMap((recursoId) =>
        this.servicio.listar(recursoId).pipe(
          map((lista) => [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha))),
          catchError(() => of([] as Incidente[])),
          finalize(() => this.cargando.set(false)),
        ),
      ),
    ),
    { initialValue: [] as Incidente[] },
  );

  protected readonly columnas: Columna<Incidente>[] = [
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha' },
    { clave: 'recursoNombre', etiqueta: 'Recurso' },
    { clave: 'tipoIncidente', etiqueta: 'Tipo', tipo: 'estado' },
    { clave: 'severidadIncidente', etiqueta: 'Severidad', tipo: 'estado' },
    { clave: 'descripcion', etiqueta: 'Descripción' },
    { clave: 'usuarioNombre', etiqueta: 'Reportó' },
    { clave: 'recursoBloqueado', etiqueta: 'Bloqueó el recurso', tipo: 'booleano' },
  ];
}
