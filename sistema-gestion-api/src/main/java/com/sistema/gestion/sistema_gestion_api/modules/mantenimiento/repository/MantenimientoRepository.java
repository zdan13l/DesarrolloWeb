package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.repository;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.Mantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MantenimientoRepository extends JpaRepository<Mantenimiento, Long> {
}
