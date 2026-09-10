package com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto;

public record UbicacionResponseDTO(
        Long id,
        String nombre,
        String edificio,
        int piso,
        String detalle
) {
}
