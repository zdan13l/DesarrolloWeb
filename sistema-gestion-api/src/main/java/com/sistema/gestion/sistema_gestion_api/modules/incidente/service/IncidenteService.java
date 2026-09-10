package com.sistema.gestion.sistema_gestion_api.modules.incidente.service;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.dto.IncidenteRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.dto.IncidenteResponseDTO;

import java.util.List;

public interface IncidenteService {

    List<IncidenteResponseDTO> listarTodos();

    IncidenteResponseDTO obtenerPorId(Long id);

    List<IncidenteResponseDTO> buscarPorRecurso(Long recursoId);

    IncidenteResponseDTO crear(IncidenteRequestDTO dto);

    IncidenteResponseDTO actualizar(Long id, IncidenteRequestDTO dto);

    void eliminar(Long id);
}
