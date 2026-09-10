package com.sistema.gestion.sistema_gestion_api.modules.categoria.controller;

import com.sistema.gestion.sistema_gestion_api.modules.categoria.dto.CategoriaRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.dto.CategoriaResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<CategoriaResponseDTO> listar(@RequestParam(required = false) String nombre) {
        if (nombre != null && !nombre.isBlank()) {
            return categoriaService.buscarPorNombre(nombre);
        }
        return categoriaService.listarTodas();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public CategoriaResponseDTO obtener(@PathVariable Long id) {
        return categoriaService.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponseDTO crear(@Valid @RequestBody CategoriaRequestDTO dto) {
        return categoriaService.crear(dto);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public CategoriaResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequestDTO dto) {
        return categoriaService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
    }
}
