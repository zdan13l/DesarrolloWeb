package com.sistema.gestion.sistema_gestion_api.modules.prestamo.controller;

import com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto.PrestamoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto.PrestamoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.service.PrestamoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {

    private final PrestamoService prestamoService;

    public PrestamoController(PrestamoService prestamoService) {
        this.prestamoService = prestamoService;
    }

    @GetMapping
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

    @GetMapping("/{id}")
    public PrestamoResponseDTO obtener(@PathVariable Long id) {
        return prestamoService.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PrestamoResponseDTO crear(@Valid @RequestBody PrestamoRequestDTO dto) {
        return prestamoService.crear(dto);
    }

    @PutMapping("/{id}")
    public PrestamoResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody PrestamoRequestDTO dto) {
        return prestamoService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        prestamoService.eliminar(id);
    }
}
