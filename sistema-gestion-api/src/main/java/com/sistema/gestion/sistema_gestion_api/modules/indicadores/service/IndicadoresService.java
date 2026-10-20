package com.sistema.gestion.sistema_gestion_api.modules.indicadores.service;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.repository.IncidenteRepository;
import com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs.ConteoDTO;
import com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs.EstadoRecursoDTO;
import com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs.ResumenDTO;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.repository.PrestamoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.repository.ReservaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class IndicadoresService {

    private static final String DTO = "com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs$ConteoDTO";

    @PersistenceContext
    private EntityManager em;

    private final RecursoRepository recursoRepository;
    private final ReservaRepository reservaRepository;
    private final PrestamoRepository prestamoRepository;
    private final IncidenteRepository incidenteRepository;

    public IndicadoresService(RecursoRepository recursoRepository, ReservaRepository reservaRepository,
                              PrestamoRepository prestamoRepository, IncidenteRepository incidenteRepository) {
        this.recursoRepository = recursoRepository;
        this.reservaRepository = reservaRepository;
        this.prestamoRepository = prestamoRepository;
        this.incidenteRepository = incidenteRepository;
    }

    /** BLOQUEADO / PRESTADO (campo del recurso), RESERVADO (reserva en curso ahora) o DISPONIBLE. */
    public List<EstadoRecursoDTO> estadoRecursos() {
        Instant ahora = Instant.now();
        return recursoRepository.findAll().stream().map(r -> {
            String estado = r.getEstadoOperativo().name();
            if (r.getEstadoOperativo() == EstadoOperativo.DISPONIBLE
                    && !reservaRepository.findSolapamientos(r.getId(), ahora, ahora).isEmpty()) {
                estado = "RESERVADO";
            }
            return new EstadoRecursoDTO(r.getId(), r.getNombre(), r.getCategoria().getNombre(),
                    r.getUbicacion().getNombre(), estado);
        }).toList();
    }

    /** Número de reservas por recurso (consulta JPQL con GROUP BY), de mayor a menor. */
    public List<ConteoDTO> reservasPorRecurso() {
        return em.createQuery("SELECT new " + DTO + "(r.id, r.nombre, COUNT(rs)) "
                + "FROM Recurso r LEFT JOIN Reserva rs ON rs.recurso = r "
                + "GROUP BY r.id, r.nombre ORDER BY COUNT(rs) DESC, r.nombre", ConteoDTO.class).getResultList();
    }

    /** Número de reservas por categoría, sumando las de todos sus recursos. */
    public List<ConteoDTO> reservasPorCategoria() {
        return em.createQuery("SELECT new " + DTO + "(c.id, c.nombre, COUNT(rs)) "
                + "FROM Categoria c LEFT JOIN Recurso r ON r.categoria = c LEFT JOIN Reserva rs ON rs.recurso = r "
                + "GROUP BY c.id, c.nombre ORDER BY COUNT(rs) DESC, c.nombre", ConteoDTO.class).getResultList();
    }

    /** Totales de recursos por estado, devoluciones tardías e incidentes registrados. */
    public ResumenDTO resumen() {
        Map<String, Long> porEstado = new LinkedHashMap<>();
        for (String e : List.of("DISPONIBLE", "RESERVADO", "PRESTADO", "BLOQUEADO")) {
            porEstado.put(e, 0L);
        }
        estadoRecursos().forEach(e -> porEstado.merge(e.estado(), 1L, Long::sum));
        long tardias = prestamoRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getDevolucionTardia())).count();
        return new ResumenDTO(porEstado, tardias, incidenteRepository.count());
    }
}
