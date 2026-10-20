package com.sistema.gestion.sistema_gestion_api.modules.indicadores.controller;

import com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs.ConteoDTO;
import com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs.EstadoRecursoDTO;
import com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto.IndicadoresDTOs.ResumenDTO;
import com.sistema.gestion.sistema_gestion_api.modules.indicadores.service.IndicadoresService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Servicios de solo lectura para el tablero operativo y los indicadores básicos. */
@RestController
@RequestMapping("/api/indicadores")
public class IndicadoresController {

    private final IndicadoresService service;

    public IndicadoresController(IndicadoresService service) {
        this.service = service;
    }

    @GetMapping("/estado-recursos")
    public List<EstadoRecursoDTO> estadoRecursos() {
        return service.estadoRecursos();
    }

    @GetMapping("/reservas-por-recurso")
    public List<ConteoDTO> reservasPorRecurso() {
        return service.reservasPorRecurso();
    }

    @GetMapping("/reservas-por-categoria")
    public List<ConteoDTO> reservasPorCategoria() {
        return service.reservasPorCategoria();
    }

    @GetMapping("/resumen")
    public ResumenDTO resumen() {
        return service.resumen();
    }
}
