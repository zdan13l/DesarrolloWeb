package com.sistema.gestion.sistema_gestion_api.modules.reserva.controller;

import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Reservas", description = "Gestión de reservas de recursos y comprueba disponibilidad")
@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @Operation(summary = "Listar reservas",
        description = "Lista todas las reservas, o filtra por recurso o por usuario")
    @ApiResponse(responseCode = "200", description = "Listado de reservas")

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ReservaResponseDTO> listar(
            @RequestParam(required = false) Long recursoId,
            @RequestParam(required = false) Long usuarioId) {
        if (recursoId != null) {
            return reservaService.buscarPorRecurso(recursoId);
        }
        if (usuarioId != null) {
            return reservaService.buscarPorUsuario(usuarioId);
        }
        return reservaService.listarTodas();
    }

    @Operation(summary = "Consultar una reserva")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reserva encontrada"),
        @ApiResponse(responseCode = "404", description = "La reserva no existe")
    })
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ReservaResponseDTO obtener(@PathVariable Long id) {
        return reservaService.obtenerPorId(id);
    }

    @Operation(summary = "Crear reserva",
        description = "Valida que el recurso no esté bloqueado y que no haya otra reserva confirmada con horario solapado")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Reserva creada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "Recurso o usuario inexistente"),
        @ApiResponse(responseCode = "409", description = "Conflicto de horario o recurso no disponible")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponseDTO crear(@Valid @RequestBody ReservaRequestDTO dto) {
        return reservaService.crear(dto);
    }


    @Operation(summary = "Modificar reserva",
        description = "Repite la validación de conflictos excluyendo la propia reserva")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reserva actualizada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "Reserva inexistente"),
        @ApiResponse(responseCode = "409", description = "Conflicto de horario o reserva ya iniciada")
    })
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ReservaResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody ReservaRequestDTO dto) {
        return reservaService.actualizar(id, dto);
    }

    @Operation(summary = "Cancelar reserva",
        description = "Cancelación lógica: solo reservas CONFIRMADAS que aún no han iniciado; libera la franja horaria")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reserva cancelada"),
        @ApiResponse(responseCode = "404", description = "Reserva inexistente"),
        @ApiResponse(responseCode = "409", description = "La reserva no está CONFIRMADA o ya ha iniciado")
    })
    @PatchMapping("/{id}/cancelar")
    @ResponseStatus(HttpStatus.OK)
    public ReservaResponseDTO cancelar(@PathVariable Long id) {
        return reservaService.cancelar(id);
    }

    @Operation(summary = "Eliminar reserva", description = "Eliminación física, uso administrativo")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Reserva eliminada"),
        @ApiResponse(responseCode = "404", description = "Reserva inexistente")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        reservaService.eliminar(id);
    }
}
