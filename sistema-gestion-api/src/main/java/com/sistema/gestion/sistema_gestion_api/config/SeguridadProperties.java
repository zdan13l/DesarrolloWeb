package com.sistema.gestion.sistema_gestion_api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.seguridad")
public record SeguridadProperties(String jwtSecreto, int jwtExpiracionHoras) {
}
