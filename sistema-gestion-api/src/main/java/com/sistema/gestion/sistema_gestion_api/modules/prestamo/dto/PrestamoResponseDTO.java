package com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto;

import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.EstadoFisico;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.EstadoPrestamo;

import java.time.Instant;

public record PrestamoResponseDTO(
        Long id,
        Instant fechaHoraEntrega,
        Instant fechaHoraLimite,
        Instant fechaHoraDevolucion,
        EstadoFisico estadoInicial,
        EstadoFisico estadoFinal,
        String observaciones,
        String accesorios,
        EstadoPrestamo estadoPrestamo,
        Long recursoId,
        String recursoNombre,
        Long usuarioId,
        String usuarioNombre,
        Long reservaId
) {
}
