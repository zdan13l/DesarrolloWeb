package com.sistema.gestion.sistema_gestion_api.modules.auth.model;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

/** Roles de acceso del sistema. Se obtienen de la primera palabra del nombre del rol guardado en base de datos. */
public enum RolSistema {
    SOLICITANTE,
    GESTOR,
    ADMINISTRADOR;

    public static Optional<RolSistema> desdeNombre(String nombreRol) {
        if (nombreRol == null || nombreRol.isBlank()) {
            return Optional.empty();
        }
        String primeraPalabra = nombreRol.trim().split("\\s+")[0];
        String codigo = Normalizer.normalize(primeraPalabra, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT);
        return Arrays.stream(values()).filter(rol -> rol.name().equals(codigo)).findFirst();
    }
}
