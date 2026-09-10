package com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UbicacionRequestDTO(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotBlank(message = "El edificio es obligatorio")
        String edificio,
        @NotNull(message = "El piso es obligatorio")
        @PositiveOrZero(message = "El piso no puede ser negativo")
        Integer piso,
        String detalle
) {
}
