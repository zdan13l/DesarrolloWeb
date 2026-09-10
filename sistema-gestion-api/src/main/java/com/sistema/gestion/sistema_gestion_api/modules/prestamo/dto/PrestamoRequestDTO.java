package com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto;

import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.EstadoFisico;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.EstadoPrestamo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record PrestamoRequestDTO(
        @NotNull(message = "La fecha y hora de entrega es obligatoria")
        Instant fechaHoraEntrega,
        @NotNull(message = "La fecha y hora limite es obligatoria")
        Instant fechaHoraLimite,
        Instant fechaHoraDevolucion,
        @NotNull(message = "El estado fisico inicial es obligatorio")
        EstadoFisico estadoInicial,
        EstadoFisico estadoFinal,
        @NotBlank(message = "Las observaciones son obligatorias")
        String observaciones,
        @NotBlank(message = "Los accesorios son obligatorios")
        String accesorios,
        @NotNull(message = "El estado del prestamo es obligatorio")
        EstadoPrestamo estadoPrestamo,
        @NotNull(message = "El recurso es obligatorio")
        Long recursoId,
        @NotNull(message = "El usuario es obligatorio")
        Long usuarioId,
        @NotNull(message = "La reserva es obligatoria")
        Long reservaId
) {
}
