package com.sistema.gestion.sistema_gestion_api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** PATCH /api/recursos/{id}/habilitar sobre el portátil bloqueado del DataSeeder (id 4) y un recurso disponible (id 1). */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:habilitar-recurso;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@Import(AdministradorPorDefecto.class)
@Transactional
class HabilitarRecursoTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void habilitarUnRecursoBloqueadoLoDejaDisponible() throws Exception {
        mvc.perform(patch("/api/recursos/4/habilitar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoOperativo").value("DISPONIBLE"));

        mvc.perform(get("/api/recursos/4"))
                .andExpect(jsonPath("$.estadoOperativo").value("DISPONIBLE"));
    }

    @Test
    void habilitarUnRecursoQueNoEstaBloqueadoResponde409() throws Exception {
        mvc.perform(patch("/api/recursos/1/habilitar"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void habilitarUnRecursoInexistenteResponde404() throws Exception {
        mvc.perform(patch("/api/recursos/999/habilitar"))
                .andExpect(status().isNotFound());
    }
}
