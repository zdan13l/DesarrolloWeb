        package com.sistema.gestion.sistema_gestion_api;

        import org.junit.jupiter.api.Test;
        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
        import org.springframework.boot.test.context.SpringBootTest;
        import org.springframework.http.MediaType;
        import org.springframework.test.web.servlet.MockMvc;
        import org.springframework.test.web.servlet.ResultActions;
        import org.springframework.transaction.annotation.Transactional;

        import static org.hamcrest.Matchers.containsString;
        import static org.hamcrest.Matchers.hasSize;
        import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
        import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
        import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
        import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
        import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
        import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
        import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

        /** Pruebas de incidentes, mantenimientos y datos maestros sobre H2 en memoria con los datos del DataSeeder. */
        @SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:gestion-flujo;DB_CLOSE_DELAY=-1")
        @AutoConfigureMockMvc
        @Transactional
        class GestionFlujoTests {

        // Ids del DataSeeder: categoría 1 (Aulas), ubicación 1 (Aula 101), usuario 1 (Ana, con reserva).
        private static final long CATEGORIA = 1;
        private static final long UBICACION = 1;
        private static final long USUARIO = 1;

        @Autowired
        private MockMvc mvc;

        @Test
        void incidenteCriticoBloqueaElRecurso() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");

                mvc.perform(json(post("/api/incidentes"), incidente(recurso, "CRITICA")))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.recursoBloqueado").value(true));

                mvc.perform(get("/api/recursos/" + recurso))
                        .andExpect(jsonPath("$.estadoOperativo").value("BLOQUEADO"));
        }

        @Test
        void incidenteLeveNoBloqueaElRecurso() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");

                mvc.perform(json(post("/api/incidentes"), incidente(recurso, "LEVE")))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.recursoBloqueado").value(false));

                mvc.perform(get("/api/recursos/" + recurso))
                        .andExpect(jsonPath("$.estadoOperativo").value("DISPONIBLE"));
        }

        @Test
        void editarUnIncidenteACriticoBloqueaElRecurso() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");
                long incidente = idDe(mvc.perform(json(post("/api/incidentes"), incidente(recurso, "MEDIA")))
                        .andExpect(status().isCreated()));

                mvc.perform(json(put("/api/incidentes/" + incidente), incidente(recurso, "CRITICA")))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.recursoBloqueado").value(true));

                mvc.perform(get("/api/recursos/" + recurso))
                        .andExpect(jsonPath("$.estadoOperativo").value("BLOQUEADO"));
        }

        @Test
        void abrirMantenimientoBloqueaElRecursoYFijaElEstadoInicial() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");

                // El cliente no envía estado ni fecha de apertura: los fija el servidor.
                mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null)))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.estadoMantenimiento").value("ABIERTA"))
                        .andExpect(jsonPath("$.fechaApertura").isNotEmpty())
                        .andExpect(jsonPath("$.fechaCierre").isEmpty());

                mvc.perform(get("/api/recursos/" + recurso))
                        .andExpect(jsonPath("$.estadoOperativo").value("BLOQUEADO"));
        }

        @Test
        void noSePuedeAbrirMantenimientoSobreUnRecursoPrestado() throws Exception {
                long recurso = crearRecurso("PRESTADO");

                mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null)))
                        .andExpect(status().isConflict())
                        .andExpect(jsonPath("$.message", containsString("PRESTADO")));

                mvc.perform(get("/api/recursos/" + recurso))
                        .andExpect(jsonPath("$.estadoOperativo").value("PRESTADO"));
        }

        @Test
        void noSePuedenAbrirDosMantenimientosSobreElMismoRecurso() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");
                mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null))).andExpect(status().isCreated());

                mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null)))
                        .andExpect(status().isConflict());
        }

        @Test
        void puedePasarAEnProcesoPeroNoCerrarseConPut() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");
                long id = idDe(mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null)))
                        .andExpect(status().isCreated()));

                mvc.perform(json(put("/api/mantenimientos/" + id), mantenimiento(recurso, "EN_PROCESO")))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.estadoMantenimiento").value("EN_PROCESO"));

                mvc.perform(json(put("/api/mantenimientos/" + id), mantenimiento(recurso, "FINALIZADA")))
                        .andExpect(status().isConflict());
                mvc.perform(json(put("/api/mantenimientos/" + id), mantenimiento(recurso, "ABIERTA")))
                        .andExpect(status().isConflict());
        }

        @Test
        void finalizarConHabilitarRecursoLoDejaDisponible() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");
                long id = idDe(mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null)))
                        .andExpect(status().isCreated()));

                mvc.perform(patch("/api/mantenimientos/" + id + "/finalizar").param("habilitarRecurso", "true"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.estadoMantenimiento").value("FINALIZADA"))
                        .andExpect(jsonPath("$.fechaCierre").isNotEmpty());

                mvc.perform(get("/api/recursos/" + recurso))
                        .andExpect(jsonPath("$.estadoOperativo").value("DISPONIBLE"));
        }

        @Test
        void finalizarSinHabilitarDejaElRecursoBloqueado() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");
                long id = idDe(mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null)))
                        .andExpect(status().isCreated()));

                mvc.perform(patch("/api/mantenimientos/" + id + "/finalizar")).andExpect(status().isOk());

                mvc.perform(get("/api/recursos/" + recurso))
                        .andExpect(jsonPath("$.estadoOperativo").value("BLOQUEADO"));
        }

        @Test
        void unMantenimientoCerradoNoAdmiteMasCambios() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");
                long id = idDe(mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null)))
                        .andExpect(status().isCreated()));
                mvc.perform(patch("/api/mantenimientos/" + id + "/cancelar"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.estadoMantenimiento").value("CANCELADA"));

                mvc.perform(patch("/api/mantenimientos/" + id + "/finalizar")).andExpect(status().isConflict());
                mvc.perform(patch("/api/mantenimientos/" + id + "/cancelar")).andExpect(status().isConflict());
                mvc.perform(json(put("/api/mantenimientos/" + id), mantenimiento(recurso, null)))
                        .andExpect(status().isConflict());
        }

        @Test
        void siguePermitiendoAbrirOtroMantenimientoTrasCerrarElAnterior() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");
                long id = idDe(mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null)))
                        .andExpect(status().isCreated()));
                mvc.perform(patch("/api/mantenimientos/" + id + "/finalizar").param("habilitarRecurso", "true"))
                        .andExpect(status().isOk());

                mvc.perform(json(post("/api/mantenimientos"), mantenimiento(recurso, null)))
                        .andExpect(status().isCreated());
        }

        @Test
        void noSeEliminaUnaCategoriaConRecursos() throws Exception {
                mvc.perform(delete("/api/categorias/" + CATEGORIA))
                        .andExpect(status().isConflict())
                        .andExpect(jsonPath("$.message", containsString("recursos")));
        }

        @Test
        void noSeEliminaUnaUbicacionConRecursos() throws Exception {
                mvc.perform(delete("/api/ubicaciones/" + UBICACION))
                        .andExpect(status().isConflict());
        }

        @Test
        void seEliminaUnaCategoriaSinRecursos() throws Exception {
                long id = idDe(mvc.perform(json(post("/api/categorias"), "{\"nombre\":\"Temporal\",\"descripcion\":\"x\"}"))
                        .andExpect(status().isCreated()));

                mvc.perform(delete("/api/categorias/" + id)).andExpect(status().isNoContent());
        }

        @Test
        void noSeEliminaUnUsuarioConHistorial() throws Exception {
                mvc.perform(delete("/api/usuarios/" + USUARIO))
                        .andExpect(status().isConflict());
        }

        @Test
        void noSePuedeEditarUnUsuarioConElCorreoDeOtro() throws Exception {
                long id = idDe(mvc.perform(json(post("/api/usuarios"), usuario("nuevo.usuario@campus.edu")))
                        .andExpect(status().isCreated()));

                // Ana Martínez ya usa este correo (DataSeeder).
                mvc.perform(json(put("/api/usuarios/" + id), usuario("ana.martinez@campus.edu")))
                        .andExpect(status().isConflict());
                // Conservar el propio correo sí es válido.
                mvc.perform(json(put("/api/usuarios/" + id), usuario("nuevo.usuario@campus.edu")))
                        .andExpect(status().isOk());
        }

        @Test
        void listaLosRolesParaElFormularioDeUsuarios() throws Exception {
                mvc.perform(get("/api/roles"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$", hasSize(3)))
                        .andExpect(jsonPath("$[0].nombre").value("Solicitante"));
        }

        @Test
        void laValidacionResponde400ConUnElementoPorCampo() throws Exception {
                mvc.perform(json(post("/api/usuarios"), "{\"nombre\":\"\",\"apellido\":\"X\",\"correo\":\"no-es-correo\",\"activo\":true,\"rolId\":1}"))
                        .andExpect(status().isBadRequest())
                        .andExpect(jsonPath("$.status").value(400))
                        .andExpect(jsonPath("$.errors[?(@.campo=='nombre')]").exists())
                        .andExpect(jsonPath("$.errors[?(@.campo=='correo')]").exists());
        }

        @Test
        void cancelarUnaReservaConfirmadaLaPasaACanceladaYLiberaLaFranja() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");
                long reserva = idDe(mvc.perform(json(post("/api/reservas"), reserva(recurso, 24, 26)))
                        .andExpect(status().isCreated()));

                mvc.perform(patch("/api/reservas/" + reserva + "/cancelar"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.estadoReserva").value("CANCELADA"));

                // La franja queda libre: se puede reservar de nuevo el mismo horario.
                mvc.perform(json(post("/api/reservas"), reserva(recurso, 24, 26)))
                        .andExpect(status().isCreated());
        }

        @Test
        void noSePuedeCancelarDosVecesUnaReserva() throws Exception {
                long recurso = crearRecurso("DISPONIBLE");
                long reserva = idDe(mvc.perform(json(post("/api/reservas"), reserva(recurso, 24, 26)))
                        .andExpect(status().isCreated()));

                mvc.perform(patch("/api/reservas/" + reserva + "/cancelar")).andExpect(status().isOk());
                mvc.perform(patch("/api/reservas/" + reserva + "/cancelar"))
                        .andExpect(status().isConflict())
                        .andExpect(jsonPath("$.status").value(409));
        }

        @Test
        void cancelarUnaReservaInexistenteResponde404() throws Exception {
                mvc.perform(patch("/api/reservas/999999/cancelar"))
                        .andExpect(status().isNotFound())
                        .andExpect(jsonPath("$.status").value(404));
        }

        private String reserva(long recursoId, int inicioHoras, int finHoras) {
                java.time.Instant ahora = java.time.Instant.now();
                return """
                        {"fechaHoraInicio":"%s","fechaHoraFin":"%s","recursoId":%d,"usuarioId":%d}
                        """.formatted(ahora.plus(inicioHoras, java.time.temporal.ChronoUnit.HOURS),
                        ahora.plus(finHoras, java.time.temporal.ChronoUnit.HOURS), recursoId, USUARIO);
        }

        private long crearRecurso(String estado) throws Exception {
                String body = """
                        {"nombre":"Recurso de prueba","tipoRecurso":"EQUIPO","descripcion":"d","caracteristicas":"c",
                        "modalidadRecurso":"AMBAS","estadoOperativo":"%s","categoriaId":%d,"ubicacionId":%d}
                        """.formatted(estado, CATEGORIA, UBICACION);
                return idDe(mvc.perform(json(post("/api/recursos"), body)).andExpect(status().isCreated()));
        }

        private String incidente(long recursoId, String severidad) {
                return """
                        {"tipoIncidente":"DANO_FISICO","severidadIncidente":"%s","descripcion":"Se rompió",
                        "fecha":"2026-10-12T15:30:00Z","recursoId":%d,"usuarioId":%d}
                        """.formatted(severidad, recursoId, USUARIO);
        }

        private String mantenimiento(long recursoId, String estado) {
                String campoEstado = estado == null ? "" : "\"estadoMantenimiento\":\"%s\",".formatted(estado);
                return """
                        {%s"diagnostico":"Revisión","observaciones":"Pendiente","recursoId":%d}
                        """.formatted(campoEstado, recursoId);
        }

        private String usuario(String correo) {
                return """
                        {"nombre":"Nuevo","apellido":"Usuario","correo":"%s","activo":true,"rolId":1}
                        """.formatted(correo);
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
