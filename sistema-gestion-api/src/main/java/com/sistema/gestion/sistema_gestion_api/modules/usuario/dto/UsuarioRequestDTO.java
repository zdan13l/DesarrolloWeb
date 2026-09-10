package com.sistema.gestion.sistema_gestion_api.modules.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioRequestDTO(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotBlank(message = "El apellido es obligatorio")
        String apellido,
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato valido")
        String correo,
        boolean activo,
        @NotNull(message = "El rol es obligatorio")
        Long rolId
) {
}
