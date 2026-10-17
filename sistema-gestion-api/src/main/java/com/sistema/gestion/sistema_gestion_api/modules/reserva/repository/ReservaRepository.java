package com.sistema.gestion.sistema_gestion_api.modules.reserva.repository;

import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.EstadoReserva;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByRecursoId(Long recursoId);

    List<Reserva> findByUsuarioId(Long usuarioId);

    List<Reserva> findByEstadoReserva(EstadoReserva estadoReserva);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.recurso.id = :recursoId")
    long contarPorRecurso(@Param("recursoId") Long recursoId);



    @Query("SELECT r FROM Reserva r WHERE r.recurso.id = :recursoId " +
            "AND r.estadoReserva = 'CONFIRMADA' " +
            "AND r.fechaHoraInicio < :finDia AND r.fechaHoraFin > :inicioDia")
    List<Reserva> findReservasConfirmadasPorDia(
            @Param("recursoId") Long recursoId,
            @Param("inicioDia") Instant inicioDia,
            @Param("finDia") Instant finDia
    );



    @Query("SELECT r FROM Reserva r WHERE r.recurso.id = :recursoId " +
            "AND r.estadoReserva = 'CONFIRMADA' " +
            "AND r.fechaHoraInicio < :fechaFin AND r.fechaHoraFin > :fechaInicio")
    List<Reserva> findSolapamientos(
            @Param("recursoId") Long recursoId,
            @Param("fechaInicio") Instant fechaInicio,
            @Param("fechaFin") Instant fechaFin
    );



    @Query("SELECT r FROM Reserva r WHERE r.recurso.id = :recursoId " +
            "AND r.estadoReserva = 'CONFIRMADA' " +
            "AND r.id <> :reservaId " +
            "AND r.fechaHoraInicio < :fechaFin AND r.fechaHoraFin > :fechaInicio")
    List<Reserva> findSolapamientosExcluyendo(
            @Param("recursoId") Long recursoId,
            @Param("fechaInicio") Instant fechaInicio,
            @Param("fechaFin") Instant fechaFin,
            @Param("reservaId") Long reservaId
    );

    boolean existsByRecursoId(Long recursoId);
}
