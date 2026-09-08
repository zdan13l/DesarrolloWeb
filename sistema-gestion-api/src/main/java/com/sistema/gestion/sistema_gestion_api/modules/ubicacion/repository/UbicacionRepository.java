package com.sistema.gestion.sistema_gestion_api.modules.ubicacion.repository;

import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.model.Ubicacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UbicacionRepository extends JpaRepository<Ubicacion, Long> {
}
