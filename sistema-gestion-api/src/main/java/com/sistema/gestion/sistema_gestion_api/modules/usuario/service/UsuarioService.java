package com.sistema.gestion.sistema_gestion_api.modules.usuario.service;

import com.sistema.gestion.sistema_gestion_api.modules.usuario.dto.UsuarioRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.dto.UsuarioResponseDTO;

import java.util.List;

public interface UsuarioService {

    List<UsuarioResponseDTO> listarTodos();

    UsuarioResponseDTO obtenerPorId(Long id);

    List<UsuarioResponseDTO> listarActivos();

    UsuarioResponseDTO crear(UsuarioRequestDTO dto);

    UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto);

    void eliminar(Long id);
}
