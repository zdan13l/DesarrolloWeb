package com.sistema.gestion.sistema_gestion_api.modules.auth.controller;

import com.sistema.gestion.sistema_gestion_api.modules.auth.dto.LoginRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.auth.dto.LoginResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.auth.dto.SesionUsuarioDTO;
import com.sistema.gestion.sistema_gestion_api.modules.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Autenticación", description = "Inicio de sesión y datos del usuario autenticado")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Iniciar sesión",
            description = "Valida el correo y la contraseña y devuelve un token JWT para el encabezado Authorization: Bearer")
    @ApiResponse(responseCode = "200", description = "Sesión iniciada")
    @ApiResponse(responseCode = "401", description = "Credenciales incorrectas o usuario inactivo")
    @SecurityRequirements
    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO dto) {
        return authService.login(dto);
    }

    @Operation(summary = "Usuario autenticado", description = "Devuelve los datos y el rol del dueño del token")
    @ApiResponse(responseCode = "200", description = "Datos de la sesión")
    @ApiResponse(responseCode = "401", description = "Token ausente, inválido o vencido")
    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public SesionUsuarioDTO me() {
        return authService.usuarioActual();
    }
}
