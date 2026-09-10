package com.sistema.gestion.sistema_gestion_api.modules.prestamo.repository;

import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.EstadoPrestamo;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    List<Prestamo> findByRecursoId(Long recursoId);

    List<Prestamo> findByUsuarioId(Long usuarioId);

    List<Prestamo> findByEstadoPrestamo(EstadoPrestamo estadoPrestamo);

    @Query("SELECT p FROM Prestamo p WHERE p.estadoPrestamo = com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.EstadoPrestamo.ACTIVO " +
            "AND p.fechaHoraLimite < :ahora")
    List<Prestamo> buscarVencidos(@Param("ahora") Instant ahora);
}
