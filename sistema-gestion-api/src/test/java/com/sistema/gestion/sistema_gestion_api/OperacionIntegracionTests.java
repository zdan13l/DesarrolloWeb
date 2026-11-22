package com.sistema.gestion.sistema_gestion_api;

import com.sistema.gestion.sistema_gestion_api.AuthTestSupport.Perfil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static com.sistema.gestion.sistema_gestion_api.AuthTestSupport.como;
import static com.sistema.gestion.sistema_gestion_api.AuthTestSupport.sinToken;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:operacion-integracion;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@Import(AdministradorPorDefecto.class)
@Transactional
class OperacionIntegracionTests {

    private static final long CATEGORIA = 1L;
    private static final long UBICACION = 1L;
    private static final long RESERVA_SEEDER = 1L;

    @Autowired
    private MockMvc mvc;

    // --- RESERVAS ---

    @Test
    void crearReservaConConflictoHorarioResponde409() throws Exception {
        long recurso = crearRecurso("DISPONIBLE", "RESERVABLE");

        mvc.perform(json(post("/api/reservas"), reservaJson(recurso, Perfil.SOLICITANTE.usuarioId(), 10, 12))
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isCreated());

        // Solapamiento parcial (11 a 13)
        mvc.perform(json(post("/api/reservas"), reservaJson(recurso, Perfil.SOLICITANTE.usuarioId(), 11, 13))
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void crearReservaSobreRecursoBloqueadoResponde409() throws Exception {
        long recursoBloqueado = crearRecurso("BLOQUEADO", "RESERVABLE");

        mvc.perform(json(post("/api/reservas"), reservaJson(recursoBloqueado, Perfil.SOLICITANTE.usuarioId(), 10, 12))
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void modificarReservaPropiaActualizaHorarioSinConflictoConsigoMisma() throws Exception {
        long recurso = crearRecurso("DISPONIBLE", "RESERVABLE");
        long reservaId = idDe(mvc.perform(json(post("/api/reservas"), reservaJson(recurso, Perfil.SOLICITANTE.usuarioId(), 10, 12))
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isCreated()));

        mvc.perform(json(put("/api/reservas/" + reservaId), reservaJson(recurso, Perfil.SOLICITANTE.usuarioId(), 14, 16))
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reservaId));
    }

    // --- PRÉSTAMOS ---

    @Test
    void registrarEntregaMarcaRecursoPrestadoYRN03ImpideDobleEntrega() throws Exception {
        long recurso = crearRecurso("DISPONIBLE", "PRESTABLE");
        Instant entrega = Instant.now().minus(1, ChronoUnit.HOURS);
        Instant limite = Instant.now().plus(2, ChronoUnit.HOURS);

        mvc.perform(json(post("/api/prestamos"), prestamoJson(recurso, Perfil.SOLICITANTE.usuarioId(), RESERVA_SEEDER, entrega, limite))
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoPrestamo").value("ACTIVO"))
                .andExpect(jsonPath("$.devolucionTardia").value(false));

        mvc.perform(get("/api/recursos/" + recurso).with(como(mvc, Perfil.GESTOR)))
                .andExpect(jsonPath("$.estadoOperativo").value("PRESTADO"));

        // RN-03: no se puede entregar nuevamente hasta devolución
        mvc.perform(json(post("/api/prestamos"), prestamoJson(recurso, Perfil.SOLICITANTE.usuarioId(), RESERVA_SEEDER, entrega, limite))
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("PRESTADO")));
    }

    @Test
    void devolucionPuntualMarcaDevueltoYLiberarRecursoConDevolucionTardiaFalsa() throws Exception {
        long recurso = crearRecurso("DISPONIBLE", "PRESTABLE");
        Instant entrega = Instant.now().minus(1, ChronoUnit.HOURS);
        Instant limite = Instant.now().plus(4, ChronoUnit.HOURS);

        long prestamoId = idDe(mvc.perform(json(post("/api/prestamos"), prestamoJson(recurso, Perfil.SOLICITANTE.usuarioId(), RESERVA_SEEDER, entrega, limite))
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isCreated()));

        mvc.perform(json(patch("/api/prestamos/" + prestamoId + "/devolucion"), devolucionJson("BUENO", "A tiempo"))
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPrestamo").value("DEVUELTO"))
                .andExpect(jsonPath("$.devolucionTardia").value(false));

        mvc.perform(get("/api/recursos/" + recurso).with(como(mvc, Perfil.GESTOR)))
                .andExpect(jsonPath("$.estadoOperativo").value("DISPONIBLE"));
    }

    @Test
    void devolucionTardiaMarcaDevolucionTardiaVerdadera() throws Exception {
        long recurso = crearRecurso("DISPONIBLE", "PRESTABLE");
        Instant entrega = Instant.now().minus(5, ChronoUnit.HOURS);
        Instant limitePasado = Instant.now().minus(1, ChronoUnit.HOURS);

        long prestamoId = idDe(mvc.perform(json(post("/api/prestamos"), prestamoJson(recurso, Perfil.SOLICITANTE.usuarioId(), RESERVA_SEEDER, entrega, limitePasado))
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isCreated()));

        mvc.perform(json(patch("/api/prestamos/" + prestamoId + "/devolucion"), devolucionJson("BUENO", "Fuera de hora"))
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPrestamo").value("DEVUELTO"))
                .andExpect(jsonPath("$.devolucionTardia").value(true));
    }

    // --- SEGURIDAD Y PROPIEDAD (401, 403, usuarioId del token) ---

    @Test
    void sinTokenEnReservasYPrestamosResponde401() throws Exception {
        mvc.perform(get("/api/reservas").with(sinToken()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        mvc.perform(get("/api/prestamos").with(sinToken()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void solicitanteNoPuedeRegistrarEntregaDePrestamoResponde403() throws Exception {
        long recurso = crearRecurso("DISPONIBLE", "PRESTABLE");
        Instant entrega = Instant.now();
        Instant limite = Instant.now().plus(2, ChronoUnit.HOURS);

        mvc.perform(json(post("/api/prestamos"), prestamoJson(recurso, Perfil.SOLICITANTE.usuarioId(), RESERVA_SEEDER, entrega, limite))
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void solicitanteCreaReservaSiempreConUsuarioIdDelTokenYNoPuedeModificarReservaAjena() throws Exception {
        long recurso = crearRecurso("DISPONIBLE", "RESERVABLE");

        // Aunque envíe OTRO_SOLICITANTE.usuarioId() (2), el token es SOLICITANTE (1)
        String bodyConOtroUsuario = reservaJson(recurso, Perfil.OTRO_SOLICITANTE.usuarioId(), 20, 22);
        long reservaAjena = idDe(mvc.perform(json(post("/api/reservas"), bodyConOtroUsuario)
                        .with(como(mvc, Perfil.OTRO_SOLICITANTE)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usuarioId").value(Perfil.OTRO_SOLICITANTE.usuarioId())));

        // SOLICITANTE intentando modificar o consultar reserva de OTRO_SOLICITANTE -> 403
        mvc.perform(get("/api/reservas/" + reservaAjena).with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mvc.perform(json(put("/api/reservas/" + reservaAjena), reservaJson(recurso, Perfil.SOLICITANTE.usuarioId(), 23, 25))
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    // --- HELPERS ---

    private long crearRecurso(String estado, String modalidad) throws Exception {
        String body = """
                {"nombre":"Recurso test","tipoRecurso":"EQUIPO","descripcion":"desc","caracteristicas":"car",
                 "modalidadRecurso":"%s","estadoOperativo":"%s","categoriaId":%d,"ubicacionId":%d}
                """.formatted(modalidad, estado, CATEGORIA, UBICACION);
        return idDe(mvc.perform(json(post("/api/recursos"), body).with(como(mvc, Perfil.ADMINISTRADOR)))
                .andExpect(status().isCreated()));
    }

    private String reservaJson(long recursoId, long usuarioId, int inicioHoras, int finHoras) {
        Instant ahora = Instant.now();
        return """
                {"fechaHoraInicio":"%s","fechaHoraFin":"%s","recursoId":%d,"usuarioId":%d}
                """.formatted(ahora.plus(inicioHoras, ChronoUnit.HOURS),
                ahora.plus(finHoras, ChronoUnit.HOURS), recursoId, usuarioId);
    }

    private String prestamoJson(long recursoId, long usuarioId, long reservaId, Instant entrega, Instant limite) {
        return """
                {"fechaHoraEntrega":"%s","fechaHoraLimite":"%s","estadoInicial":"BUENO",
                 "observaciones":"ok","accesorios":"cargador","recursoId":%d,"usuarioId":%d,"reservaId":%d}
                """.formatted(entrega, limite, recursoId, usuarioId, reservaId);
    }

    private String devolucionJson(String estadoFinal, String observaciones) {
        return """
                {"estadoFinal":"%s","observaciones":"%s"}
                """.formatted(estadoFinal, observaciones);
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder json(
            org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request, String body) {
        return request.contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private static long idDe(ResultActions resultado) throws Exception {
        String cuerpo = resultado.andReturn().getResponse().getContentAsString();
        return com.jayway.jsonpath.JsonPath.parse(cuerpo).read("$.id", Long.class);
    }
}