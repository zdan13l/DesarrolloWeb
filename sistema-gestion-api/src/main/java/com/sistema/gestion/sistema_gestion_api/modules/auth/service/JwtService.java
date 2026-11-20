package com.sistema.gestion.sistema_gestion_api.modules.auth.service;

import com.sistema.gestion.sistema_gestion_api.config.SecurityConfig;
import com.sistema.gestion.sistema_gestion_api.config.SeguridadProperties;
import com.sistema.gestion.sistema_gestion_api.modules.auth.model.RolSistema;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

/** Genera los tokens JWT: el subject es el id del usuario y el claim `rol` su RolSistema. */
@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final Duration duracion;

    public JwtService(JwtEncoder encoder, SeguridadProperties propiedades) {
        this.encoder = encoder;
        this.duracion = Duration.ofHours(propiedades.jwtExpiracionHoras());
    }

    public String generar(Long usuarioId, String correo, String nombreCompleto, RolSistema rol) {
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(usuarioId))
                .issuedAt(ahora)
                .expiresAt(ahora.plus(duracion))
                .claim("correo", correo)
                .claim("nombre", nombreCompleto)
                .claim(SecurityConfig.CLAIM_ROL, rol.name())
                .build();
        JwsHeader cabecera = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(cabecera, claims)).getTokenValue();
    }

    public long expiracionEnSegundos() {
        return duracion.toSeconds();
    }
}
