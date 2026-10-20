package com.sistema.gestion.sistema_gestion_api.modules.indicadores.dto;

import java.util.Map;

public final class IndicadoresDTOs {

    private IndicadoresDTOs() {
    }

    public record EstadoRecursoDTO(Long recursoId, String nombre, String categoria, String ubicacion, String estado) {
    }

    public record ConteoDTO(Long id, String nombre, Long totalReservas) {
    }

    public record ResumenDTO(Map<String, Long> recursosPorEstado, long devolucionesTardias, long incidentesRegistrados) {
    }
}
