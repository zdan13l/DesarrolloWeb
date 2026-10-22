package com.sistema.gestion.sistema_gestion_api.modules.usuario.controller;

import com.sistema.gestion.sistema_gestion_api.modules.usuario.dto.RolResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Catálogo de roles (solo lectura) para poblar el desplegable del formulario de usuarios. */
@Tag (name = "Roles", description = "Consulta de roles del sistema")
@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final UsuarioService usuarioService;

    public RolController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Operation(summary = "Listar roles", description = "Listado de roles disponibles en el sistema")
    @ApiResponse(responseCode = "200", description = "Listado de roles")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<RolResponseDTO> listar() {
        return usuarioService.listarRoles();
    }
}
