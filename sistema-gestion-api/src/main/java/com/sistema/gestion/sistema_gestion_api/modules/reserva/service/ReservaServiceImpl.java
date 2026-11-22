package com.sistema.gestion.sistema_gestion_api.modules.reserva.service;

import com.sistema.gestion.sistema_gestion_api.modules.auth.service.UsuarioActual;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.ModalidadRecurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.dto.ReservaResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.EstadoReserva;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.Reserva;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.repository.ReservaRepository;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class ReservaServiceImpl implements ReservaService {

    private final ReservaRepository reservaRepository;
    private final RecursoRepository recursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioActual usuarioActual;

    public ReservaServiceImpl(ReservaRepository reservaRepository,
                              RecursoRepository recursoRepository,
                              UsuarioRepository usuarioRepository,
                              UsuarioActual usuarioActual) {
        this.reservaRepository = reservaRepository;
        this.recursoRepository = recursoRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioActual = usuarioActual;
    }

    @Override
    public List<ReservaResponseDTO> listarTodas() {
        if (usuarioActual.esSolicitante()) {
            return reservaRepository.findByUsuarioId(usuarioActual.id()).stream()
                    .map(this::toResponse)
                    .toList();
        }
        return reservaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ReservaResponseDTO obtenerPorId(Long id) {
        Reserva reserva = buscarEntidad(id);
        validarPropiedad(reserva);
        return toResponse(reserva);
    }

    @Override
    public List<ReservaResponseDTO> buscarPorRecurso(Long recursoId) {
        List<Reserva> reservas = reservaRepository.findByRecursoId(recursoId);
        if (usuarioActual.esSolicitante()) {
            Long actualId = usuarioActual.id();
            reservas = reservas.stream()
                    .filter(r -> r.getUsuario().getId().equals(actualId))
                    .toList();
        }
        return reservas.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ReservaResponseDTO> buscarPorUsuario(Long usuarioId) {
        Long objetivoId = usuarioActual.esSolicitante() ? usuarioActual.id() : usuarioId;
        return reservaRepository.findByUsuarioId(objetivoId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ReservaResponseDTO crear(ReservaRequestDTO dto) {
        validarCoherenciaFechas(dto.fechaHoraInicio(), dto.fechaHoraFin());

        Recurso recurso = buscarRecurso(dto.recursoId());
        validarReglasRecursoYDisponibilidadCreacion(recurso, dto.fechaHoraInicio(), dto.fechaHoraFin());

        Long usuarioIdEfectivo = usuarioActual.esSolicitante()
                ? usuarioActual.id()
                : (dto.usuarioId() != null ? dto.usuarioId() : usuarioActual.id());

        Reserva reserva = new Reserva();
        reserva.setFechaCreacion(Instant.now());
        reserva.setEstadoReserva(EstadoReserva.CONFIRMADA);

        aplicarDatos(reserva, dto, recurso, usuarioIdEfectivo);
        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    @Transactional
    public ReservaResponseDTO actualizar(Long id, ReservaRequestDTO dto) {
        Reserva reserva = buscarEntidad(id);
        validarPropiedad(reserva);

        if (reserva.getEstadoReserva() != EstadoReserva.CONFIRMADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Solo se pueden modificar reservas en estado CONFIRMADA.");
        }
        if (Instant.now().isAfter(reserva.getFechaHoraInicio())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede modificar una reserva que ya ha iniciado.");
        }

        validarCoherenciaFechas(dto.fechaHoraInicio(), dto.fechaHoraFin());

        Recurso recurso = buscarRecurso(dto.recursoId());
        validarReglasRecursoYDisponibilidadActualizacion(recurso, dto.fechaHoraInicio(), dto.fechaHoraFin(), id);

        Long usuarioIdEfectivo = usuarioActual.esSolicitante()
                ? usuarioActual.id()
                : (dto.usuarioId() != null ? dto.usuarioId() : reserva.getUsuario().getId());

        aplicarDatos(reserva, dto, recurso, usuarioIdEfectivo);
        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    @Transactional
    public ReservaResponseDTO cancelar(Long id) {
        Reserva reserva = buscarEntidad(id);
        validarPropiedad(reserva);

        if (reserva.getEstadoReserva() != EstadoReserva.CONFIRMADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La reserva no está en estado CONFIRMADA");
        }
        if (Instant.now().isAfter(reserva.getFechaHoraInicio())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede cancelar una reserva que ya ha iniciado");
        }

        reserva.setEstadoReserva(EstadoReserva.CANCELADA);
        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    public void eliminar(Long id) {
        if (!reservaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada: " + id);
        }
        reservaRepository.deleteById(id);
    }

    private void validarPropiedad(Reserva reserva) {
        if (usuarioActual.esSolicitante() && !reserva.getUsuario().getId().equals(usuarioActual.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permiso para acceder o modificar esta reserva");
        }
    }

    private void validarCoherenciaFechas(Instant inicio, Instant fin) {
        Instant ahora = Instant.now();
        if (inicio.isBefore(ahora)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se pueden crear reservas en el pasado");
        }
        if (!fin.isAfter(inicio)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha y hora de fin debe ser posterior a la de inicio");
        }
    }

    private void validarReglasRecursoYDisponibilidadCreacion(Recurso recurso, Instant inicio, Instant fin) {
        if (recurso.getEstadoOperativo() == EstadoOperativo.BLOQUEADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El recurso se encuentra BLOQUEADO y no puede ser reservado");
        }
        if (recurso.getModalidadRecurso() != ModalidadRecurso.RESERVABLE && recurso.getModalidadRecurso() != ModalidadRecurso.AMBAS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El recurso no permite la modalidad de reserva");
        }
        List<Reserva> solapamientos = reservaRepository.findSolapamientos(recurso.getId(), inicio, fin);
        if (!solapamientos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Existe un conflicto de horario con otra reserva confirmada");
        }
    }

    private void validarReglasRecursoYDisponibilidadActualizacion(Recurso recurso, Instant inicio, Instant fin, Long reservaId) {
        if (recurso.getEstadoOperativo() == EstadoOperativo.BLOQUEADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El recurso se encuentra BLOQUEADO y no puede ser reservado");
        }
        if (recurso.getModalidadRecurso() != ModalidadRecurso.RESERVABLE && recurso.getModalidadRecurso() != ModalidadRecurso.AMBAS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El recurso no permite la modalidad de reserva");
        }
        List<Reserva> solapamientos = reservaRepository.findSolapamientosExcluyendo(recurso.getId(), inicio, fin, reservaId);
        if (!solapamientos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Existe un conflicto de horario con otra reserva confirmada");
        }
    }

    private void aplicarDatos(Reserva reserva, ReservaRequestDTO dto, Recurso recurso, Long usuarioId) {
        reserva.setFechaHoraInicio(dto.fechaHoraInicio());
        reserva.setFechaHoraFin(dto.fechaHoraFin());
        reserva.setRecurso(recurso);
        reserva.setUsuario(buscarUsuario(usuarioId));
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