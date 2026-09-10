package com.sistema.gestion.sistema_gestion_api.modules.usuario.dto;

public record UsuarioResponseDTO(
        Long id,
        String nombre,
        String apellido,
        String correo,
        boolean activo,
        Long rolId,
        String rolNombre
) {
}
