package com.sistema.gestion.sistema_gestion_api;

import com.sistema.gestion.sistema_gestion_api.modules.auth.model.RolSistema;
import com.sistema.gestion.sistema_gestion_api.modules.auth.service.JwtService;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcBuilderCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/** Hace que todas las peticiones de MockMvc lleven el token de un administrador, salvo que la prueba indique otro. */
@TestConfiguration
public class AdministradorPorDefecto {

    @Bean
    MockMvcBuilderCustomizer administradorPorDefecto(JwtService jwtService) {
        String token = jwtService.generar(4L, "diego.ramirez@campus.edu", "Diego Ramírez", RolSistema.ADMINISTRADOR);
        return builder -> builder.defaultRequest(get("/").header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }
}
