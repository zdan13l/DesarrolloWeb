package com.sistema.gestion.sistema_gestion_api.modules.incidente.repository;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.Incidente;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.SeveridadIncidente;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.TipoIncidente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidenteRepository extends JpaRepository<Incidente, Long> {

    List<Incidente> findByRecursoId(Long recursoId);

    List<Incidente> findBySeveridadIncidente(SeveridadIncidente severidadIncidente);

    List<Incidente> findByTipoIncidente(TipoIncidente tipoIncidente);
}
