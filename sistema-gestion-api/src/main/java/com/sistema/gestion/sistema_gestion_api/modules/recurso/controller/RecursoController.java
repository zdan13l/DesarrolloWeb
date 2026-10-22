package com.sistema.gestion.sistema_gestion_api.modules.recurso.controller;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.FranjaOcupadaResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.TipoRecurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.service.RecursoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Recursos", description = "Catálogo de recursos, filtros y disponibilidad")

@RestController
@RequestMapping("/api/recursos")
public class RecursoController {

    private final RecursoService recursoService;

    public RecursoController(RecursoService recursoService) {
        this.recursoService = recursoService;
    }

    @Operation(summary = "Listar recursos (catálogo)",
        description = "Filtros opcionales y combinables: categoriaId, ubicacionId, tipo y estado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Listado de recursos"),
        @ApiResponse(responseCode = "400", description = "Valor no válido en tipo o estado")
    })
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<RecursoResponseDTO> listar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long ubicacionId,
            @RequestParam(required = false) TipoRecurso tipo,
            @RequestParam(required = false) EstadoOperativo estado) {
        return recursoService.buscarConFiltros(categoriaId, ubicacionId, tipo, estado);
    }

    @Operation(summary = "Consultar un recurso")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Recurso encontrado"),
        @ApiResponse(responseCode = "404", description = "El recurso no existe")
    })
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public RecursoResponseDTO obtener(@PathVariable Long id) {
        return recursoService.obtenerPorId(id);
    }


    @Operation(summary = "Obtener disponibilidad de un recurso")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Disponibilidad obtenida"),
        @ApiResponse(responseCode = "404", description = "El recurso no existe")
    })
    @GetMapping("/{id}/disponibilidad")
    @ResponseStatus(HttpStatus.OK)
    public List<FranjaOcupadaResponseDTO> obtenerDisponibilidad(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return recursoService.obtenerDisponibilidad(id, fecha);
    }



    @Operation(summary = "Crear recurso")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Recurso creado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "Categoría o ubicación inexistente")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecursoResponseDTO crear(@Valid @RequestBody RecursoRequestDTO dto) {
        return recursoService.crear(dto);
    }


    @Operation(summary = "Actualizar recurso")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Recurso actualizado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "El recurso no existe")
    })
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public RecursoResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody RecursoRequestDTO dto) {
        return recursoService.actualizar(id, dto);
    }

    @Operation(summary = "Eliminar recurso",
        description = "No se elimina si tiene reservas, préstamos, incidentes o mantenimientos asociados")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Recurso eliminado"),
        @ApiResponse(responseCode = "404", description = "El recurso no existe"),
        @ApiResponse(responseCode = "409", description = "El recurso tiene registros asociados")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        recursoService.eliminar(id);
    }
}
