package com.sistema.gestion.sistema_gestion_api.modules.usuario.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.dto.UsuarioRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.dto.UsuarioResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Usuarios", description = "Administración de usuarios y cuentas del sistema")
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Operation(summary = "Listar usuarios",
            description = "Con activos=true devuelve solo los usuarios activos")
    @ApiResponse(responseCode = "200", description = "Listado de usuarios")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<UsuarioResponseDTO> listar(@RequestParam(required = false) Boolean activos) {
        if (Boolean.TRUE.equals(activos)) {
            return usuarioService.listarActivos();
        }
        return usuarioService.listarTodos();
    }

    @Operation(summary = "Consultar un usuario")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe")
    })
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UsuarioResponseDTO obtener(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id);
    }

    @Operation(summary = "Crear usuario", description = "El correo debe ser único")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Usuario creado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "409", description = "Ya existe un usuario con ese correo")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO crear(@Valid @RequestBody UsuarioRequestDTO dto) {
        return usuarioService.crear(dto);
    }

    @Operation(summary = "Actualizar usuario")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario actualizado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe")
    })
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UsuarioResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequestDTO dto) {
        return usuarioService.actualizar(id, dto);
    }

    @Operation(summary = "Eliminar usuario")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Usuario eliminado"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
    }
}
