package com.sistema.gestion.sistema_gestion_api.modules.indicadores.controller;

import com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs.ConteoDTO;
import com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs.EstadoRecursoDTO;
import com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs.ResumenDTO;
import com.sistema.gestion.sistema_gestion_api.modules.indicadores.service.IndicadoresService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Servicios de solo lectura para el tablero operativo y los indicadores básicos. */
@Tag(name = "Indicadores", description = "Métricas, estadísticas consolidadas y estado operativo de recursos para el dashboard")
@RestController
@RequestMapping("/api/indicadores")
public class IndicadoresController {

    private final IndicadoresService service;

    public IndicadoresController(IndicadoresService service) {
        this.service = service;
    }

    @Operation(summary = "Estado operativo de recursos", description = "Cantidad de recursos por estado operativo")
    @ApiResponse(responseCode = "200", description = "Listado de recursos por estado operativo")    
    @GetMapping("/estado-recursos")
    public List<EstadoRecursoDTO> estadoRecursos() {
        return service.estadoRecursos();
    }

    @Operation(summary = "Reservas por recurso", description = "Cantidad de reservas por recurso")
    @ApiResponse(responseCode = "200", description = "Listado de reservas por recurso")
    @GetMapping("/reservas-por-recurso")
    public List<ConteoDTO> reservasPorRecurso() {
        return service.reservasPorRecurso();
    }

    @Operation(summary = "Reservas por categoría", description = "Cantidad de reservas por categoría de recurso")
    @ApiResponse(responseCode = "200", description = "Listado de reservas por categoría")
    @GetMapping("/reservas-por-categoria")
    public List<ConteoDTO> reservasPorCategoria() {
        return service.reservasPorCategoria();
    }

    @Operation(summary = "Resumen de indicadores", description = "Cantidad total de recursos, reservas y usuarios")
    @ApiResponse(responseCode = "200", description = "Resumen de indicadores")
    @GetMapping("/resumen")
    public ResumenDTO resumen() {
        return service.resumen();
    }
}
