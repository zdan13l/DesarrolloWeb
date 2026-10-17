package com.sistema.gestion.sistema_gestion_api.modules.recurso.dto;

import java.time.Instant;

public record FranjaOcupadaResponseDTO(
        Instant fechaHoraInicio,
        Instant fechaHoraFin,
        String tipoOcupacion
) {
}
