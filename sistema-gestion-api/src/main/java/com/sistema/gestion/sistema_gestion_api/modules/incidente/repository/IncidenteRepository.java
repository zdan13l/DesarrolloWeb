package com.sistema.gestion.sistema_gestion_api.modules.incidente.repository;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.Incidente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidenteRepository extends JpaRepository<Incidente, Long> {
}
