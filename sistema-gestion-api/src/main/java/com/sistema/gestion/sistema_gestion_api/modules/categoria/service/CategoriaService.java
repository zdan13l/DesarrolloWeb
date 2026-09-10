package com.sistema.gestion.sistema_gestion_api.modules.categoria.service;

import com.sistema.gestion.sistema_gestion_api.modules.categoria.dto.CategoriaRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.dto.CategoriaResponseDTO;

import java.util.List;

public interface CategoriaService {

    List<CategoriaResponseDTO> listarTodas();

    CategoriaResponseDTO obtenerPorId(Long id);

    List<CategoriaResponseDTO> buscarPorNombre(String nombre);

    CategoriaResponseDTO crear(CategoriaRequestDTO dto);

    CategoriaResponseDTO actualizar(Long id, CategoriaRequestDTO dto);

    void eliminar(Long id);
}
