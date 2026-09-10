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
    public MantenimientoResponseDTO crear(MantenimientoRequestDTO dto) {
        Mantenimiento mantenimiento = new Mantenimiento();
        aplicarDatos(mantenimiento, dto);
        return toResponse(mantenimientoRepository.save(mantenimiento));
    }

    @Override
    public MantenimientoResponseDTO actualizar(Long id, MantenimientoRequestDTO dto) {
        Mantenimiento mantenimiento = buscarEntidad(id);
        aplicarDatos(mantenimiento, dto);
        return toResponse(mantenimientoRepository.save(mantenimiento));
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
