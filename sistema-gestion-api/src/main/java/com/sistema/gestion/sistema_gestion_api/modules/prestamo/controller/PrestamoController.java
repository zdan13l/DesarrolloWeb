package com.sistema.gestion.sistema_gestion_api.modules.prestamo.controller;

import com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto.DevolucionRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto.PrestamoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto.PrestamoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.service.PrestamoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Préstamos", description = "Entrega y devolución de equipos")
@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {

    private final PrestamoService prestamoService;

    public PrestamoController(PrestamoService prestamoService) {
        this.prestamoService = prestamoService;
    }

    @Operation(summary = "Listar préstamos",
        description = "Filtros opcionales por recurso o usuario; vencidos=true devuelve los préstamos activos que superaron su fecha límite")
    @ApiResponse(responseCode = "200", description = "Listado de préstamos")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<PrestamoResponseDTO> listar(
            @RequestParam(required = false) Long recursoId,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false, defaultValue = "false") boolean vencidos) {
        if (vencidos) {
            return prestamoService.buscarVencidos();
        }
        if (recursoId != null) {
            return prestamoService.buscarPorRecurso(recursoId);
        }
        if (usuarioId != null) {
            return prestamoService.buscarPorUsuario(usuarioId);
        }
        return prestamoService.listarTodos();
    }

    @Operation(summary = "Consultar un préstamo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Préstamo encontrado"),
        @ApiResponse(responseCode = "404", description = "El préstamo no existe")
    })   
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PrestamoResponseDTO obtener(@PathVariable Long id) {
        return prestamoService.obtenerPorId(id);
    }

    @Operation(summary = "Registrar entrega de un equipo")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Entrega registrada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "Recurso, usuario o reserva inexistente")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PrestamoResponseDTO crear(@Valid @RequestBody PrestamoRequestDTO dto) {
        return prestamoService.crear(dto);
    }

    @Operation(summary = "Registrar devolución de un equipo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Devolución registrada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "El préstamo no existe")
    })
    @PatchMapping("/{id}/devolucion")
    @ResponseStatus(HttpStatus.OK)
    public PrestamoResponseDTO registrarDevolucion(
            @PathVariable Long id,
            @Valid @RequestBody DevolucionRequestDTO dto) {
        return prestamoService.registrarDevolucion(id, dto);
    }


    @Operation(summary = "Corregir datos de un préstamo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Préstamo actualizado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "El préstamo no existe")
    })
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PrestamoResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody PrestamoRequestDTO dto) {
        return prestamoService.actualizar(id, dto);
    }

    @Operation(summary = "Eliminar préstamo")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Préstamo eliminado"),
        @ApiResponse(responseCode = "404", description = "El préstamo no existe")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        prestamoService.eliminar(id);
    }
}
