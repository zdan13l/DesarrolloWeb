import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Ubicacion, UbicacionRequest } from './ubicacion.model';

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ubicaciones`;

  listar(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(this.url);
  }

  crear(ubicacion: UbicacionRequest): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(this.url, ubicacion);
  }

  actualizar(id: number, ubicacion: UbicacionRequest): Observable<Ubicacion> {
    return this.http.put<Ubicacion>(`${this.url}/${id}`, ubicacion);
  }

  /** 409 si la ubicación todavía tiene recursos. */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
