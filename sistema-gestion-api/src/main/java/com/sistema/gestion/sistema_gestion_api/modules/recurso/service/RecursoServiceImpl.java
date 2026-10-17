package com.sistema.gestion.sistema_gestion_api.modules.recurso.service;

import com.sistema.gestion.sistema_gestion_api.modules.categoria.model.Categoria;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.repository.CategoriaRepository;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.repository.PrestamoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.FranjaOcupadaResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.TipoRecurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.repository.ReservaRepository;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.model.Ubicacion;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.repository.UbicacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class RecursoServiceImpl implements RecursoService {

    private final RecursoRepository recursoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UbicacionRepository ubicacionRepository;
    private final ReservaRepository reservaRepository;
    private final PrestamoRepository prestamoRepository;

    public RecursoServiceImpl(RecursoRepository recursoRepository,
                              CategoriaRepository categoriaRepository,
                              UbicacionRepository ubicacionRepository, ReservaRepository reservaRepository, PrestamoRepository prestamoRepository) {
        this.recursoRepository = recursoRepository;
        this.categoriaRepository = categoriaRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.reservaRepository = reservaRepository;
        this.prestamoRepository = prestamoRepository;
    }

    @Override
    public List<RecursoResponseDTO> listarTodos() {
        return recursoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public RecursoResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Override
    public List<RecursoResponseDTO> buscarConFiltros(Long categoriaId, Long ubicacionId, TipoRecurso tipoRecurso, EstadoOperativo estadoOperativo) {
        return recursoRepository.buscarConFiltros(categoriaId, ubicacionId, tipoRecurso, estadoOperativo).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public RecursoResponseDTO crear(RecursoRequestDTO dto) {
        Recurso recurso = new Recurso();
        aplicarDatos(recurso, dto);
        return toResponse(recursoRepository.save(recurso));
    }

    @Override
    public RecursoResponseDTO actualizar(Long id, RecursoRequestDTO dto) {
        Recurso recurso = buscarEntidad(id);
        aplicarDatos(recurso, dto);
        return toResponse(recursoRepository.save(recurso));
    }

    @Override
    public void eliminar(Long id) {
        if (!recursoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso no encontrado: " + id);
        }

        boolean tieneReservas = reservaRepository.existsByRecursoId(id);
        boolean tienePrestamos = prestamoRepository.existsByRecursoId(id);

        if (tieneReservas || tienePrestamos) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede eliminar el recurso porque tiene reservas o préstamos asociados.");
        }

        recursoRepository.deleteById(id);
    }



    @Override
    public List<FranjaOcupadaResponseDTO> obtenerDisponibilidad(Long id, LocalDate fecha) {
        buscarEntidad(id);

        Instant inicioDia = fecha.atStartOfDay(ZoneId.of("UTC")).toInstant();
        Instant finDia = fecha.atTime(LocalTime.MAX).atZone(ZoneId.of("UTC")).toInstant();

        List<FranjaOcupadaResponseDTO> franjas = new ArrayList<>();

        reservaRepository.findReservasConfirmadasPorDia(id, inicioDia, finDia).forEach(reserva ->
                franjas.add(new FranjaOcupadaResponseDTO(reserva.getFechaHoraInicio(), reserva.getFechaHoraFin(), "RESERVA"))
        );

        prestamoRepository.findPrestamosActivosPorDia(id, inicioDia, finDia).forEach(prestamo ->
                franjas.add(new FranjaOcupadaResponseDTO(prestamo.getFechaHoraEntrega(), prestamo.getFechaHoraLimite(), "PRESTAMO"))
        );

        return franjas;
    }



    @Override
    @Transactional
    public RecursoResponseDTO habilitarRecurso(Long id) {
        Recurso recurso = buscarEntidad(id);

        if (recurso.getEstadoOperativo() != EstadoOperativo.BLOQUEADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El recurso no está BLOQUEADO. Estado actual: " + recurso.getEstadoOperativo());
        }

        recurso.setEstadoOperativo(EstadoOperativo.DISPONIBLE);
        return toResponse(recursoRepository.save(recurso));
    }




    private void aplicarDatos(Recurso recurso, RecursoRequestDTO dto) {
        recurso.setNombre(dto.nombre());
        recurso.setTipoRecurso(dto.tipoRecurso());
        recurso.setDescripcion(dto.descripcion());
        recurso.setCaracteristicas(dto.caracteristicas());
        recurso.setModalidadRecurso(dto.modalidadRecurso());
        recurso.setEstadoOperativo(dto.estadoOperativo());
        recurso.setCategoria(buscarCategoria(dto.categoriaId()));
        recurso.setUbicacion(buscarUbicacion(dto.ubicacionId()));
    }

    private Recurso buscarEntidad(Long id) {
        return recursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso no encontrado: " + id));
    }

    private Categoria buscarCategoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada: " + id));
    }

    private Ubicacion buscarUbicacion(Long id) {
        return ubicacionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ubicacion no encontrada: " + id));
    }

    private RecursoResponseDTO toResponse(Recurso recurso) {
        return new RecursoResponseDTO(
                recurso.getId(),
                recurso.getNombre(),
                recurso.getTipoRecurso(),
                recurso.getDescripcion(),
                recurso.getCaracteristicas(),
                recurso.getModalidadRecurso(),
                recurso.getEstadoOperativo(),
                recurso.getCategoria().getId(),
                recurso.getCategoria().getNombre(),
                recurso.getUbicacion().getId(),
                recurso.getUbicacion().getNombre()
        );
    }



}
