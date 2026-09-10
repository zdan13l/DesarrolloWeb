package com.sistema.gestion.sistema_gestion_api.modules.incidente.controller;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.dto.IncidenteRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.dto.IncidenteResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.service.IncidenteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidentes")
public class IncidenteController {

    private final IncidenteService incidenteService;

    public IncidenteController(IncidenteService incidenteService) {
        this.incidenteService = incidenteService;
    }

    @GetMapping
    public List<IncidenteResponseDTO> listar(@RequestParam(required = false) Long recursoId) {
        if (recursoId != null) {
            return incidenteService.buscarPorRecurso(recursoId);
        }
        return incidenteService.listarTodos();
    }

    @GetMapping("/{id}")
    public IncidenteResponseDTO obtener(@PathVariable Long id) {
        return incidenteService.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenteResponseDTO crear(@Valid @RequestBody IncidenteRequestDTO dto) {
        return incidenteService.crear(dto);
    }

    @PutMapping("/{id}")
    public IncidenteResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody IncidenteRequestDTO dto) {
        return incidenteService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        incidenteService.eliminar(id);
    }
}
