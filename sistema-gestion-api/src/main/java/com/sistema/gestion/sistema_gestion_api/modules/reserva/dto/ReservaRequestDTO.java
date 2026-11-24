package com.sistema.gestion.sistema_gestion_api.modules.reserva.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record ReservaRequestDTO(
        @NotNull(message = "La fecha y hora de inicio es obligatoria")
        Instant fechaHoraInicio,
        @NotNull(message = "La fecha y hora de fin es obligatoria")
        Instant fechaHoraFin,
        @NotNull(message = "El recurso es obligatorio")
        Long recursoId,
        @Schema(description = "A nombre de quién queda la reserva. Si quien reserva es un solicitante, se usa siempre su propio usuario.")
        @NotNull(message = "El usuario es obligatorio")
        Long usuarioId
) {
}
