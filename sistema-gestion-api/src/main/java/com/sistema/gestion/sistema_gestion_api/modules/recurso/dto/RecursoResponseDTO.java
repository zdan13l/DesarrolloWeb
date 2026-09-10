package com.sistema.gestion.sistema_gestion_api.modules.recurso.dto;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.ModalidadRecurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.TipoRecurso;

public record RecursoResponseDTO(
        Long id,
        String nombre,
        TipoRecurso tipoRecurso,
        String descripcion,
        String caracteristicas,
        ModalidadRecurso modalidadRecurso,
        EstadoOperativo estadoOperativo,
        Long categoriaId,
        String categoriaNombre,
        Long ubicacionId,
        String ubicacionNombre
) {
}
