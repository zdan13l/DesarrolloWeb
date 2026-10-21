package com.sistema.gestion.sistema_gestion_api.modules.incidente.service;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.dto.IncidenteRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.dto.IncidenteResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.Incidente;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.SeveridadIncidente;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.repository.IncidenteRepository;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class IncidenteServiceImpl implements IncidenteService {

    private final IncidenteRepository incidenteRepository;
    private final RecursoRepository recursoRepository;
    private final UsuarioRepository usuarioRepository;

    public IncidenteServiceImpl(IncidenteRepository incidenteRepository,
                                 RecursoRepository recursoRepository,
                                 UsuarioRepository usuarioRepository) {
        this.incidenteRepository = incidenteRepository;
        this.recursoRepository = recursoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<IncidenteResponseDTO> listarTodos() {
        return incidenteRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public IncidenteResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Override
    public List<IncidenteResponseDTO> buscarPorRecurso(Long recursoId) {
        return incidenteRepository.findByRecursoId(recursoId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** RN-04: un incidente CRITICA bloquea el recurso en la misma transacción en que se guarda. */
    @Override
    @Transactional
    public IncidenteResponseDTO crear(IncidenteRequestDTO dto) {
        Incidente incidente = new Incidente();
        aplicarDatos(incidente, dto);
        incidente.setRecursoBloqueado(bloquearSiEsCritico(incidente));
        return toResponse(incidenteRepository.save(incidente));
    }

    @Override
    @Transactional
    public IncidenteResponseDTO actualizar(Long id, IncidenteRequestDTO dto) {
        Incidente incidente = buscarEntidad(id);
        aplicarDatos(incidente, dto);
        // Si el reporte pasa a CRITICA se bloquea; si ya había bloqueado el recurso, el indicador se conserva.
        boolean bloqueaAhora = bloquearSiEsCritico(incidente);
        incidente.setRecursoBloqueado(bloqueaAhora || Boolean.TRUE.equals(incidente.getRecursoBloqueado()));
        return toResponse(incidenteRepository.save(incidente));
    }

    private boolean bloquearSiEsCritico(Incidente incidente) {
        if (incidente.getSeveridadIncidente() != SeveridadIncidente.CRITICA) {
            return false;
        }
        Recurso recurso = incidente.getRecurso();
        recurso.setEstadoOperativo(EstadoOperativo.BLOQUEADO);
        recursoRepository.save(recurso);
        return true;
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!incidenteRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente no encontrado: " + id);
        }
        incidenteRepository.deleteById(id);
    }

    private void aplicarDatos(Incidente incidente, IncidenteRequestDTO dto) {
        incidente.setTipoIncidente(dto.tipoIncidente());
        incidente.setSeveridadIncidente(dto.severidadIncidente());
        incidente.setDescripcion(dto.descripcion());
        incidente.setFecha(dto.fecha());
        incidente.setRecurso(buscarRecurso(dto.recursoId()));
        incidente.setUsuario(buscarUsuario(dto.usuarioId()));
    }

    private Incidente buscarEntidad(Long id) {
        return incidenteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente no encontrado: " + id));
    }

    private Recurso buscarRecurso(Long id) {
        return recursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso no encontrado: " + id));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado: " + id));
    }

    private IncidenteResponseDTO toResponse(Incidente incidente) {
        return new IncidenteResponseDTO(
                incidente.getId(),
                incidente.getTipoIncidente(),
                incidente.getSeveridadIncidente(),
                incidente.getDescripcion(),
                incidente.getFecha(),
                incidente.getRecurso().getId(),
                incidente.getRecurso().getNombre(),
                incidente.getUsuario().getId(),
                incidente.getUsuario().getNombre(),
                incidente.getRecursoBloqueado()
        );
    }
}
