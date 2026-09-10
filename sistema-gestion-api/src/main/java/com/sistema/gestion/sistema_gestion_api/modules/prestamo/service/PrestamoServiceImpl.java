package com.sistema.gestion.sistema_gestion_api.modules.prestamo.service;

import com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto.PrestamoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.dto.PrestamoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.Prestamo;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.repository.PrestamoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
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
public class PrestamoServiceImpl implements PrestamoService {

    private final PrestamoRepository prestamoRepository;
    private final RecursoRepository recursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;

    public PrestamoServiceImpl(PrestamoRepository prestamoRepository,
                                RecursoRepository recursoRepository,
                                UsuarioRepository usuarioRepository,
                                ReservaRepository reservaRepository) {
        this.prestamoRepository = prestamoRepository;
        this.recursoRepository = recursoRepository;
        this.usuarioRepository = usuarioRepository;
        this.reservaRepository = reservaRepository;
    }

    @Override
    public List<PrestamoResponseDTO> listarTodos() {
        return prestamoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PrestamoResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Override
    public List<PrestamoResponseDTO> buscarPorRecurso(Long recursoId) {
        return prestamoRepository.findByRecursoId(recursoId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<PrestamoResponseDTO> buscarPorUsuario(Long usuarioId) {
        return prestamoRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<PrestamoResponseDTO> buscarVencidos() {
        return prestamoRepository.buscarVencidos(Instant.now()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PrestamoResponseDTO crear(PrestamoRequestDTO dto) {
        Prestamo prestamo = new Prestamo();
        aplicarDatos(prestamo, dto);
        return toResponse(prestamoRepository.save(prestamo));
    }

    @Override
    public PrestamoResponseDTO actualizar(Long id, PrestamoRequestDTO dto) {
        Prestamo prestamo = buscarEntidad(id);
        aplicarDatos(prestamo, dto);
        return toResponse(prestamoRepository.save(prestamo));
    }

    @Override
    public void eliminar(Long id) {
        if (!prestamoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Prestamo no encontrado: " + id);
        }
        prestamoRepository.deleteById(id);
    }

    private void aplicarDatos(Prestamo prestamo, PrestamoRequestDTO dto) {
        prestamo.setFechaHoraEntrega(dto.fechaHoraEntrega());
        prestamo.setFechaHoraLimite(dto.fechaHoraLimite());
        prestamo.setFechaHoraDevolucion(dto.fechaHoraDevolucion());
        prestamo.setEstadoInicial(dto.estadoInicial());
        prestamo.setEstadoFinal(dto.estadoFinal());
        prestamo.setObservaciones(dto.observaciones());
        prestamo.setAccesorios(dto.accesorios());
        prestamo.setEstadoPrestamo(dto.estadoPrestamo());
        prestamo.setRecurso(buscarRecurso(dto.recursoId()));
        prestamo.setUsuario(buscarUsuario(dto.usuarioId()));
        prestamo.setReserva(buscarReserva(dto.reservaId()));
    }

    private Prestamo buscarEntidad(Long id) {
        return prestamoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prestamo no encontrado: " + id));
    }

    private Recurso buscarRecurso(Long id) {
        return recursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso no encontrado: " + id));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado: " + id));
    }

    private Reserva buscarReserva(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada: " + id));
    }

    private PrestamoResponseDTO toResponse(Prestamo prestamo) {
        return new PrestamoResponseDTO(
                prestamo.getId(),
                prestamo.getFechaHoraEntrega(),
                prestamo.getFechaHoraLimite(),
                prestamo.getFechaHoraDevolucion(),
                prestamo.getEstadoInicial(),
                prestamo.getEstadoFinal(),
                prestamo.getObservaciones(),
                prestamo.getAccesorios(),
                prestamo.getEstadoPrestamo(),
                prestamo.getRecurso().getId(),
                prestamo.getRecurso().getNombre(),
                prestamo.getUsuario().getId(),
                prestamo.getUsuario().getNombre(),
                prestamo.getReserva().getId()
        );
    }
}
