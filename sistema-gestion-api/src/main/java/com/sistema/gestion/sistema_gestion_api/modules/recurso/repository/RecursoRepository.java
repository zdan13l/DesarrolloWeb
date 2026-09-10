package com.sistema.gestion.sistema_gestion_api.modules.recurso.repository;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.TipoRecurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecursoRepository extends JpaRepository<Recurso, Long> {

    List<Recurso> findByCategoriaId(Long categoriaId);

    List<Recurso> findByUbicacionId(Long ubicacionId);

    List<Recurso> findByEstadoOperativo(EstadoOperativo estadoOperativo);

    List<Recurso> findByTipoRecurso(TipoRecurso tipoRecurso);

    @Query("SELECT r FROM Recurso r WHERE " +
            "(:categoriaId IS NULL OR r.categoria.id = :categoriaId) AND " +
            "(:ubicacionId IS NULL OR r.ubicacion.id = :ubicacionId) AND " +
            "(:tipoRecurso IS NULL OR r.tipoRecurso = :tipoRecurso) AND " +
            "(:estadoOperativo IS NULL OR r.estadoOperativo = :estadoOperativo)")
    List<Recurso> buscarConFiltros(
            @Param("categoriaId") Long categoriaId,
            @Param("ubicacionId") Long ubicacionId,
            @Param("tipoRecurso") TipoRecurso tipoRecurso,
            @Param("estadoOperativo") EstadoOperativo estadoOperativo
    );
}
