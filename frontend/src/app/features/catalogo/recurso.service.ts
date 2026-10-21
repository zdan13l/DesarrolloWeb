import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FiltrosRecurso,
  FranjaOcupada,
  OpcionCatalogo,
  Recurso,
  RecursoRequest,
} from './recurso.model';

@Injectable({ providedIn: 'root' })
export class RecursoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/recursos`;

  listar(filtros: Partial<FiltrosRecurso> = {}): Observable<Recurso[]> {
    let params = new HttpParams();
    if (filtros.categoriaId) params = params.set('categoriaId', filtros.categoriaId);
    if (filtros.ubicacionId) params = params.set('ubicacionId', filtros.ubicacionId);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    return this.http.get<Recurso[]>(this.url, { params });
  }

  obtener(id: number | string): Observable<Recurso> {
    return this.http.get<Recurso>(`${this.url}/${id}`);
  }

  /** Franjas ocupadas (reservas confirmadas y préstamos activos) del día `fecha` (YYYY-MM-DD). */
  disponibilidad(id: number | string, fecha: string): Observable<FranjaOcupada[]> {
    return this.http.get<FranjaOcupada[]>(`${this.url}/${id}/disponibilidad`, {
      params: { fecha },
    });
  }

  crear(recurso: RecursoRequest): Observable<Recurso> {
    return this.http.post<Recurso>(this.url, recurso);
  }

  actualizar(id: number | string, recurso: RecursoRequest): Observable<Recurso> {
    return this.http.put<Recurso>(`${this.url}/${id}`, recurso);
  }

  // Listas propias para los filtros y el formulario (cada feature hace su GET).
  categorias(): Observable<OpcionCatalogo[]> {
    return this.http.get<OpcionCatalogo[]>(`${environment.apiUrl}/categorias`);
  }

  ubicaciones(): Observable<OpcionCatalogo[]> {
    return this.http.get<OpcionCatalogo[]>(`${environment.apiUrl}/ubicaciones`);
  }
}
