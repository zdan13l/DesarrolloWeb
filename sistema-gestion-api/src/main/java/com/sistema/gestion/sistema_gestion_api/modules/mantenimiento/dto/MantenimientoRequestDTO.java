package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.EstadoMantenimiento;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record MantenimientoRequestDTO(
        @Schema(description = "Opcional. Si no se envía, se usa la hora actual.")
        Instant fechaApertura,
        @Schema(description = "No se usa: el servidor la pone al finalizar o cancelar.")
        Instant fechaCierre,
        @Schema(description = "Solo en PUT, para pasar de ABIERTA a EN_PROCESO. Al abrir siempre queda ABIERTA.")
        EstadoMantenimiento estadoMantenimiento,
        @NotBlank(message = "El diagnostico es obligatorio")
        String diagnostico,
        @NotBlank(message = "Las observaciones son obligatorias")
        String observaciones,
        @NotNull(message = "El recurso es obligatorio")
        Long recursoId
) {
}
