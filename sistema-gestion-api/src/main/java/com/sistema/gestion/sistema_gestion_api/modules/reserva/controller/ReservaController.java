package com.sistema.gestion.sistema_gestion_api.modules.reserva.controller;

import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
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

    @GetMapping("/{id}")
    public ReservaResponseDTO obtener(@PathVariable Long id) {
        return reservaService.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponseDTO crear(@Valid @RequestBody ReservaRequestDTO dto) {
        return reservaService.crear(dto);
    }

    @PutMapping("/{id}")
    public ReservaResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody ReservaRequestDTO dto) {
        return reservaService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        reservaService.eliminar(id);
    }
}
