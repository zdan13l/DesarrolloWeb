package com.sistema.gestion.sistema_gestion_api.modules.prestamo.repository;

import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
}
