package com.sistema.gestion.sistema_gestion_api;

import com.sistema.gestion.sistema_gestion_api.AuthTestSupport.Perfil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static com.sistema.gestion.sistema_gestion_api.AuthTestSupport.como;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pasos de la Prueba de sistema E2E que valida el ciclo de vida operativo completo de PontiReservas
 * autenticando cada paso con el rol real correspondiente mediante JWT:
 * 1. Administrador crea recurso disponible.
 * 2. Solicitante crea reserva confirmada.
 * 3. Gestor registra entrega de préstamo (recurso pasa a PRESTADO).
 * 4. Gestor registra devolución tardía (devolucionTardia=true, recurso vuelve a DISPONIBLE).
 * 5. Solicitante reporta incidente CRÍTICO (recurso pasa automáticamente a BLOQUEADO).
 * 6. Gestor abre orden de mantenimiento, la pasa a EN_PROCESO y la finaliza sin habilitar aún.
 * 7. Gestor habilita explícitamente el recurso (recurso vuelve a DISPONIBLE y queda apto para nuevas reservas).
 */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:sistema-flujo-completo;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@Transactional
class SistemaFlujoCompletoTests {

    private static final long CATEGORIA_ID = 1L;
    private static final long UBICACION_ID = 1L;

    @Autowired
    private MockMvc mvc;

    @Test
    void flujoCompletoDeSistemaConRolesRealesYBloqueoPorIncidente() throws Exception {
        // 1. Administrador crea un recurso nuevo en estado DISPONIBLE
        String recursoBody = """
                {
                  "nombre": "Kit Cámara Sony E2E",
                  "tipoRecurso": "EQUIPO",
                  "descripcion": "Cámara 4K para prueba de sistema",
                  "caracteristicas": "Lente 24-70mm, batería extra",
                  "modalidadRecurso": "AMBAS",
                  "estadoOperativo": "DISPONIBLE",
                  "categoriaId": %d,
                  "ubicacionId": %d
                }
                """.formatted(CATEGORIA_ID, UBICACION_ID);

        long recursoId = idDe(mvc.perform(json(post("/api/recursos"), recursoBody)
                        .with(como(mvc, Perfil.ADMINISTRADOR)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoOperativo").value("DISPONIBLE")));

        // 2. Solicitante crea una reserva sobre ese recurso
        Instant inicioReserva = Instant.now().plus(2, ChronoUnit.HOURS);
        Instant finReserva = Instant.now().plus(4, ChronoUnit.HOURS);
        String reservaBody = """
                {
                  "fechaHoraInicio": "%s",
                  "fechaHoraFin": "%s",
                  "recursoId": %d,
                  "usuarioId": %d
                }
                """.formatted(inicioReserva, finReserva, recursoId, Perfil.SOLICITANTE.usuarioId());

        long reservaId = idDe(mvc.perform(json(post("/api/reservas"), reservaBody)
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoReserva").value("CONFIRMADA")));

        // 3. Gestor entrega el recurso asociado a la reserva -> Recurso pasa a PRESTADO
        Instant entrega = Instant.now().minus(4, ChronoUnit.HOURS);
        Instant limiteVencido = Instant.now().minus(1, ChronoUnit.HOURS);
        String prestamoBody = """
                {
                  "fechaHoraEntrega": "%s",
                  "fechaHoraLimite": "%s",
                  "estadoInicial": "BUENO",
                  "observaciones": "Entrega verificada en mostrador",
                  "accesorios": "Estuche y cargador",
                  "recursoId": %d,
                  "usuarioId": %d,
                  "reservaId": %d
                }
                """.formatted(entrega, limiteVencido, recursoId, Perfil.SOLICITANTE.usuarioId(), reservaId);

        long prestamoId = idDe(mvc.perform(json(post("/api/prestamos"), prestamoBody)
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoPrestamo").value("ACTIVO")));

        mvc.perform(get("/api/recursos/" + recursoId).with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoOperativo").value("PRESTADO"));

        // 4. Gestor registra la devolución fuera de tiempo -> devolucionTardia = true y recurso DISPONIBLE
        String devolucionBody = """
                {
                  "estadoFinal": "REGULAR",
                  "observaciones": "Entregado con 1 hora de retraso y golpe leve en lente"
                }
                """;

        mvc.perform(json(patch("/api/prestamos/" + prestamoId + "/devolucion"), devolucionBody)
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPrestamo").value("DEVUELTO"))
                .andExpect(jsonPath("$.devolucionTardia").value(true));

        mvc.perform(get("/api/recursos/" + recursoId).with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoOperativo").value("DISPONIBLE"));

        // 5. Solicitante reporta incidente crítico -> Recurso queda BLOQUEADO automáticamente
        String incidenteBody = """
                {
                  "tipoIncidente": "DANO_FISICO",
                  "severidadIncidente": "CRITICA",
                  "descripcion": "El lente presenta fisura tras la devolución",
                  "fecha": "%s",
                  "recursoId": %d
                }
                """.formatted(Instant.now(), recursoId);

        mvc.perform(json(post("/api/incidentes"), incidenteBody)
                        .with(como(mvc, Perfil.SOLICITANTE)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recursoBloqueado").value(true));

        mvc.perform(get("/api/recursos/" + recursoId).with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoOperativo").value("BLOQUEADO"));

        // 6. Gestor abre orden de mantenimiento, la actualiza a EN_PROCESO y la finaliza
        String abrirMantBody = """
                {
                  "diagnostico": "Cambio de lente frontal y calibración",
                  "observaciones": "Repuesto en laboratorio",
                  "recursoId": %d
                }
                """.formatted(recursoId);

        long mantenimientoId = idDe(mvc.perform(json(post("/api/mantenimientos"), abrirMantBody)
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoMantenimiento").value("ABIERTA")));

        String enProcesoBody = """
                {
                  "estadoMantenimiento": "EN_PROCESO",
                  "diagnostico": "Cambio de lente frontal y calibración",
                  "observaciones": "Pruebas ópticas en curso",
                  "recursoId": %d
                }
                """.formatted(recursoId);

        mvc.perform(json(put("/api/mantenimientos/" + mantenimientoId), enProcesoBody)
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoMantenimiento").value("EN_PROCESO"));

        mvc.perform(patch("/api/mantenimientos/" + mantenimientoId + "/finalizar")
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoMantenimiento").value("FINALIZADA"));

        // El recurso sigue BLOQUEADO hasta su habilitación explícita
        mvc.perform(get("/api/recursos/" + recursoId).with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoOperativo").value("BLOQUEADO"));

        // 7. Gestor habilita el recurso -> Vuelve a DISPONIBLE y permite nueva reserva
        mvc.perform(patch("/api/recursos/" + recursoId + "/habilitar")
                        .with(como(mvc, Perfil.GESTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoOperativo").value("DISPONIBLE"));

        String nuevaReservaBody = """
                {
                  "fechaHoraInicio": "%s",
                  "fechaHoraFin": "%s",
                  "recursoId": %d,
                  "usuarioId": %d
                }
                """.formatted(Instant.now().plus(24, ChronoUnit.HOURS),
                Instant.now().plus(26, ChronoUnit.HOURS), recursoId, Perfil.OTRO_SOLICITANTE.usuarioId());

        mvc.perform(json(post("/api/reservas"), nuevaReservaBody)
                        .with(como(mvc, Perfil.OTRO_SOLICITANTE)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoReserva").value("CONFIRMADA"));
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
        return request.contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private static long idDe(ResultActions resultado) throws Exception {
        String cuerpo = resultado.andReturn().getResponse().getContentAsString();
        return com.jayway.jsonpath.JsonPath.parse(cuerpo).read("$.id", Long.class);
    }
}
