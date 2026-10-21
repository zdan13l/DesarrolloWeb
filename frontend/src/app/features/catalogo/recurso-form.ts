import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, filter, finalize, of, switchMap } from 'rxjs';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { ToastService } from '../../shared/toast/toast.service';
import { EstadoOperativo, ModalidadRecurso, OpcionCatalogo, RecursoRequest, TipoRecurso } from './recurso.model';
import { RecursoService } from './recurso.service';

const SIN_ESPACIOS = Validators.pattern(/\S/);

type CampoForm = 'nombre' | 'categoriaId' | 'ubicacionId' | 'descripcion' | 'caracteristicas';

/** CU9. Alta y edición de recursos (`/recursos/nuevo` y `/recursos/:id/editar`). */
@Component({
  selector: 'app-recurso-form',
  imports: [ReactiveFormsModule, RouterLink, StatusBadge],
  template: `
    <header class="page-header">
      <h1>{{ esEdicion() ? 'Editar recurso' : 'Nuevo recurso' }}</h1>
      <a class="btn" routerLink="/catalogo">Cancelar</a>
    </header>

    @if (falloCarga()) {
      <p class="alerta alerta--error">No se pudo cargar el recurso a editar.</p>
    }

    <form class="card" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
      <div class="form-grid">
        <div class="form-field" [class.form-field--error]="invalido('nombre')">
          <label for="nombre">Nombre</label>
          <input id="nombre" type="text" formControlName="nombre" />
          @if (invalido('nombre')) {
            <p class="form-error">El nombre es obligatorio.</p>
          }
        </div>

        <div class="form-field">
          <label for="tipo">Tipo</label>
          <select id="tipo" formControlName="tipoRecurso">
            <option value="ESPACIO">Espacio</option>
            <option value="EQUIPO">Equipo</option>
          </select>
        </div>

        <div class="form-field">
          <label for="modalidad">Modalidad</label>
          <select id="modalidad" formControlName="modalidadRecurso">
            <option value="RESERVABLE">Reservable</option>
            <option value="PRESTABLE">Prestable</option>
            <option value="AMBAS">Ambas</option>
          </select>
        </div>

        <div class="form-field" [class.form-field--error]="invalido('categoriaId')">
          <label for="categoria">Categoría</label>
          <select id="categoria" formControlName="categoriaId">
            <option [ngValue]="null">Selecciona…</option>
            @for (c of categorias(); track c.id) {
              <option [ngValue]="c.id">{{ c.nombre }}</option>
            }
          </select>
          @if (invalido('categoriaId')) {
            <p class="form-error">Selecciona una categoría.</p>
          }
        </div>

        <div class="form-field" [class.form-field--error]="invalido('ubicacionId')">
          <label for="ubicacion">Ubicación</label>
          <select id="ubicacion" formControlName="ubicacionId">
            <option [ngValue]="null">Selecciona…</option>
            @for (u of ubicaciones(); track u.id) {
              <option [ngValue]="u.id">{{ u.nombre }}</option>
            }
          </select>
          @if (invalido('ubicacionId')) {
            <p class="form-error">Selecciona una ubicación.</p>
          }
        </div>

        <div class="form-field">
          <span class="etiqueta">Estado operativo</span>
          <div>
            <app-status-badge [estado]="estadoOperativo()" />
            <span class="texto-suave"> Lo gestiona el sistema (préstamos, mantenimientos).</span>
          </div>
        </div>
      </div>

      <div class="form-grid campos-largos">
        <div class="form-field" [class.form-field--error]="invalido('descripcion')">
          <label for="descripcion">Descripción</label>
          <textarea id="descripcion" formControlName="descripcion"></textarea>
          @if (invalido('descripcion')) {
            <p class="form-error">La descripción es obligatoria.</p>
          }
        </div>

        <div class="form-field" [class.form-field--error]="invalido('caracteristicas')">
          <label for="caracteristicas">Características</label>
          <textarea id="caracteristicas" formControlName="caracteristicas"></textarea>
          @if (invalido('caracteristicas')) {
            <p class="form-error">Las características son obligatorias.</p>
          }
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn--primario" [disabled]="guardando()">
          {{ guardando() ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>
  `,
  styles: `
    .etiqueta {
      font-weight: 600;
      font-size: 0.9375rem;
    }
    .campos-largos {
      margin-top: 16px;
    }
  `,
})
export class RecursoForm {
  private readonly servicio = inject(RecursoService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Presente solo en `/recursos/:id/editar`. */
  readonly id = input<string>();

  protected readonly esEdicion = computed(() => !!this.id());
  protected readonly guardando = signal(false);
  protected readonly falloCarga = signal(false);

  // El estado operativo no se edita a mano (CU9): un recurso nuevo nace DISPONIBLE y al editar se conserva.
  protected readonly estadoOperativo = signal<EstadoOperativo>('DISPONIBLE');

  protected readonly categorias = toSignal(this.lista(() => this.servicio.categorias()), { initialValue: [] });
  protected readonly ubicaciones = toSignal(this.lista(() => this.servicio.ubicaciones()), { initialValue: [] });

  protected readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, SIN_ESPACIOS] }),
    tipoRecurso: new FormControl<TipoRecurso>('ESPACIO', { nonNullable: true }),
    modalidadRecurso: new FormControl<ModalidadRecurso>('RESERVABLE', { nonNullable: true }),
    categoriaId: new FormControl<number | null>(null, Validators.required),
    ubicacionId: new FormControl<number | null>(null, Validators.required),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, SIN_ESPACIOS] }),
    caracteristicas: new FormControl('', { nonNullable: true, validators: [Validators.required, SIN_ESPACIOS] }),
  });

  constructor() {
    toObservable(this.id)
      .pipe(
        filter((id): id is string => !!id),
        switchMap((id) => this.servicio.obtener(id)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (recurso) => {
          this.estadoOperativo.set(recurso.estadoOperativo);
          this.form.patchValue(recurso);
        },
        error: () => this.falloCarga.set(true),
      });
  }

  protected invalido(campo: CampoForm): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    const datos: RecursoRequest = {
      ...valores,
      categoriaId: valores.categoriaId as number,
      ubicacionId: valores.ubicacionId as number,
      estadoOperativo: this.estadoOperativo(),
    };

    const id = this.id();
    const peticion = id ? this.servicio.actualizar(id, datos) : this.servicio.crear(datos);
    this.guardando.set(true);
    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (recurso) => {
        this.toast.exito(id ? 'Recurso actualizado' : 'Recurso creado');
        void this.router.navigate(['/catalogo', recurso.id]);
      },
      // El interceptor ya mostró el motivo (400 por campo, 409...); el formulario conserva lo escrito.
      error: () => undefined,
    });
  }

  private lista(origen: () => ReturnType<RecursoService['categorias']>) {
    return origen().pipe(catchError(() => of<OpcionCatalogo[]>([])));
  }
}
