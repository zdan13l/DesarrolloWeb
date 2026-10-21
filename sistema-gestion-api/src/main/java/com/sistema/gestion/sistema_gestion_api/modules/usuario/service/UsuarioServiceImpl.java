package com.sistema.gestion.sistema_gestion_api.modules.usuario.service;

import com.sistema.gestion.sistema_gestion_api.modules.incidente.repository.IncidenteRepository;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.repository.PrestamoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.repository.ReservaRepository;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.dto.RolResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.dto.UsuarioRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.dto.UsuarioResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Rol;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.repository.RolRepository;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final ReservaRepository reservaRepository;
    private final PrestamoRepository prestamoRepository;
    private final IncidenteRepository incidenteRepository;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, RolRepository rolRepository,
                               ReservaRepository reservaRepository, PrestamoRepository prestamoRepository,
                               IncidenteRepository incidenteRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.reservaRepository = reservaRepository;
        this.prestamoRepository = prestamoRepository;
        this.incidenteRepository = incidenteRepository;
    }

    @Override
    public List<RolResponseDTO> listarRoles() {
        return rolRepository.findAll().stream()
                .map(rol -> new RolResponseDTO(rol.getId(), rol.getNombre()))
                .toList();
    }

    @Override
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UsuarioResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Override
    public List<UsuarioResponseDTO> listarActivos() {
        return usuarioRepository.findByActivoTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UsuarioResponseDTO crear(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByCorreoIgnoreCase(dto.correo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(dto.nombre());
        usuario.setApellido(dto.apellido());
        usuario.setCorreo(dto.correo());
        usuario.setActivo(dto.activo());
        usuario.setRol(buscarRol(dto.rolId()));
        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = buscarEntidad(id);
        usuarioRepository.findByCorreoIgnoreCase(dto.correo())
                .filter(otro -> !otro.getId().equals(id))
                .ifPresent(otro -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo");
                });
        usuario.setNombre(dto.nombre());
        usuario.setApellido(dto.apellido());
        usuario.setCorreo(dto.correo());
        usuario.setActivo(dto.activo());
        usuario.setRol(buscarRol(dto.rolId()));
        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado: " + id);
        }
        boolean tieneHistorial = !reservaRepository.findByUsuarioId(id).isEmpty()
                || !prestamoRepository.findByUsuarioId(id).isEmpty()
                || incidenteRepository.existsByUsuarioId(id);
        if (tieneHistorial) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede eliminar el usuario porque tiene reservas, préstamos o incidentes asociados.");
        }
        usuarioRepository.deleteById(id);
    }

    private Usuario buscarEntidad(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado: " + id));
    }

    private Rol buscarRol(Long rolId) {
        return rolRepository.findById(rolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado: " + rolId));
    }

    private UsuarioResponseDTO toResponse(Usuario usuario) {
        Rol rol = usuario.getRol();
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.isActivo(),
                rol != null ? rol.getId() : null,
                rol != null ? rol.getNombre() : null
        );
    }
}
