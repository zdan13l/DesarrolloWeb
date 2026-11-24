package com.sistema.gestion.sistema_gestion_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Sirve la SPA Angular desde {@code static/}. Los archivos existentes (js, css, assets) se entregan tal cual;
 * cualquier otra ruta de navegador (por ejemplo {@code /reservas} al recargar) devuelve {@code index.html}
 * para que el router de Angular la resuelva. Las rutas {@code /api/**} nunca caen en este respaldo.
 */
@Configuration
public class SpaConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource pedido = location.createRelative(resourcePath);
                        if (pedido.exists() && pedido.isReadable()) {
                            return pedido;
                        }
                        if (resourcePath.startsWith("api/") || resourcePath.contains(".")) {
                            return null;
                        }
                        Resource indice = new ClassPathResource("static/index.html");
                        return indice.exists() ? indice : null;
                    }
                });
    }
}
