package com.sistema.gestion.sistema_gestion_api.modules.incidente.controller;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.dto.IncidenteRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.dto.IncidenteResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.service.IncidenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Incidentes", description = "Reporte de daños o fallas de los recursos")
@RestController
@RequestMapping("/api/incidentes")
public class IncidenteController {

    private final IncidenteService incidenteService;

    public IncidenteController(IncidenteService incidenteService) {
        this.incidenteService = incidenteService;
    }

    @Operation(summary = "Listar incidentes", description = "Filtro opcional por recurso")
    @ApiResponse(responseCode = "200", description = "Listado de incidentes")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<IncidenteResponseDTO> listar(@RequestParam(required = false) Long recursoId) {
        if (recursoId != null) {
            return incidenteService.buscarPorRecurso(recursoId);
        }
        return incidenteService.listarTodos();
    }

    @Operation(summary = "Consultar un incidente")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Incidente encontrado"),
        @ApiResponse(responseCode = "404", description = "El incidente no existe")
    })
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public IncidenteResponseDTO obtener(@PathVariable Long id) {
        return incidenteService.obtenerPorId(id);
    }

    @Operation(summary = "Reportar incidente")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Incidente registrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "Recurso inexistente")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenteResponseDTO crear(@Valid @RequestBody IncidenteRequestDTO dto) {
        return incidenteService.crear(dto);
    }

    @Operation(summary = "Actualizar incidente")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Incidente actualizado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "El incidente o el recurso no existe")
    })
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public IncidenteResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody IncidenteRequestDTO dto) {
        return incidenteService.actualizar(id, dto);
    }

    @Operation(summary = "Eliminar incidente")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Incidente eliminado"),
        @ApiResponse(responseCode = "404", description = "El incidente no existe")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        incidenteService.eliminar(id);
    }
}
