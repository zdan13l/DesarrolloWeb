package com.sistema.gestion.sistema_gestion_api.modules.categoria.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoriaRequestDTO(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        String descripcion
) {
}
