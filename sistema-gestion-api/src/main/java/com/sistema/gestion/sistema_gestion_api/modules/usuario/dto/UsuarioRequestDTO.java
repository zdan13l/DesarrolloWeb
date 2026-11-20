package com.sistema.gestion.sistema_gestion_api.modules.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioRequestDTO(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotBlank(message = "El apellido es obligatorio")
        String apellido,
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato valido")
        String correo,
        @Size(min = 8, max = 72, message = "La contrasena debe tener entre 8 y 72 caracteres")
        String password,
        boolean activo,
        @NotNull(message = "El rol es obligatorio")
        Long rolId
) {
}
