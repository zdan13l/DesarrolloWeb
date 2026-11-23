package com.sistema.gestion.sistema_gestion_api;

import com.sistema.gestion.sistema_gestion_api.AuthTestSupport.Perfil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Set;
import java.util.stream.Stream;

import static com.sistema.gestion.sistema_gestion_api.AuthTestSupport.como;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * El backend debe aplicar los permisos de PERMISOS.md por su cuenta: la interfaz solo oculta pantallas.
 * Con un token legítimo del rol equivocado, cada operación restringida responde 403.
 * Los cuerpos pasan la validación porque Spring valida el cuerpo antes de comprobar el rol.
 */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:permisos-por-rol;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@Transactional
class PermisosPorRolTests {

    private static final long NO_EXISTE = 999_999L;

    private static final Set<Perfil> TODOS = EnumSet.allOf(Perfil.class);
    private static final Set<Perfil> GESTION = EnumSet.of(Perfil.GESTOR, Perfil.ADMINISTRADOR);
    private static final Set<Perfil> ADMIN = EnumSet.of(Perfil.ADMINISTRADOR);

    private static final String USUARIO = """
            {"nombre":"Prueba","apellido":"Permisos","correo":"permisos@campus.edu","password":"clave12345","activo":true,"rolId":1}""";
    private static final String CATEGORIA = """
            {"nombre":"Categoría de prueba","descripcion":"x"}""";
    private static final String UBICACION = """
            {"nombre":"Sala de prueba","edificio":"A","piso":1}""";
    private static final String INCIDENTE = """
            {"tipoIncidente":"DANO_FISICO","severidadIncidente":"LEVE","descripcion":"x",
            "fecha":"2026-10-12T15:30:00Z","recursoId":%d}""".formatted(NO_EXISTE);
    private static final String MANTENIMIENTO = """
            {"diagnostico":"x","observaciones":"x","recursoId":%d}""".formatted(NO_EXISTE);

    @Autowired
    private MockMvc mvc;

    static Stream<Arguments> operaciones() {
        return Stream.of(
                op(HttpMethod.GET, "/api/usuarios", null, GESTION),
                op(HttpMethod.GET, "/api/usuarios/" + NO_EXISTE, null, GESTION),
                op(HttpMethod.POST, "/api/usuarios", USUARIO, ADMIN),
                op(HttpMethod.PUT, "/api/usuarios/" + NO_EXISTE, USUARIO, ADMIN),
                op(HttpMethod.DELETE, "/api/usuarios/" + NO_EXISTE, null, ADMIN),

                op(HttpMethod.GET, "/api/roles", null, ADMIN),

                op(HttpMethod.GET, "/api/categorias", null, TODOS),
                op(HttpMethod.POST, "/api/categorias", CATEGORIA, ADMIN),
                op(HttpMethod.PUT, "/api/categorias/" + NO_EXISTE, CATEGORIA, ADMIN),
                op(HttpMethod.DELETE, "/api/categorias/" + NO_EXISTE, null, ADMIN),

                op(HttpMethod.GET, "/api/ubicaciones", null, TODOS),
                op(HttpMethod.POST, "/api/ubicaciones", UBICACION, ADMIN),
                op(HttpMethod.PUT, "/api/ubicaciones/" + NO_EXISTE, UBICACION, ADMIN),
                op(HttpMethod.DELETE, "/api/ubicaciones/" + NO_EXISTE, null, ADMIN),

                op(HttpMethod.POST, "/api/incidentes", INCIDENTE, TODOS),
                op(HttpMethod.GET, "/api/incidentes", null, GESTION),
                op(HttpMethod.GET, "/api/incidentes/" + NO_EXISTE, null, GESTION),
                op(HttpMethod.PUT, "/api/incidentes/" + NO_EXISTE, INCIDENTE, GESTION),
                op(HttpMethod.DELETE, "/api/incidentes/" + NO_EXISTE, null, GESTION),

                op(HttpMethod.GET, "/api/mantenimientos", null, GESTION),
                op(HttpMethod.GET, "/api/mantenimientos/" + NO_EXISTE, null, GESTION),
                op(HttpMethod.POST, "/api/mantenimientos", MANTENIMIENTO, GESTION),
                op(HttpMethod.PUT, "/api/mantenimientos/" + NO_EXISTE, MANTENIMIENTO, GESTION),
                op(HttpMethod.PATCH, "/api/mantenimientos/" + NO_EXISTE + "/finalizar", null, GESTION),
                op(HttpMethod.PATCH, "/api/mantenimientos/" + NO_EXISTE + "/cancelar", null, GESTION),
                op(HttpMethod.DELETE, "/api/mantenimientos/" + NO_EXISTE, null, GESTION),

                op(HttpMethod.GET, "/api/indicadores/estado-recursos", null, GESTION),
                op(HttpMethod.GET, "/api/indicadores/reservas-por-recurso", null, GESTION),
                op(HttpMethod.GET, "/api/indicadores/reservas-por-categoria", null, GESTION),
                op(HttpMethod.GET, "/api/indicadores/resumen", null, GESTION)
        );
    }

    private static Arguments op(HttpMethod metodo, String ruta, String cuerpo, Set<Perfil> permitidos) {
        return Arguments.of(metodo, ruta, cuerpo, permitidos);
    }

    @ParameterizedTest(name = "{0} {1}")
    @MethodSource("operaciones")
    void cadaOperacionRespetaLosRolesPermitidos(HttpMethod metodo, String ruta, String cuerpo, Set<Perfil> permitidos)
            throws Exception {
        for (Perfil perfil : Perfil.values()) {
            var peticion = request(metodo, ruta).with(como(mvc, perfil));
            if (cuerpo != null) {
                peticion.contentType(MediaType.APPLICATION_JSON).content(cuerpo);
            }
            int estado = mvc.perform(peticion).andReturn().getResponse().getStatus();

            if (permitidos.contains(perfil)) {
                org.assertj.core.api.Assertions.assertThat(estado)
                        .as("%s debe poder hacer %s %s", perfil, metodo, ruta)
                        .isNotIn(401, 403);
            } else {
                org.assertj.core.api.Assertions.assertThat(estado)
                        .as("%s no debe poder hacer %s %s", perfil, metodo, ruta)
                        .isEqualTo(403);
            }
        }
    }

    @Test
    void unGestorNoPuedeEliminarUsuarios() throws Exception {
        mvc.perform(request(HttpMethod.DELETE, "/api/usuarios/" + Perfil.SOLICITANTE.usuarioId())
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isForbidden());
    }

    @Test
    void unSolicitanteNoPuedeEliminarUsuarios() throws Exception {
        mvc.perform(request(HttpMethod.DELETE, "/api/usuarios/" + Perfil.GESTOR.usuarioId())
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isForbidden());
    }
}
