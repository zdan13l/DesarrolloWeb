package com.sistema.gestion.sistema_gestion_api.modules.auth.dto;

public record LoginResponseDTO(
        String token,
        String tipo,
        long expiraEnSegundos,
        SesionUsuarioDTO usuario
) {
}
