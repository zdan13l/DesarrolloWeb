import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OMITIR_TOAST_ERROR } from '../../core/interceptors/error.interceptor';
import { DevolucionRequest, Prestamo, PrestamoRequest, ReservaParaEntrega } from './prestamo.model';

/** Los 409 (RN-03, recurso bloqueado, ya devuelto) los muestra el formulario en línea. */
const SIN_TOAST = { context: new HttpContext().set(OMITIR_TOAST_ERROR, true) };

@Injectable({ providedIn: 'root' })
export class PrestamoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/prestamos`;

  listar(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(this.url);
  }

  /** Préstamos activos cuyo plazo ya venció. */
  vencidos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(this.url, { params: { vencidos: true } });
  }

  obtener(id: number | string): Observable<Prestamo> {
    return this.http.get<Prestamo>(`${this.url}/${id}`);
  }

  entregar(prestamo: PrestamoRequest): Observable<Prestamo> {
    return this.http.post<Prestamo>(this.url, prestamo, SIN_TOAST);
  }

  devolver(id: number | string, devolucion: DevolucionRequest): Observable<Prestamo> {
    return this.http.patch<Prestamo>(`${this.url}/${id}/devolucion`, devolucion, SIN_TOAST);
  }

  // Lista propia: la entrega parte de una reserva confirmada.
  reservasConfirmadas(): Observable<ReservaParaEntrega[]> {
    return this.http
      .get<ReservaParaEntrega[]>(`${environment.apiUrl}/reservas`)
      .pipe(map((reservas) => reservas.filter((r) => r.estadoReserva === 'CONFIRMADA')));
  }
}
