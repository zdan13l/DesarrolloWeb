package com.sistema.gestion.sistema_gestion_api;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Ayuda para pruebas con seguridad: obtiene el token de un usuario del DataSeeder haciendo login real.
 *
 * <pre>mvc.perform(get("/api/reservas").with(AuthTestSupport.como(mvc, Perfil.SOLICITANTE)))</pre>
 */
public final class AuthTestSupport {

    public enum Perfil {
        SOLICITANTE("ana.martinez@campus.edu", "solicitante123", 1L),
        OTRO_SOLICITANTE("luis.perez@campus.edu", "solicitante123", 2L),
        GESTOR("camila.rojas@campus.edu", "gestor12345", 3L),
        ADMINISTRADOR("diego.ramirez@campus.edu", "admin12345", 4L);

        private final String correo;
        private final String password;
        private final long usuarioId;

        Perfil(String correo, String password, long usuarioId) {
            this.correo = correo;
            this.password = password;
            this.usuarioId = usuarioId;
        }

        public String correo() {
            return correo;
        }

        public String password() {
            return password;
        }

        public long usuarioId() {
            return usuarioId;
        }
    }

    private static final Map<Perfil, String> TOKENS = new ConcurrentHashMap<>();

    private AuthTestSupport() {
    }

    public static String token(MockMvc mvc, Perfil perfil) {
        return TOKENS.computeIfAbsent(perfil, p -> iniciarSesion(mvc, p));
    }

    /** Hace que la petición se envíe con el token del perfil indicado. */
    public static RequestPostProcessor como(MockMvc mvc, Perfil perfil) {
        String token = token(mvc, perfil);
        return request -> {
            request.removeHeader(HttpHeaders.AUTHORIZATION);
            request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token);
            return request;
        };
    }

    /** Envía exactamente el texto indicado como token, sin pedir login (para probar tokens inválidos). */
    public static RequestPostProcessor conTokenCrudo(String token) {
        return request -> {
            request.removeHeader(HttpHeaders.AUTHORIZATION);
            request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token);
            return request;
        };
    }

    /** Hace que la petición se envíe sin credenciales, aunque la prueba tenga un usuario por defecto. */
    public static RequestPostProcessor sinToken() {
        return request -> {
            request.removeHeader(HttpHeaders.AUTHORIZATION);
            return request;
        };
    }

    private static String iniciarSesion(MockMvc mvc, Perfil perfil) {
        try {
            String cuerpo = """
                    {"correo":"%s","password":"%s"}
                    """.formatted(perfil.correo(), perfil.password());
            String respuesta = mvc.perform(post("/api/auth/login").with(sinToken())
                            .contentType(MediaType.APPLICATION_JSON).content(cuerpo))
                    .andReturn().getResponse().getContentAsString();
            return com.jayway.jsonpath.JsonPath.parse(respuesta).read("$.token", String.class);
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo iniciar sesion como " + perfil, e);
        }
    }
}
