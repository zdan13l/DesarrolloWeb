package com.sistema.gestion.sistema_gestion_api.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controlador de vistas de la aplicación multipágina (MPA).
 * Cada método solo resuelve la plantilla; los datos se cargan en el
 * navegador contra la API REST ya existente (/api/**) mediante JS.
 */
@Controller
public class PaginaController {

    @GetMapping("/")
    public String inicio() {
        return "index";
    }

    @GetMapping("/recursos")
    public String catalogoRecursos() {
        return "recursos/list";
    }

    @GetMapping("/recursos/nuevo")
    public String nuevoRecurso() {
        return "recursos/form";
    }

    @GetMapping("/recursos/{id}/editar")
    public String editarRecurso() {
        return "recursos/form";
    }

    @GetMapping("/categorias")
    public String categorias() {
        return "categorias/list";
    }

    @GetMapping("/ubicaciones")
    public String ubicaciones() {
        return "ubicaciones/list";
    }

    @GetMapping("/reservas/nueva")
    public String nuevaReserva() {
        return "reservas/form";
    }

    @GetMapping("/reservas")
    public String listadoReservas() {
        return "reservas/list";
    }

    @GetMapping("/prestamos/activos")
    public String prestamosActivos() {
        return "prestamos/activos";
    }

    @GetMapping("/prestamos/entrega")
    public String registrarEntrega() {
        return "prestamos/entrega";
    }

    @GetMapping("/prestamos/devolucion")
    public String registrarDevolucion() {
        return "prestamos/devolucion";
    }

    @GetMapping("/incidentes/reportar")
    public String reportarIncidente() {
        return "incidentes/form";
    }

    @GetMapping("/incidentes")
    public String listadoIncidentes() {
        return "incidentes/list";
    }
}
