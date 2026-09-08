package com.sistema.gestion.sistema_gestion_api.modules.recurso.repository;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecursoRepository extends JpaRepository<Recurso, Long> {
}
