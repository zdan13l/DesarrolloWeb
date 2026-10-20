package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.service;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.Mantenimiento;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.repository.MantenimientoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.EstadoMantenimiento;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class MantenimientoServiceImpl implements MantenimientoService {

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

    @Override
    @Transactional
    public MantenimientoResponseDTO crear(MantenimientoRequestDTO dto) {
        Mantenimiento mantenimiento = new Mantenimiento();
        aplicarDatos(mantenimiento, dto);
        // RN: abrir una intervención bloquea el recurso hasta finalizarla
        if (dto.estadoMantenimiento() == EstadoMantenimiento.ABIERTA
                || dto.estadoMantenimiento() == EstadoMantenimiento.EN_PROCESO) {
            Recurso recurso = mantenimiento.getRecurso();
            recurso.setEstadoOperativo(EstadoOperativo.BLOQUEADO);
            recursoRepository.save(recurso);
        }
        return toResponse(mantenimientoRepository.save(mantenimiento));
    }

    @Override
    public MantenimientoResponseDTO actualizar(Long id, MantenimientoRequestDTO dto) {
        Mantenimiento mantenimiento = buscarEntidad(id);
        aplicarDatos(mantenimiento, dto);
        return toResponse(mantenimientoRepository.save(mantenimiento));
    }

    @Override
    @Transactional
    public MantenimientoResponseDTO finalizar(Long id, boolean habilitarRecurso) {
        Mantenimiento mantenimiento = buscarEntidad(id);
        validarAbierto(mantenimiento);
        mantenimiento.setEstadoMantenimiento(EstadoMantenimiento.FINALIZADA);
        mantenimiento.setFechaCierre(Instant.now());
        if (habilitarRecurso) {
            Recurso recurso = mantenimiento.getRecurso();
            recurso.setEstadoOperativo(EstadoOperativo.DISPONIBLE);
            recursoRepository.save(recurso);
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

    private void validarAbierto(Mantenimiento mantenimiento) {
        if (mantenimiento.getEstadoMantenimiento() == EstadoMantenimiento.FINALIZADA
                || mantenimiento.getEstadoMantenimiento() == EstadoMantenimiento.CANCELADA) {
            // No se puede cambiar una intervención que ya fue cerrada
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

    private void aplicarDatos(Mantenimiento mantenimiento, MantenimientoRequestDTO dto) {
        mantenimiento.setFechaApertura(dto.fechaApertura());
        mantenimiento.setFechaCierre(dto.fechaCierre());
        mantenimiento.setEstadoMantenimiento(dto.estadoMantenimiento());
        mantenimiento.setDiagnostico(dto.diagnostico());
        mantenimiento.setObservaciones(dto.observaciones());
        mantenimiento.setRecurso(buscarRecurso(dto.recursoId()));
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
