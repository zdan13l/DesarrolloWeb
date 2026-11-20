package com.sistema.gestion.sistema_gestion_api.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank(message = "El correo es obligatorio")
        String correo,
        @NotBlank(message = "La contrasena es obligatoria")
        String password
) {
}
