package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.controller;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.service.MantenimientoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@Tag(name = "Mantenimientos", description = "Intervenciones hasta habilitar de nuevo el recurso")
@RestController
@RequestMapping("/api/mantenimientos")
public class MantenimientoController {

    private final MantenimientoService mantenimientoService;

    public MantenimientoController(MantenimientoService mantenimientoService) {
        this.mantenimientoService = mantenimientoService;
    }

    @Operation(summary = "Listar mantenimientos", description = "Filtro opcional por recurso")
    @ApiResponse(responseCode = "200", description = "Listado de mantenimientos")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMINISTRADOR')")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<MantenimientoResponseDTO> listar(@RequestParam(required = false) Long recursoId) {
        if (recursoId != null) {
            return mantenimientoService.buscarPorRecurso(recursoId);
        }
        return mantenimientoService.listarTodos();
    }

    @Operation(summary = "Consultar un mantenimiento")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Mantenimiento encontrado"),
        @ApiResponse(responseCode = "404", description = "El mantenimiento no existe")
    })
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMINISTRADOR')")
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public MantenimientoResponseDTO obtener(@PathVariable Long id) {
        return mantenimientoService.obtenerPorId(id);
    }

    @Operation(summary = "Abrir mantenimiento",
            description = "Queda en estado ABIERTA y el recurso pasa a BLOQUEADO hasta que se cierre.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Mantenimiento creado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "Recurso inexistente"),
        @ApiResponse(responseCode = "409", description = "El recurso está prestado o ya tiene un mantenimiento abierto")
    })
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMINISTRADOR')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MantenimientoResponseDTO crear(@Valid @RequestBody MantenimientoRequestDTO dto) {
        return mantenimientoService.crear(dto);
    }

    @Operation(summary = "Actualizar mantenimiento",
            description = "Cambia el diagnóstico y las observaciones, o lo pasa de ABIERTA a EN_PROCESO. "
                    + "Para cerrarlo usa finalizar o cancelar.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Mantenimiento actualizado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "El mantenimiento o el recurso no existe"),
        @ApiResponse(responseCode = "409", description = "Ya está cerrado o el cambio de estado no está permitido")
    })
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMINISTRADOR')")
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public MantenimientoResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody MantenimientoRequestDTO dto) {
        return mantenimientoService.actualizar(id, dto);
    }

    @Operation(summary = "Finalizar mantenimiento",
            description = "Lo cierra con la fecha actual. Con habilitarRecurso=true el recurso vuelve a estar disponible.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Mantenimiento finalizado"),
        @ApiResponse(responseCode = "404", description = "El mantenimiento no existe"),
        @ApiResponse(responseCode = "409", description = "Ya estaba finalizado o cancelado")
    })
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMINISTRADOR')")
    @PatchMapping("/{id}/finalizar")
    @ResponseStatus(HttpStatus.OK)
    public MantenimientoResponseDTO finalizar(@PathVariable Long id,
                                              @RequestParam(defaultValue = "false") boolean habilitarRecurso) {
        return mantenimientoService.finalizar(id, habilitarRecurso);
    }

    @Operation(summary = "Cancelar mantenimiento",
            description = "El recurso sigue bloqueado; se habilita aparte cuando esté listo.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Mantenimiento cancelado"),
        @ApiResponse(responseCode = "404", description = "El mantenimiento no existe"),
        @ApiResponse(responseCode = "409", description = "Ya estaba finalizado o cancelado")
    })
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMINISTRADOR')")
    @PatchMapping("/{id}/cancelar")
    @ResponseStatus(HttpStatus.OK)
    public MantenimientoResponseDTO cancelar(@PathVariable Long id) {
        return mantenimientoService.cancelar(id);
    }

    @Operation(summary = "Eliminar mantenimiento")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Mantenimiento eliminado"),
        @ApiResponse(responseCode = "404", description = "El mantenimiento no existe")
    })
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        mantenimientoService.eliminar(id);
    }
}
