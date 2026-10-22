package com.sistema.gestion.sistema_gestion_api.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Formato único de error: {timestamp, status, error, message, path, errors[]}. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleStatus(ResponseStatusException ex, HttpServletRequest request) {
        return build(ex.getStatusCode(), ex.getReason(), request.getRequestURI(), List.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of("campo", fe.getField(), "mensaje", String.valueOf(fe.getDefaultMessage())))
                .toList();
        return build(HttpStatus.BAD_REQUEST, "Hay campos invalidos en la solicitud", request.getRequestURI(), errors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "El cuerpo de la peticion es ilegible o contiene un valor de enum no valido", request.getRequestURI(), List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, HttpServletRequest request) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrio un error inesperado en el servidor", request.getRequestURI(), List.of());
    }

    // El método build ahora recibe 4 parámetros correctamente (incluyendo el path):
    private ResponseEntity<Map<String, Object>> build(HttpStatusCode status, String message, String path, List<?> errors) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        body.put("error", status instanceof HttpStatus hs ? hs.getReasonPhrase() : "Error");
        body.put("message", message);
        body.put("path", path); // Requisito A6
        body.put("errors", errors);
        return ResponseEntity.status(status).body(body);
    }
}