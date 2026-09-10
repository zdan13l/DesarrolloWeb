package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.service;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto.MantenimientoResponseDTO;

import java.util.List;

public interface MantenimientoService {

    List<MantenimientoResponseDTO> listarTodos();

    MantenimientoResponseDTO obtenerPorId(Long id);

    List<MantenimientoResponseDTO> buscarPorRecurso(Long recursoId);

    MantenimientoResponseDTO crear(MantenimientoRequestDTO dto);

    MantenimientoResponseDTO actualizar(Long id, MantenimientoRequestDTO dto);

    void eliminar(Long id);
}
