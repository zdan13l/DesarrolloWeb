import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, filter, finalize, of, switchMap, tap } from 'rxjs';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { Columna, DataTable } from '../../../shared/data-table/data-table';
import { ToastService } from '../../../shared/toast/toast.service';
import { Rol, Usuario, UsuarioRequest } from './usuario.model';
import { UsuarioService } from './usuario.service';

/** CRUD de usuarios (`/admin/usuarios`). */
@Component({
  selector: 'app-usuarios-page',
  imports: [ReactiveFormsModule, DataTable],
  templateUrl: './usuarios-page.html',
})
export class UsuariosPage {
  private readonly servicio = inject(UsuarioService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly recargar$ = new BehaviorSubject<void>(undefined);

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  /** `null`: sin formulario; `'nuevo'`: creando; un usuario: editándolo. */
  protected readonly editando = signal<Usuario | 'nuevo' | null>(null);

  protected readonly roles = toSignal(this.servicio.roles().pipe(catchError(() => of([] as Rol[]))), {
    initialValue: [] as Rol[],
  });

  protected readonly usuarios = toSignal(
    this.recargar$.pipe(
      tap(() => this.cargando.set(true)),
      switchMap(() =>
        this.servicio.listar().pipe(
          catchError(() => of([] as Usuario[])),
          finalize(() => this.cargando.set(false)),
        ),
      ),
    ),
    { initialValue: [] as Usuario[] },
  );

  protected readonly formulario = this.fb.group({
    nombre: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
    apellido: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
    correo: this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(255)]),
    rolId: this.fb.control<number | null>(null, Validators.required),
    activo: this.fb.control(true),
  });

  protected readonly columnas: Columna<Usuario>[] = [
    { clave: 'nombre', etiqueta: 'Nombre', valor: (u) => `${u.nombre} ${u.apellido}` },
    { clave: 'correo', etiqueta: 'Correo' },
    { clave: 'rolNombre', etiqueta: 'Rol' },
    { clave: 'activo', etiqueta: 'Activo', tipo: 'booleano' },
  ];

  protected invalido(campo: 'nombre' | 'apellido' | 'correo' | 'rolId'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected nuevo(): void {
    this.formulario.reset({ nombre: '', apellido: '', correo: '', rolId: null, activo: true });
    this.editando.set('nuevo');
  }

  protected editar(usuario: Usuario): void {
    this.formulario.reset({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rolId: usuario.rolId,
      activo: usuario.activo,
    });
    this.editando.set(usuario);
  }

  protected cerrarFormulario(): void {
    this.editando.set(null);
  }

  protected guardar(): void {
    const destino = this.editando();
    if (destino === null) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const solicitud: UsuarioRequest = {
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      correo: valores.correo.trim(),
      activo: valores.activo,
      rolId: valores.rolId as number,
    };

    this.guardando.set(true);
    const operacion =
      destino === 'nuevo' ? this.servicio.crear(solicitud) : this.servicio.actualizar(destino.id, solicitud);
    operacion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.toast.exito(destino === 'nuevo' ? 'Usuario creado.' : 'Usuario actualizado.');
        this.editando.set(null);
        this.recargar$.next();
      },
      error: () => undefined, // el interceptor ya mostró el mensaje del servidor
    });
  }

  protected eliminar(usuario: Usuario): void {
    this.confirm
      .confirmar({
        titulo: 'Eliminar usuario',
        mensaje: `¿Eliminar a ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer. Si solo quieres que deje de usar el sistema, desactívalo en su lugar.`,
        textoConfirmar: 'Eliminar',
        peligro: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.servicio.eliminar(usuario.id)),
      )
      .subscribe({
        next: () => {
          this.toast.exito('Usuario eliminado.');
          if (this.editando() === usuario) this.editando.set(null);
          this.recargar$.next();
        },
        error: () => undefined, // el interceptor ya mostró el mensaje del servidor
      });
  }
}
