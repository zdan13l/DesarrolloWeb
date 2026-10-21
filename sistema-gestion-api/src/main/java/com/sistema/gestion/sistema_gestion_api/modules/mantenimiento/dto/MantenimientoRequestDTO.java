package com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.dto;

import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.EstadoMantenimiento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

/**
 * Solicitud de apertura (POST) o actualización (PUT) de un mantenimiento.
 * El servidor fija el estado inicial (ABIERTA) y la fecha de cierre; el cliente solo puede enviar
 * {@code estadoMantenimiento} en un PUT para pasar de ABIERTA a EN_PROCESO.
 */
public record MantenimientoRequestDTO(
        /** Opcional: si no llega se usa la hora actual. */
        Instant fechaApertura,
        /** Se ignora: la fecha de cierre la fija el servidor al finalizar o cancelar. */
        Instant fechaCierre,
        EstadoMantenimiento estadoMantenimiento,
        @NotBlank(message = "El diagnostico es obligatorio")
        String diagnostico,
        @NotBlank(message = "Las observaciones son obligatorias")
        String observaciones,
        @NotNull(message = "El recurso es obligatorio")
        Long recursoId
) {
}
