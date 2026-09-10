package com.sistema.gestion.sistema_gestion_api.modules.recurso.service;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.TipoRecurso;

import java.util.List;

public interface RecursoService {

    List<RecursoResponseDTO> listarTodos();

    RecursoResponseDTO obtenerPorId(Long id);

    List<RecursoResponseDTO> buscarConFiltros(Long categoriaId, Long ubicacionId, TipoRecurso tipoRecurso, EstadoOperativo estadoOperativo);

    RecursoResponseDTO crear(RecursoRequestDTO dto);

    RecursoResponseDTO actualizar(Long id, RecursoRequestDTO dto);

    void eliminar(Long id);
}
