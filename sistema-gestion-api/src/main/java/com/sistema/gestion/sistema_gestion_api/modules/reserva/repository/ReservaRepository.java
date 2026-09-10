package com.sistema.gestion.sistema_gestion_api.modules.reserva.repository;

import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.EstadoReserva;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByRecursoId(Long recursoId);

    List<Reserva> findByUsuarioId(Long usuarioId);

    List<Reserva> findByEstadoReserva(EstadoReserva estadoReserva);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.recurso.id = :recursoId")
    long contarPorRecurso(@Param("recursoId") Long recursoId);
}
