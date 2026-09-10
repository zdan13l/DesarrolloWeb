package com.sistema.gestion.sistema_gestion_api.modules.reserva.service;

import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaResponseDTO;

import java.util.List;

public interface ReservaService {

    List<ReservaResponseDTO> listarTodas();

    ReservaResponseDTO obtenerPorId(Long id);

    List<ReservaResponseDTO> buscarPorRecurso(Long recursoId);

    List<ReservaResponseDTO> buscarPorUsuario(Long usuarioId);

    ReservaResponseDTO crear(ReservaRequestDTO dto);

    ReservaResponseDTO actualizar(Long id, ReservaRequestDTO dto);

    void eliminar(Long id);
}
