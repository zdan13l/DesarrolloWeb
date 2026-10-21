import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conteo, EstadoRecursoFila, Resumen } from './indicador.model';

@Injectable({ providedIn: 'root' })
export class IndicadorService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/indicadores`;

  estadoRecursos(): Observable<EstadoRecursoFila[]> {
    return this.http.get<EstadoRecursoFila[]>(`${this.url}/estado-recursos`);
  }

  reservasPorRecurso(): Observable<Conteo[]> {
    return this.http.get<Conteo[]>(`${this.url}/reservas-por-recurso`);
  }

  reservasPorCategoria(): Observable<Conteo[]> {
    return this.http.get<Conteo[]>(`${this.url}/reservas-por-categoria`);
  }

  resumen(): Observable<Resumen> {
    return this.http.get<Resumen>(`${this.url}/resumen`);
  }
}
