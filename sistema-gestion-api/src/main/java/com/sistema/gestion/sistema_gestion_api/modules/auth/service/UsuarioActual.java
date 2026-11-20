package com.sistema.gestion.sistema_gestion_api.modules.auth.service;

import com.sistema.gestion.sistema_gestion_api.config.ManejadorErroresSeguridad;
import com.sistema.gestion.sistema_gestion_api.config.SecurityConfig;
import com.sistema.gestion.sistema_gestion_api.modules.auth.model.RolSistema;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/** Usuario autenticado en la petición en curso, leído del token. Para reglas como "solo puede ver lo suyo". */
@Component
public class UsuarioActual {

    public Long id() {
        return Long.valueOf(jwt().getSubject());
    }

    public RolSistema rol() {
        return RolSistema.valueOf(jwt().getClaimAsString(SecurityConfig.CLAIM_ROL));
    }

    public boolean esSolicitante() {
        return rol() == RolSistema.SOLICITANTE;
    }

    private Jwt jwt() {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacion != null && autenticacion.getPrincipal() instanceof Jwt jwt) {
            return jwt;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, ManejadorErroresSeguridad.MENSAJE_NO_AUTENTICADO);
    }
}
