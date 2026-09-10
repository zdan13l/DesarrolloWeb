package com.sistema.gestion.sistema_gestion_api.modules.incidente.dto;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.SeveridadIncidente;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.TipoIncidente;

import java.time.Instant;

public record IncidenteResponseDTO(
        Long id,
        TipoIncidente tipoIncidente,
        SeveridadIncidente severidadIncidente,
        String descripcion,
        Instant fecha,
        Long recursoId,
        String recursoNombre,
        Long usuarioId,
        String usuarioNombre
) {
}
