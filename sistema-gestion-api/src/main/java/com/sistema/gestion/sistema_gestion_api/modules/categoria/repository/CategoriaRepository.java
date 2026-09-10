package com.sistema.gestion.sistema_gestion_api.modules.categoria.repository;

import com.sistema.gestion.sistema_gestion_api.modules.categoria.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByNombreContainingIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);
}
