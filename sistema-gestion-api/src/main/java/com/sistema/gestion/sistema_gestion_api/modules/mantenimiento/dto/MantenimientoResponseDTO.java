package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.EstadoMantenimiento;

import java.time.Instant;

public record MantenimientoResponseDTO(
        Long id,
        Instant fechaApertura,
        Instant fechaCierre,
        EstadoMantenimiento estadoMantenimiento,
        String diagnostico,
        String observaciones,
        Long recursoId,
        String recursoNombre
) {
}
