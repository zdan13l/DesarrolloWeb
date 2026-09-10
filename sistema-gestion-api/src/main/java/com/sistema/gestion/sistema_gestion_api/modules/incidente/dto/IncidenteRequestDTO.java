package com.sistema.gestion.sistema_gestion_api.modules.incidente.dto;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.SeveridadIncidente;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.TipoIncidente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record IncidenteRequestDTO(
        @NotNull(message = "El tipo de incidente es obligatorio")
        TipoIncidente tipoIncidente,
        @NotNull(message = "La severidad es obligatoria")
        SeveridadIncidente severidadIncidente,
        @NotBlank(message = "La descripcion es obligatoria")
        String descripcion,
        @NotNull(message = "La fecha es obligatoria")
        Instant fecha,
        @NotNull(message = "El recurso es obligatorio")
        Long recursoId,
        @NotNull(message = "El usuario es obligatorio")
        Long usuarioId
) {
}
