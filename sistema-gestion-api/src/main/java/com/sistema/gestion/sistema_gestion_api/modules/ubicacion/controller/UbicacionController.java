package com.sistema.gestion.sistema_gestion_api.modules.ubicacion.controller;

import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto.UbicacionRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto.UbicacionResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.service.UbicacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Ubicaciones", description = "Gestión de ubicaciones físicas y espacios del campus")
@RestController
@RequestMapping("/api/ubicaciones")
public class UbicacionController {

    private final UbicacionService ubicacionService;

    public UbicacionController(UbicacionService ubicacionService) {
        this.ubicacionService = ubicacionService;
    }

    @Operation(summary = "Listar ubicaciones", description = "Filtro opcional por edificio")
    @ApiResponse(responseCode = "200", description = "Listado de ubicaciones")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<UbicacionResponseDTO> listar(@RequestParam(required = false) String edificio) {
        if (edificio != null && !edificio.isBlank()) {
            return ubicacionService.buscarPorEdificio(edificio);
        }
        return ubicacionService.listarTodas();
    }

    @Operation(summary = "Consultar una ubicación")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Ubicación encontrada"),
        @ApiResponse(responseCode = "404", description = "La ubicación no existe")
    })
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UbicacionResponseDTO obtener(@PathVariable Long id) {
        return ubicacionService.obtenerPorId(id);
    }

    @Operation(summary = "Crear ubicación")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Ubicación creada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UbicacionResponseDTO crear(@Valid @RequestBody UbicacionRequestDTO dto) {
        return ubicacionService.crear(dto);
    }

    @Operation(summary = "Actualizar ubicación")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Ubicación actualizada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "La ubicación no existe")
    })
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UbicacionResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody UbicacionRequestDTO dto) {
        return ubicacionService.actualizar(id, dto);
    }

    @Operation(summary = "Eliminar ubicación")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Ubicación eliminada"),
        @ApiResponse(responseCode = "404", description = "La ubicación no existe")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        ubicacionService.eliminar(id);
    }
}
