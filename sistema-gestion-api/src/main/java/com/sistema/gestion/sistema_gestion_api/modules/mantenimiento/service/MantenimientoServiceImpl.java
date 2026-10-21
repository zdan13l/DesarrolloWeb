package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.service;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.EstadoMantenimiento;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.Mantenimiento;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.repository.MantenimientoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
public class MantenimientoServiceImpl implements MantenimientoService {

    private static final Set<EstadoMantenimiento> ESTADOS_ABIERTOS =
            Set.of(EstadoMantenimiento.ABIERTA, EstadoMantenimiento.EN_PROCESO);

    private final MantenimientoRepository mantenimientoRepository;
    private final RecursoRepository recursoRepository;

    public MantenimientoServiceImpl(MantenimientoRepository mantenimientoRepository,
                                     RecursoRepository recursoRepository) {
        this.mantenimientoRepository = mantenimientoRepository;
        this.recursoRepository = recursoRepository;
    }

    @Override
    public List<MantenimientoResponseDTO> listarTodos() {
        return mantenimientoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public MantenimientoResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Override
    public List<MantenimientoResponseDTO> buscarPorRecurso(Long recursoId) {
        return mantenimientoRepository.findByRecursoId(recursoId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Abre la intervención en estado ABIERTA y bloquea el recurso hasta que se finalice. */
    @Override
    @Transactional
    public MantenimientoResponseDTO crear(MantenimientoRequestDTO dto) {
        Recurso recurso = buscarRecurso(dto.recursoId());

        if (recurso.getEstadoOperativo() == EstadoOperativo.PRESTADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El recurso está PRESTADO: registre su devolución antes de abrir el mantenimiento");
        }
        if (mantenimientoRepository.existsByRecursoIdAndEstadoMantenimientoIn(recurso.getId(), ESTADOS_ABIERTOS)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El recurso ya tiene un mantenimiento abierto");
        }

        Mantenimiento mantenimiento = new Mantenimiento();
        mantenimiento.setRecurso(recurso);
        mantenimiento.setFechaApertura(dto.fechaApertura() != null ? dto.fechaApertura() : Instant.now());
        mantenimiento.setEstadoMantenimiento(EstadoMantenimiento.ABIERTA);
        mantenimiento.setDiagnostico(dto.diagnostico());
        mantenimiento.setObservaciones(dto.observaciones());

        recurso.setEstadoOperativo(EstadoOperativo.BLOQUEADO);
        recursoRepository.save(recurso);

        return toResponse(mantenimientoRepository.save(mantenimiento));
    }

    /**
     * Actualiza el diagnóstico y las observaciones, o pasa de ABIERTA a EN_PROCESO.
     * Cerrar la intervención se hace solo con {@code finalizar} o {@code cancelar}.
     */
    @Override
    @Transactional
    public MantenimientoResponseDTO actualizar(Long id, MantenimientoRequestDTO dto) {
        Mantenimiento mantenimiento = buscarEntidad(id);
        validarAbierto(mantenimiento);

        if (!mantenimiento.getRecurso().getId().equals(dto.recursoId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede cambiar el recurso de un mantenimiento existente");
        }

        EstadoMantenimiento nuevo = dto.estadoMantenimiento();
        if (nuevo != null && nuevo != mantenimiento.getEstadoMantenimiento()) {
            if (nuevo == EstadoMantenimiento.FINALIZADA || nuevo == EstadoMantenimiento.CANCELADA) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Para cerrar el mantenimiento use las acciones finalizar o cancelar");
            }
            if (nuevo == EstadoMantenimiento.ABIERTA) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Un mantenimiento EN_PROCESO no puede volver a ABIERTA");
            }
            mantenimiento.setEstadoMantenimiento(nuevo);
        }

        mantenimiento.setDiagnostico(dto.diagnostico());
        mantenimiento.setObservaciones(dto.observaciones());
        return toResponse(mantenimientoRepository.save(mantenimiento));
    }

    /** RN-05: al finalizar, el gestor decide si el recurso queda DISPONIBLE o sigue BLOQUEADO. */
    @Override
    @Transactional
    public MantenimientoResponseDTO finalizar(Long id, boolean habilitarRecurso) {
        Mantenimiento mantenimiento = buscarEntidad(id);
        validarAbierto(mantenimiento);
        mantenimiento.setEstadoMantenimiento(EstadoMantenimiento.FINALIZADA);
        mantenimiento.setFechaCierre(Instant.now());
        if (habilitarRecurso) {
            Recurso recurso = mantenimiento.getRecurso();
            if (recurso.getEstadoOperativo() == EstadoOperativo.BLOQUEADO) {
                recurso.setEstadoOperativo(EstadoOperativo.DISPONIBLE);
                recursoRepository.save(recurso);
            }
        }
        return toResponse(mantenimientoRepository.save(mantenimiento));
    }

    @Override
    @Transactional
    public MantenimientoResponseDTO cancelar(Long id) {
        Mantenimiento mantenimiento = buscarEntidad(id);
        validarAbierto(mantenimiento);
        mantenimiento.setEstadoMantenimiento(EstadoMantenimiento.CANCELADA);
        mantenimiento.setFechaCierre(Instant.now());
        return toResponse(mantenimientoRepository.save(mantenimiento));
    }

    /** Una intervención ya cerrada (FINALIZADA o CANCELADA) no admite más cambios. */
    private void validarAbierto(Mantenimiento mantenimiento) {
        if (!ESTADOS_ABIERTOS.contains(mantenimiento.getEstadoMantenimiento())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El mantenimiento ya está " + mantenimiento.getEstadoMantenimiento());
        }
    }

    @Override
    public void eliminar(Long id) {
        if (!mantenimientoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Mantenimiento no encontrado: " + id);
        }
        mantenimientoRepository.deleteById(id);
    }

    private Mantenimiento buscarEntidad(Long id) {
        return mantenimientoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mantenimiento no encontrado: " + id));
    }

    private Recurso buscarRecurso(Long id) {
        return recursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso no encontrado: " + id));
    }

    private MantenimientoResponseDTO toResponse(Mantenimiento mantenimiento) {
        return new MantenimientoResponseDTO(
                mantenimiento.getId(),
                mantenimiento.getFechaApertura(),
                mantenimiento.getFechaCierre(),
                mantenimiento.getEstadoMantenimiento(),
                mantenimiento.getDiagnostico(),
                mantenimiento.getObservaciones(),
                mantenimiento.getRecurso().getId(),
                mantenimiento.getRecurso().getNombre()
        );
    }
}
