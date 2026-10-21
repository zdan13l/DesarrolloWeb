import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Mantenimiento, MantenimientoRequest, RecursoOpcion } from './mantenimiento.model';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/mantenimientos`;

  listar(recursoId?: number | null): Observable<Mantenimiento[]> {
    let params = new HttpParams();
    if (recursoId != null) {
      params = params.set('recursoId', recursoId);
    }
    return this.http.get<Mantenimiento[]>(this.url, { params });
  }

  obtener(id: number): Observable<Mantenimiento> {
    return this.http.get<Mantenimiento>(`${this.url}/${id}`);
  }

  /** Abre la intervención: el servidor la deja ABIERTA y bloquea el recurso. */
  crear(solicitud: MantenimientoRequest): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.url, solicitud);
  }

  actualizar(id: number, solicitud: MantenimientoRequest): Observable<Mantenimiento> {
    return this.http.put<Mantenimiento>(`${this.url}/${id}`, solicitud);
  }

  /** RN-05: con `habilitarRecurso` el recurso queda DISPONIBLE; sin él sigue BLOQUEADO. */
  finalizar(id: number, habilitarRecurso: boolean): Observable<Mantenimiento> {
    return this.http.patch<Mantenimiento>(`${this.url}/${id}/finalizar`, null, {
      params: { habilitarRecurso },
    });
  }

  cancelar(id: number): Observable<Mantenimiento> {
    return this.http.patch<Mantenimiento>(`${this.url}/${id}/cancelar`, null);
  }

  recursos(): Observable<RecursoOpcion[]> {
    return this.http.get<RecursoOpcion[]>(`${environment.apiUrl}/recursos`);
  }

  recurso(id: number): Observable<RecursoOpcion> {
    return this.http.get<RecursoOpcion>(`${environment.apiUrl}/recursos/${id}`);
  }

  /** Pasa un recurso BLOQUEADO a DISPONIBLE (RN-05) cuando el mantenimiento ya se cerró. */
  habilitarRecurso(recursoId: number): Observable<RecursoOpcion> {
    return this.http.patch<RecursoOpcion>(`${environment.apiUrl}/recursos/${recursoId}/habilitar`, null);
  }
}
