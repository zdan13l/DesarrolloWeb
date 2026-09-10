package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.EstadoMantenimiento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record MantenimientoRequestDTO(
        @NotNull(message = "La fecha de apertura es obligatoria")
        Instant fechaApertura,
        Instant fechaCierre,
        @NotNull(message = "El estado del mantenimiento es obligatorio")
        EstadoMantenimiento estadoMantenimiento,
        @NotBlank(message = "El diagnostico es obligatorio")
        String diagnostico,
        @NotBlank(message = "Las observaciones son obligatorias")
        String observaciones,
        @NotNull(message = "El recurso es obligatorio")
        Long recursoId
) {
}
