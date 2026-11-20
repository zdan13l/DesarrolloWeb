package com.sistema.gestion.sistema_gestion_api.modules.auth.dto;

public record SesionUsuarioDTO(
        Long id,
        String nombre,
        String apellido,
        String correo,
        String rol
) {
}
