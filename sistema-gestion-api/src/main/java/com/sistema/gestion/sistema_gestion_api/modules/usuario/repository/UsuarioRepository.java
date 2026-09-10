package com.sistema.gestion.sistema_gestion_api.modules.usuario.repository;

import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    List<Usuario> findByActivoTrue();

    List<Usuario> findByRolId(Long rolId);

    boolean existsByCorreoIgnoreCase(String correo);
}
