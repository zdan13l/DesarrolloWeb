package com.sistema.gestion.sistema_gestion_api.modules.usuario.controller;

import com.sistema.gestion.sistema_gestion_api.modules.usuario.dto.RolResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Catálogo de roles (solo lectura) para poblar el desplegable del formulario de usuarios. */
@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final UsuarioService usuarioService;

    public RolController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<RolResponseDTO> listar() {
        return usuarioService.listarRoles();
    }
}
