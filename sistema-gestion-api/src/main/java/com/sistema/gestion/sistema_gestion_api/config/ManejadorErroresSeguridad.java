package com.sistema.gestion.sistema_gestion_api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

/** Responde 401 y 403 con el formato único de error cuando la seguridad corta la petición antes del controller. */
@Component
public class ManejadorErroresSeguridad implements AuthenticationEntryPoint, AccessDeniedHandler {

    public static final String MENSAJE_NO_AUTENTICADO = "Debes iniciar sesion con un token valido para acceder a este recurso";
    public static final String MENSAJE_PROHIBIDO = "No tienes permisos para realizar esta operacion";

    private final ObjectMapper objectMapper;

    public ManejadorErroresSeguridad(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception)
            throws IOException {
        escribir(request, response, HttpStatus.UNAUTHORIZED, MENSAJE_NO_AUTENTICADO);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException exception)
            throws IOException {
        escribir(request, response, HttpStatus.FORBIDDEN, MENSAJE_PROHIBIDO);
    }

    private void escribir(HttpServletRequest request, HttpServletResponse response, HttpStatus status, String mensaje)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(),
                CuerpoError.de(status, mensaje, request.getRequestURI(), List.of()));
    }
}
