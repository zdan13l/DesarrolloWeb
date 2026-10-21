package com.sistema.gestion.sistema_gestion_api.modules.reserva.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record ReservaRequestDTO(
        @NotNull(message = "La fecha y hora de inicio es obligatoria")
        Instant fechaHoraInicio,
        @NotNull(message = "La fecha y hora de fin es obligatoria")
        Instant fechaHoraFin,
        @NotNull(message = "El recurso es obligatorio")
        Long recursoId,
        @NotNull(message = "El usuario es obligatorio")
        Long usuarioId
) {
}
