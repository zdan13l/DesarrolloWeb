package com.sistema.gestion.sistema_gestion_api.modules.reserva.dto;

import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.EstadoReserva;

import java.time.Instant;

public record ReservaResponseDTO(
        Long id,
        Instant fechaHoraInicio,
        Instant fechaHoraFin,
        Instant fechaCreacion,
        EstadoReserva estadoReserva,
        Long recursoId,
        String recursoNombre,
        Long usuarioId,
        String usuarioNombre
) {
}
