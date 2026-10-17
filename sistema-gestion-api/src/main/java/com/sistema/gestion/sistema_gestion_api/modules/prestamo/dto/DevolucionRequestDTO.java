package com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto;

import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.EstadoFisico;
import jakarta.validation.constraints.NotNull;

public record DevolucionRequestDTO(
        @NotNull(message = "El estado final es obligatorio")
        EstadoFisico estadoFinal,
        String observaciones
) {
}
