package com.sistema.gestion.sistema_gestion_api.modules.prestamo.service;

import com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto.PrestamoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto.PrestamoResponseDTO;

import java.util.List;

public interface PrestamoService {

    List<PrestamoResponseDTO> listarTodos();

    PrestamoResponseDTO obtenerPorId(Long id);

    List<PrestamoResponseDTO> buscarPorRecurso(Long recursoId);

    List<PrestamoResponseDTO> buscarPorUsuario(Long usuarioId);

    List<PrestamoResponseDTO> buscarVencidos();

    PrestamoResponseDTO crear(PrestamoRequestDTO dto);

    PrestamoResponseDTO actualizar(Long id, PrestamoRequestDTO dto);

    void eliminar(Long id);
}
