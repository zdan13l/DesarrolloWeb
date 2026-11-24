package com.sistema.gestion.sistema_gestion_api;

import com.sistema.gestion.sistema_gestion_api.AuthTestSupport.Perfil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:rutas-no-encontradas;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
class RutasNoEncontradasTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void unArchivoInexistenteResponde404ConElFormatoDeError() throws Exception {
        mvc.perform(get("/no-existe.png").with(AuthTestSupport.sinToken()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.path").value("/no-existe.png"));
    }

    @Test
    void unaRutaDeApiInexistenteResponde404() throws Exception {
        mvc.perform(get("/api/ruta-inexistente").with(AuthTestSupport.como(mvc, Perfil.ADMINISTRADOR)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
