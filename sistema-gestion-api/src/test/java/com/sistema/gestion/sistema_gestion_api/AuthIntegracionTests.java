package com.sistema.gestion.sistema_gestion_api;

import com.sistema.gestion.sistema_gestion_api.AuthTestSupport.Perfil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.sistema.gestion.sistema_gestion_api.AuthTestSupport.como;
import static com.sistema.gestion.sistema_gestion_api.AuthTestSupport.conTokenCrudo;
import static com.sistema.gestion.sistema_gestion_api.AuthTestSupport.sinToken;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Inicio de sesión, token y respuestas 401 y 403 en el formato único de error. */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:auth-integracion;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@Import({AuthIntegracionTests.ControladorSoloAdministrador.class, AdministradorPorDefecto.class})
@Transactional
class AuthIntegracionTests {

    @RestController
    static class ControladorSoloAdministrador {

        @GetMapping("/api/prueba/solo-administrador")
        @PreAuthorize("hasRole('ADMINISTRADOR')")
        String soloAdministrador() {
            return "ok";
        }
    }

    @Autowired
    private MockMvc mvc;

    @Test
    void loginDevuelveTokenYElRolDeCadaUsuario() throws Exception {
        for (Perfil perfil : Perfil.values()) {
            mvc.perform(json(post("/api/auth/login"), credenciales(perfil.correo(), perfil.password())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isNotEmpty())
                    .andExpect(jsonPath("$.tipo").value("Bearer"))
                    .andExpect(jsonPath("$.expiraEnSegundos").value(8 * 3600))
                    .andExpect(jsonPath("$.usuario.id").value(perfil.usuarioId()))
                    .andExpect(jsonPath("$.usuario.correo").value(perfil.correo()))
                    .andExpect(jsonPath("$.usuario.password").doesNotExist());
        }
    }

    @Test
    void loginAsignaElCodigoDeRolSegunElNombreDelRol() throws Exception {
        mvc.perform(json(post("/api/auth/login"), credenciales(Perfil.SOLICITANTE.correo(), Perfil.SOLICITANTE.password())))
                .andExpect(jsonPath("$.usuario.rol").value("SOLICITANTE"));
        mvc.perform(json(post("/api/auth/login"), credenciales(Perfil.GESTOR.correo(), Perfil.GESTOR.password())))
                .andExpect(jsonPath("$.usuario.rol").value("GESTOR"));
        mvc.perform(json(post("/api/auth/login"), credenciales(Perfil.ADMINISTRADOR.correo(), Perfil.ADMINISTRADOR.password())))
                .andExpect(jsonPath("$.usuario.rol").value("ADMINISTRADOR"));
    }

    @Test
    void loginIgnoraMayusculasEnElCorreo() throws Exception {
        mvc.perform(json(post("/api/auth/login"), credenciales("ANA.Martinez@campus.edu", Perfil.SOLICITANTE.password())))
                .andExpect(status().isOk());
    }

    @Test
    void loginConContrasenaIncorrectaResponde401() throws Exception {
        mvc.perform(json(post("/api/auth/login"), credenciales(Perfil.GESTOR.correo(), "otra-clave-123")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Correo o contrasena incorrectos"))
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }

    @Test
    void loginConCorreoInexistenteResponde401ConElMismoMensaje() throws Exception {
        mvc.perform(json(post("/api/auth/login"), credenciales("nadie@campus.edu", "cualquiera123")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Correo o contrasena incorrectos"));
    }

    @Test
    void loginSinCamposResponde400ConUnElementoPorCampo() throws Exception {
        mvc.perform(json(post("/api/auth/login"), "{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.campo=='correo')]").exists())
                .andExpect(jsonPath("$.errors[?(@.campo=='password')]").exists());
    }

    @Test
    void unUsuarioInactivoNoPuedeIniciarSesion() throws Exception {
        String cuerpo = """
                {"nombre":"Inactivo","apellido":"Prueba","correo":"inactivo@campus.edu","password":"clave12345","activo":false,"rolId":1}
                """;
        mvc.perform(json(post("/api/usuarios"), cuerpo)).andExpect(status().isCreated());

        mvc.perform(json(post("/api/auth/login"), credenciales("inactivo@campus.edu", "clave12345")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unUsuarioCreadoPorLaApiPuedeIniciarSesionConSuContrasena() throws Exception {
        String cuerpo = """
                {"nombre":"Nuevo","apellido":"Usuario","correo":"nuevo@campus.edu","password":"clave12345","activo":true,"rolId":2}
                """;
        mvc.perform(json(post("/api/usuarios"), cuerpo))
                .andExpect(status().isCreated())
                .andExpect(content().string(not(containsString("password"))));

        mvc.perform(json(post("/api/auth/login"), credenciales("nuevo@campus.edu", "clave12345")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.rol").value("GESTOR"));
    }

    @Test
    void crearUnUsuarioSinContrasenaResponde400() throws Exception {
        String cuerpo = """
                {"nombre":"Sin","apellido":"Clave","correo":"sinclave@campus.edu","activo":true,"rolId":1}
                """;
        mvc.perform(json(post("/api/usuarios"), cuerpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("contrasena")));
    }

    @Test
    void editarUnUsuarioSinContrasenaConservaLaActual() throws Exception {
        String cuerpo = """
                {"nombre":"Ana","apellido":"Martinez","correo":"ana.martinez@campus.edu","activo":true,"rolId":1}
                """;
        mvc.perform(json(put("/api/usuarios/" + Perfil.SOLICITANTE.usuarioId()), cuerpo)).andExpect(status().isOk());

        mvc.perform(json(post("/api/auth/login"), credenciales(Perfil.SOLICITANTE.correo(), Perfil.SOLICITANTE.password())))
                .andExpect(status().isOk());
    }

    @Test
    void editarUnUsuarioConContrasenaNuevaCambiaLaClave() throws Exception {
        String cuerpo = """
                {"nombre":"Ana","apellido":"Martinez","correo":"ana.martinez@campus.edu","password":"nueva-clave-99","activo":true,"rolId":1}
                """;
        mvc.perform(json(put("/api/usuarios/" + Perfil.SOLICITANTE.usuarioId()), cuerpo)).andExpect(status().isOk());

        mvc.perform(json(post("/api/auth/login"), credenciales(Perfil.SOLICITANTE.correo(), "nueva-clave-99")))
                .andExpect(status().isOk());
        mvc.perform(json(post("/api/auth/login"), credenciales(Perfil.SOLICITANTE.correo(), Perfil.SOLICITANTE.password())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meDevuelveElUsuarioDelToken() throws Exception {
        mvc.perform(get("/api/auth/me").with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(Perfil.GESTOR.usuarioId()))
                .andExpect(jsonPath("$.correo").value(Perfil.GESTOR.correo()))
                .andExpect(jsonPath("$.rol").value("GESTOR"));
    }

    @Test
    void sinTokenLosRecursosDeLaApiResponden401ConElFormatoDeError() throws Exception {
        mvc.perform(get("/api/recursos").with(sinToken()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.path").value("/api/recursos"))
                .andExpect(jsonPath("$.errors").isEmpty());
    }

    @Test
    void unTokenInvalidoResponde401() throws Exception {
        mvc.perform(get("/api/recursos").with(conTokenCrudo("esto.no.es.un.token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void elLoginYLaDocumentacionDeLaApiNoPidenToken() throws Exception {
        mvc.perform(get("/v3/api-docs").with(sinToken())).andExpect(status().isOk());
    }

    @Test
    void unaOperacionRestringidaResponde403AlRolIncorrectoEnElFormatoDeError() throws Exception {
        mvc.perform(get("/api/prueba/solo-administrador").with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.path").value("/api/prueba/solo-administrador"));
        mvc.perform(get("/api/prueba/solo-administrador").with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isForbidden());
    }

    @Test
    void unaOperacionRestringidaPermiteElRolCorrecto() throws Exception {
        mvc.perform(get("/api/prueba/solo-administrador").with(como(mvc, Perfil.ADMINISTRADOR)))
                .andExpect(status().isOk());
    }

    @Test
    void unaOperacionRestringidaSinTokenResponde401() throws Exception {
        mvc.perform(get("/api/prueba/solo-administrador").with(sinToken()))
                .andExpect(status().isUnauthorized());
    }

    private static String credenciales(String correo, String password) {
        return """
                {"correo":"%s","password":"%s"}
                """.formatted(correo, password);
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String cuerpo) {
        return request.contentType(MediaType.APPLICATION_JSON).content(cuerpo);
    }
}
