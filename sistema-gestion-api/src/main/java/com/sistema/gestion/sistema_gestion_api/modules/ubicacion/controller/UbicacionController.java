package com.sistema.gestion.sistema_gestion_api.modules.ubicacion.controller;

import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto.UbicacionRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto.UbicacionResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.service.UbicacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ubicaciones")
public class UbicacionController {

    private final UbicacionService ubicacionService;

    public UbicacionController(UbicacionService ubicacionService) {
        this.ubicacionService = ubicacionService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<UbicacionResponseDTO> listar(@RequestParam(required = false) String edificio) {
        if (edificio != null && !edificio.isBlank()) {
            return ubicacionService.buscarPorEdificio(edificio);
        }
        return ubicacionService.listarTodas();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UbicacionResponseDTO obtener(@PathVariable Long id) {
        return ubicacionService.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UbicacionResponseDTO crear(@Valid @RequestBody UbicacionRequestDTO dto) {
        return ubicacionService.crear(dto);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UbicacionResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody UbicacionRequestDTO dto) {
        return ubicacionService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        ubicacionService.eliminar(id);
    }
}
