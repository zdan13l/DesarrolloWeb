package com.sistema.gestion.sistema_gestion_api.modules.reserva.repository;

import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
}
