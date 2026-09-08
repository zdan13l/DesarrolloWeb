package com.sistema.gestion.sistema_gestion_api.modules.usuario.repository;

import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
