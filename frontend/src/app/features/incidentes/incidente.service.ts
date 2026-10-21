import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Incidente, IncidenteRequest, RecursoOpcion, UsuarioOpcion } from './incidente.model';

@Injectable({ providedIn: 'root' })
export class IncidenteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/incidentes`;

  listar(recursoId?: number | null): Observable<Incidente[]> {
    let params = new HttpParams();
    if (recursoId != null) {
      params = params.set('recursoId', recursoId);
    }
    return this.http.get<Incidente[]>(this.url, { params });
  }

  crear(incidente: IncidenteRequest): Observable<Incidente> {
    return this.http.post<Incidente>(this.url, incidente);
  }

  /** Recursos para el filtro de la lista y el formulario de reporte. */
  recursos(): Observable<RecursoOpcion[]> {
    return this.http.get<RecursoOpcion[]>(`${environment.apiUrl}/recursos`);
  }

  /** Usuarios activos que pueden figurar como quien reporta. */
  usuariosActivos(): Observable<UsuarioOpcion[]> {
    return this.http.get<UsuarioOpcion[]>(`${environment.apiUrl}/usuarios`, { params: { activos: true } });
  }
}
