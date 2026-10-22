package com.sistema.gestion.sistema_gestion_api.modules.categoria.controller;

import com.sistema.gestion.sistema_gestion_api.modules.categoria.dto.CategoriaRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.dto.CategoriaResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.service.CategoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Categorías", description = "Gestión de categorías y clasificación de recursos")
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @Operation(summary = "Listar categorías", description = "Filtro opcional por nombre")
    @ApiResponse(responseCode = "200", description = "Listado de categorías")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<CategoriaResponseDTO> listar(@RequestParam(required = false) String nombre) {
        if (nombre != null && !nombre.isBlank()) {
            return categoriaService.buscarPorNombre(nombre);
        }
        return categoriaService.listarTodas();
    }

    @Operation(summary = "Consultar una categoría")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Categoría encontrada"),
        @ApiResponse(responseCode = "404", description = "La categoría no existe")
    })
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public CategoriaResponseDTO obtener(@PathVariable Long id) {
        return categoriaService.obtenerPorId(id);
    }

    @Operation(summary = "Crear categoría")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Categoría creada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponseDTO crear(@Valid @RequestBody CategoriaRequestDTO dto) {
        return categoriaService.crear(dto);
    }

    @Operation(summary = "Actualizar categoría")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Categoría actualizada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "La categoría no existe")
    })
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public CategoriaResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequestDTO dto) {
        return categoriaService.actualizar(id, dto);
    }

    @Operation(summary = "Eliminar categoría")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Categoría eliminada"),
        @ApiResponse(responseCode = "404", description = "La categoría no existe")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
    }
}
