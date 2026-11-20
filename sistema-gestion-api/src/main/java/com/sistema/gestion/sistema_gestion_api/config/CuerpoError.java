package com.sistema.gestion.sistema_gestion_api.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Cuerpo JSON único de error: {timestamp, status, error, message, path, errors[]}. */
public final class CuerpoError {

    private CuerpoError() {
    }

    public static Map<String, Object> de(HttpStatusCode status, String message, String path, List<?> errors) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        body.put("error", status instanceof HttpStatus hs ? hs.getReasonPhrase() : "Error");
        body.put("message", message);
        body.put("path", path);
        body.put("errors", errors);
        return body;
    }
}
