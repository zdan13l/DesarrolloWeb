import { Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { mensajeDeError } from '../../models/api-error';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  /** Pantalla a la que volver tras entrar (query param `returnUrl`). */
  readonly returnUrl = input<string>();

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    correo: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', Validators.required),
  });

  /** Solo se acepta una ruta interna de la aplicación como destino. */
  private readonly destino = computed(() => {
    const url = this.returnUrl();
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
  });

  protected invalido(campo: 'correo' | 'password'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected entrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { correo, password } = this.formulario.getRawValue();

    this.enviando.set(true);
    this.error.set(null);
    this.auth
      .login({ correo: correo.trim(), password })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.destino()),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }
}
