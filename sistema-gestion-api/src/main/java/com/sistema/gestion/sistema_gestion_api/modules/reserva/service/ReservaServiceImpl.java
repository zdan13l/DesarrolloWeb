package com.sistema.gestion.sistema_gestion_api.modules.reserva.service;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.Reserva;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.repository.ReservaRepository;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class ReservaServiceImpl implements ReservaService {

    private final ReservaRepository reservaRepository;
    private final RecursoRepository recursoRepository;
    private final UsuarioRepository usuarioRepository;

    public ReservaServiceImpl(ReservaRepository reservaRepository,
                               RecursoRepository recursoRepository,
                               UsuarioRepository usuarioRepository) {
        this.reservaRepository = reservaRepository;
        this.recursoRepository = recursoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<ReservaResponseDTO> listarTodas() {
        return reservaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ReservaResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Override
    public List<ReservaResponseDTO> buscarPorRecurso(Long recursoId) {
        return reservaRepository.findByRecursoId(recursoId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ReservaResponseDTO> buscarPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ReservaResponseDTO crear(ReservaRequestDTO dto) {
        Reserva reserva = new Reserva();
        reserva.setFechaCreacion(Instant.now());
        aplicarDatos(reserva, dto);
        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    public ReservaResponseDTO actualizar(Long id, ReservaRequestDTO dto) {
        Reserva reserva = buscarEntidad(id);
        aplicarDatos(reserva, dto);
        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    public void eliminar(Long id) {
        if (!reservaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada: " + id);
        }
        reservaRepository.deleteById(id);
    }

    private void aplicarDatos(Reserva reserva, ReservaRequestDTO dto) {
        reserva.setFechaHoraInicio(dto.fechaHoraInicio());
        reserva.setFechaHoraFin(dto.fechaHoraFin());
        reserva.setEstadoReserva(dto.estadoReserva());
        reserva.setRecurso(buscarRecurso(dto.recursoId()));
        reserva.setUsuario(buscarUsuario(dto.usuarioId()));
    }

    private Reserva buscarEntidad(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada: " + id));
    }

    private Recurso buscarRecurso(Long id) {
        return recursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso no encontrado: " + id));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado: " + id));
    }

    private ReservaResponseDTO toResponse(Reserva reserva) {
        return new ReservaResponseDTO(
                reserva.getId(),
                reserva.getFechaHoraInicio(),
                reserva.getFechaHoraFin(),
                reserva.getFechaCreacion(),
                reserva.getEstadoReserva(),
                reserva.getRecurso().getId(),
                reserva.getRecurso().getNombre(),
                reserva.getUsuario().getId(),
                reserva.getUsuario().getNombre()
        );
    }
}
