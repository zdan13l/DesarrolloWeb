import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OMITIR_TOAST_ERROR } from '../../core/interceptors/error.interceptor';
import { OpcionRecurso, OpcionUsuario, Reserva, ReservaRequest } from './reserva.model';

/** El 409 de conflicto lo muestra el formulario en línea, no como toast. */
const SIN_TOAST = { context: new HttpContext().set(OMITIR_TOAST_ERROR, true) };

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reservas`;

  listar(filtros: { recursoId?: number; usuarioId?: number } = {}): Observable<Reserva[]> {
    let params = new HttpParams();
    if (filtros.recursoId) params = params.set('recursoId', filtros.recursoId);
    if (filtros.usuarioId) params = params.set('usuarioId', filtros.usuarioId);
    return this.http.get<Reserva[]>(this.url, { params });
  }

  obtener(id: number | string): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.url}/${id}`);
  }

  crear(reserva: ReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.url, reserva, SIN_TOAST);
  }

  actualizar(id: number | string, reserva: ReservaRequest): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.url}/${id}`, reserva, SIN_TOAST);
  }

  cancelar(id: number | string): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.url}/${id}/cancelar`, null);
  }

  // Listas propias para los desplegables del formulario.
  recursos(): Observable<OpcionRecurso[]> {
    return this.http.get<OpcionRecurso[]>(`${environment.apiUrl}/recursos`);
  }

  usuarios(): Observable<OpcionUsuario[]> {
    return this.http.get<OpcionUsuario[]>(`${environment.apiUrl}/usuarios`);
  }
}
