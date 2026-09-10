package com.sistema.gestion.sistema_gestion_api.modules.recurso.dto;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.ModalidadRecurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.TipoRecurso;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RecursoRequestDTO(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotNull(message = "El tipo de recurso es obligatorio")
        TipoRecurso tipoRecurso,
        @NotBlank(message = "La descripcion es obligatoria")
        String descripcion,
        @NotBlank(message = "Las caracteristicas son obligatorias")
        String caracteristicas,
        @NotNull(message = "La modalidad es obligatoria")
        ModalidadRecurso modalidadRecurso,
        @NotNull(message = "El estado operativo es obligatorio")
        EstadoOperativo estadoOperativo,
        @NotNull(message = "La categoria es obligatoria")
        Long categoriaId,
        @NotNull(message = "La ubicacion es obligatoria")
        Long ubicacionId
) {
}
