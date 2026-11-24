package com.sistema.gestion.sistema_gestion_api;

import com.sistema.gestion.sistema_gestion_api.AuthTestSupport.Perfil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Indicadores (contenido y seguridad) y manejo de cuerpos inválidos, con los datos del DataSeeder. */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:gestion-indicadores;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@Transactional
class IndicadoresYErroresTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void elResumenReflejaElPortatilBloqueadoYElIncidenteCritico() throws Exception {
        mvc.perform(get("/api/indicadores/resumen").with(AuthTestSupport.como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recursosPorEstado.BLOQUEADO").value(1))
                .andExpect(jsonPath("$.recursosPorEstado.DISPONIBLE").value(2))
                .andExpect(jsonPath("$.recursosPorEstado.PRESTADO").value(1))
                .andExpect(jsonPath("$.incidentesRegistrados").value(1))
                .andExpect(jsonPath("$.devolucionesTardias").value(1));
    }

    @Test
    void elEstadoDeRecursosListaLosCuatroRecursosYMarcaElBloqueado() throws Exception {
        mvc.perform(get("/api/indicadores/estado-recursos").with(AuthTestSupport.como(mvc, Perfil.ADMINISTRADOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[?(@.nombre=='Portátil Dell Latitude')].estado").value("BLOQUEADO"));
    }

    @Test
    void lasReservasPorRecursoYCategoriaCuentanLasReservasDelSeeder() throws Exception {
        mvc.perform(get("/api/indicadores/reservas-por-recurso").with(AuthTestSupport.como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[0].totalReservas").value(greaterThanOrEqualTo(1)));
        mvc.perform(get("/api/indicadores/reservas-por-categoria").with(AuthTestSupport.como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }

    @Test
    void losIndicadoresRechazanSinTokenYAlSolicitante() throws Exception {
        mvc.perform(get("/api/indicadores/resumen").with(AuthTestSupport.sinToken()))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/indicadores/resumen").with(AuthTestSupport.como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isForbidden());
    }

    @Test
    void unEnumInvalidoResponde400ConMensajeClaro() throws Exception {
        mvc.perform(json(post("/api/incidentes"), """
                        {"tipoIncidente":"NO_EXISTE","severidadIncidente":"CRITICA","descripcion":"x",
                         "fecha":"2026-01-01T10:00:00Z","recursoId":1}""")
                        .with(AuthTestSupport.como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void unCuerpoIlegibleResponde400EnVezDe500() throws Exception {
        mvc.perform(json(post("/api/incidentes"), "{esto no es json")
                        .with(AuthTestSupport.como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        mvc.perform(json(post("/api/recursos"), "[]")
                        .with(AuthTestSupport.como(mvc, Perfil.ADMINISTRADOR)))
                .andExpect(status().isBadRequest());
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
        return request.contentType(MediaType.APPLICATION_JSON).content(body);
    }
}
