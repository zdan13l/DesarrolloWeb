package com.sistema.gestion.sistema_gestion_api;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.sistema.gestion.sistema_gestion_api.AuthTestSupport.Perfil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import static com.sistema.gestion.sistema_gestion_api.AuthTestSupport.conTokenCrudo;
import static com.sistema.gestion.sistema_gestion_api.AuthTestSupport.token;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Un token cuyo contenido o firma fue alterado nunca debe aceptarse: la firma HS256 se verifica en cada petición
 * y el rol sale únicamente del claim firmado.
 */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:jwt-integridad;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@Transactional
class JwtIntegridadTests {

    /** Operación solo para administrador; el id no existe, así que un permiso válido da 404, nunca 401 ni 403. */
    private static final String RUTA_ADMIN = "/api/usuarios/999999";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JwtEncoder encoderDeLaAplicacion;

    private static String base64Url(String texto) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(texto.getBytes(StandardCharsets.UTF_8));
    }

    private static String texto(String base64Url) {
        return new String(Base64.getUrlDecoder().decode(base64Url), StandardCharsets.UTF_8);
    }

    private void esperar401(String token) throws Exception {
        mvc.perform(delete(RUTA_ADMIN).with(conTokenCrudo(token)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    private static JwtClaimsSet.Builder claimsDeAdministrador(Instant emitido, Instant vence) {
        return JwtClaimsSet.builder()
                .subject("4")
                .issuedAt(emitido)
                .expiresAt(vence)
                .claim("correo", "diego.ramirez@campus.edu")
                .claim("nombre", "Diego Ramírez")
                .claim("rol", "ADMINISTRADOR");
    }

    private static String firmar(JwtEncoder encoder, JwtClaimsSet claims) {
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }

    @Test
    void elTokenOriginalDeAdministradorSiFunciona() throws Exception {
        mvc.perform(delete(RUTA_ADMIN).with(conTokenCrudo(token(mvc, Perfil.ADMINISTRADOR))))
                .andExpect(status().isNotFound());
    }

    @Test
    void cambiarElRolEnElPayloadSinReFirmarResponde401() throws Exception {
        String[] partes = token(mvc, Perfil.GESTOR).split("\\.");
        String payload = texto(partes[1]).replace("\"rol\":\"GESTOR\"", "\"rol\":\"ADMINISTRADOR\"");
        assertContiene(payload, "ADMINISTRADOR");

        esperar401(partes[0] + "." + base64Url(payload) + "." + partes[2]);
    }

    @Test
    void cambiarElUsuarioDelTokenSinReFirmarResponde401() throws Exception {
        String[] partes = token(mvc, Perfil.SOLICITANTE).split("\\.");
        String payload = texto(partes[1]).replace("\"sub\":\"1\"", "\"sub\":\"4\"");
        assertContiene(payload, "\"sub\":\"4\"");

        esperar401(partes[0] + "." + base64Url(payload) + "." + partes[2]);
    }

    @Test
    void quitarLaFirmaResponde401() throws Exception {
        String[] partes = token(mvc, Perfil.ADMINISTRADOR).split("\\.");

        esperar401(partes[0] + "." + partes[1] + ".");
    }

    @Test
    void unTokenSinAlgoritmoResponde401() throws Exception {
        String cabecera = base64Url("{\"alg\":\"none\",\"typ\":\"JWT\"}");
        String payload = base64Url("{\"sub\":\"4\",\"rol\":\"ADMINISTRADOR\",\"exp\":" + (Instant.now().getEpochSecond() + 3600) + "}");

        esperar401(cabecera + "." + payload + ".");
    }

    @Test
    void unTokenFirmadoConOtraClaveResponde401() throws Exception {
        var otraClave = new SecretKeySpec("otra-clave-distinta-de-32-bytes-o-mas!!".getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        JwtEncoder ajeno = new NimbusJwtEncoder(new ImmutableSecret<>(otraClave));

        esperar401(firmar(ajeno, claimsDeAdministrador(Instant.now(), Instant.now().plusSeconds(3600)).build()));
    }

    @Test
    void unTokenVencidoResponde401AunqueLaFirmaSeaCorrecta() throws Exception {
        esperar401(firmar(encoderDeLaAplicacion, claimsDeAdministrador(Instant.now().minusSeconds(3600), Instant.now().minusSeconds(60)).build()));
    }

    private static void assertContiene(String texto, String fragmento) {
        org.assertj.core.api.Assertions.assertThat(texto).contains(fragmento);
    }
}
