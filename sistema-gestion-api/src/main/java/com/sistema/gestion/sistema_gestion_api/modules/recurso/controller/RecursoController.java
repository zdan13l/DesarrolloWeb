package com.sistema.gestion.sistema_gestion_api.modules.recurso.controller;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.TipoRecurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.service.RecursoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recursos")
public class RecursoController {

    private final RecursoService recursoService;

    public RecursoController(RecursoService recursoService) {
        this.recursoService = recursoService;
    }

    @GetMapping
    public List<RecursoResponseDTO> listar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long ubicacionId,
            @RequestParam(required = false) TipoRecurso tipo,
            @RequestParam(required = false) EstadoOperativo estado) {
        return recursoService.buscarConFiltros(categoriaId, ubicacionId, tipo, estado);
    }

    @GetMapping("/{id}")
    public RecursoResponseDTO obtener(@PathVariable Long id) {
        return recursoService.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecursoResponseDTO crear(@Valid @RequestBody RecursoRequestDTO dto) {
        return recursoService.crear(dto);
    }

    @PutMapping("/{id}")
    public RecursoResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody RecursoRequestDTO dto) {
        return recursoService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        recursoService.eliminar(id);
    }
}
