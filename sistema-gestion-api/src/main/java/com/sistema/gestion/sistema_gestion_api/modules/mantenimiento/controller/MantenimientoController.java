package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.controller;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.service.MantenimientoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mantenimientos")
public class MantenimientoController {

    private final MantenimientoService mantenimientoService;

    public MantenimientoController(MantenimientoService mantenimientoService) {
        this.mantenimientoService = mantenimientoService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<MantenimientoResponseDTO> listar(@RequestParam(required = false) Long recursoId) {
        if (recursoId != null) {
            return mantenimientoService.buscarPorRecurso(recursoId);
        }
        return mantenimientoService.listarTodos();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public MantenimientoResponseDTO obtener(@PathVariable Long id) {
        return mantenimientoService.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MantenimientoResponseDTO crear(@Valid @RequestBody MantenimientoRequestDTO dto) {
        return mantenimientoService.crear(dto);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public MantenimientoResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody MantenimientoRequestDTO dto) {
        return mantenimientoService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        mantenimientoService.eliminar(id);
    }
}
