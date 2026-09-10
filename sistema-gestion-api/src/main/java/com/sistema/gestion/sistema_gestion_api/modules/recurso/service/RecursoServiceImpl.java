package com.sistema.gestion.sistema_gestion_api.modules.recurso.service;

import com.sistema.gestion.sistema_gestion_api.modules.categoria.model.Categoria;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.repository.CategoriaRepository;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.dto.RecursoResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.TipoRecurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.model.Ubicacion;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.repository.UbicacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RecursoServiceImpl implements RecursoService {

    private final RecursoRepository recursoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UbicacionRepository ubicacionRepository;

    public RecursoServiceImpl(RecursoRepository recursoRepository,
                               CategoriaRepository categoriaRepository,
                               UbicacionRepository ubicacionRepository) {
        this.recursoRepository = recursoRepository;
        this.categoriaRepository = categoriaRepository;
        this.ubicacionRepository = ubicacionRepository;
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
        recursoRepository.deleteById(id);
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
