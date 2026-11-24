package com.sistema.gestion.sistema_gestion_api.config;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.method.HandlerMethod;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
public class OpenApiConfig {

    private static final String ESQUEMA_BEARER = "bearerAuth";
    private static final String ESQUEMA_ERROR = "Error";
    private static final Pattern ROL = Pattern.compile("'([A-Z]+)'");

    private static final Map<String, String> NOMBRE_ROL = Map.of(
            "SOLICITANTE", "Solicitante",
            "GESTOR", "Gestor",
            "ADMINISTRADOR", "Administrador");

    private static final Map<String, String> PARAMETROS = Map.ofEntries(
            Map.entry("id", "Id del registro."),
            Map.entry("categoriaId", "Muestra solo los recursos de esta categoría."),
            Map.entry("ubicacionId", "Muestra solo los recursos de esta ubicación."),
            Map.entry("tipo", "ESPACIO o EQUIPO."),
            Map.entry("estado", "DISPONIBLE, PRESTADO o BLOQUEADO."),
            Map.entry("fecha", "Día que quieres consultar, en formato AAAA-MM-DD."),
            Map.entry("recursoId", "Muestra solo los registros de este recurso."),
            Map.entry("usuarioId", "Muestra solo los registros de este usuario. A un solicitante siempre se le muestran los suyos."),
            Map.entry("vencidos", "Con true, solo los préstamos activos cuyo plazo ya pasó."),
            Map.entry("activos", "Con true, solo los usuarios activos."),
            Map.entry("habilitarRecurso", "Con true el recurso queda disponible al cerrar; si no, sigue bloqueado."),
            Map.entry("nombre", "Busca las categorías cuyo nombre contenga este texto."),
            Map.entry("edificio", "Muestra solo las ubicaciones de este edificio."));

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("PontiReservas API")
                        .version("1.0")
                        .description("Reservas, préstamos, incidentes y mantenimiento de los recursos del campus.\n\n"
                                + "Para probarla: inicia sesión en `POST /api/auth/login`, copia el `token` de la respuesta "
                                + "y pégalo en el botón **Authorize**."))
                .components(new Components()
                        .addSecuritySchemes(ESQUEMA_BEARER,
                                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT"))
                        .addSchemas(ESQUEMA_ERROR, esquemaError()))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_BEARER));
    }

    @Bean
    public OperationCustomizer documentarSeguridadYErrores() {
        return (operacion, metodo) -> {
            describirParametros(operacion);
            if (!esPublica(metodo)) {
                documentarRoles(operacion, metodo);
            }
            usarEsquemaDeError(operacion);
            ordenarRespuestas(operacion);
            return operacion;
        };
    }

    private boolean esPublica(HandlerMethod metodo) {
        return metodo.hasMethodAnnotation(SecurityRequirements.class);
    }

    private void describirParametros(Operation operacion) {
        if (operacion.getParameters() == null) return;
        operacion.getParameters().stream()
                .filter(p -> p.getDescription() == null && PARAMETROS.containsKey(p.getName()))
                .forEach(p -> p.setDescription(PARAMETROS.get(p.getName())));
    }

    private void documentarRoles(Operation operacion, HandlerMethod metodo) {
        PreAuthorize regla = AnnotatedElementUtils.findMergedAnnotation(metodo.getMethod(), PreAuthorize.class);
        ApiResponses respuestas = operacion.getResponses();
        respuestas.addApiResponse("401", new ApiResponse()
                .description("No hay token, o ya venció. Inicia sesión otra vez."));

        String quien;
        if (regla == null) {
            quien = "cualquier usuario con sesión iniciada.";
        } else {
            quien = String.join(" y ", rolesDe(regla.value())) + ".";
            respuestas.addApiResponse("403", new ApiResponse()
                    .description("Tu rol no puede hacer esta operación."));
        }
        String acceso = "**Quién puede usarlo:** " + quien;
        String descripcion = operacion.getDescription();
        operacion.setDescription(descripcion == null || descripcion.isBlank() ? acceso : descripcion + "\n\n" + acceso);
    }

    private List<String> rolesDe(String expresion) {
        List<String> roles = new ArrayList<>();
        Matcher m = ROL.matcher(expresion);
        while (m.find()) {
            roles.add(NOMBRE_ROL.getOrDefault(m.group(1), m.group(1)));
        }
        return roles;
    }

    private void usarEsquemaDeError(Operation operacion) {
        operacion.getResponses().forEach((codigo, respuesta) -> {
            if (codigo.startsWith("4") || codigo.startsWith("5")) {
                respuesta.setContent(new Content().addMediaType("application/json",
                        new MediaType().schema(new Schema<>().$ref("#/components/schemas/" + ESQUEMA_ERROR))));
            }
        });
    }

    private void ordenarRespuestas(Operation operacion) {
        ApiResponses ordenadas = new ApiResponses();
        operacion.getResponses().entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.naturalOrder()))
                .forEach(e -> ordenadas.addApiResponse(e.getKey(), e.getValue()));
        operacion.setResponses(ordenadas);
    }

    private Schema<?> esquemaError() {
        ObjectSchema campo = new ObjectSchema();
        campo.addProperty("campo", new StringSchema().example("correo"));
        campo.addProperty("mensaje", new StringSchema().example("El correo no tiene un formato valido"));

        ObjectSchema error = new ObjectSchema();
        error.description("Así responde la API cuando algo sale mal.");
        error.addProperty("timestamp", new StringSchema().format("date-time"));
        error.addProperty("status", new IntegerSchema().example(409));
        error.addProperty("error", new StringSchema().example("Conflict"));
        error.addProperty("message", new StringSchema().example("Existe un conflicto de horario con otra reserva confirmada"));
        error.addProperty("path", new StringSchema().example("/api/reservas"));
        error.addProperty("errors", new ArraySchema().items(campo)
                .description("Solo se llena cuando faltan datos o son inválidos (400): un elemento por campo."));
        return error;
    }
}
