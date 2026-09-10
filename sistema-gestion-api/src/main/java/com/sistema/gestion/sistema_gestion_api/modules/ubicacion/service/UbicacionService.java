package com.sistema.gestion.sistema_gestion_api.modules.ubicacion.service;

import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto.UbicacionRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto.UbicacionResponseDTO;

import java.util.List;

public interface UbicacionService {

    List<UbicacionResponseDTO> listarTodas();

    UbicacionResponseDTO obtenerPorId(Long id);

    List<UbicacionResponseDTO> buscarPorEdificio(String edificio);

    UbicacionResponseDTO crear(UbicacionRequestDTO dto);

    UbicacionResponseDTO actualizar(Long id, UbicacionRequestDTO dto);

    void eliminar(Long id);
}
