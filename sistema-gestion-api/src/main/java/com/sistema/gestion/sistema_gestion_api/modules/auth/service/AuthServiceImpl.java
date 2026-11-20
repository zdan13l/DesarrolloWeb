package com.sistema.gestion.sistema_gestion_api.modules.auth.service;

import com.sistema.gestion.sistema_gestion_api.modules.auth.dto.LoginRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.auth.dto.LoginResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.auth.dto.SesionUsuarioDTO;
import com.sistema.gestion.sistema_gestion_api.modules.auth.model.RolSistema;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String CREDENCIALES_INVALIDAS = "Correo o contrasena incorrectos";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UsuarioActual usuarioActual;

    public AuthServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                           JwtService jwtService, UsuarioActual usuarioActual) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.usuarioActual = usuarioActual;
    }

    @Override
    public LoginResponseDTO login(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(dto.correo().trim())
                .filter(Usuario::isActivo)
                .filter(u -> u.getPassword() != null && passwordEncoder.matches(dto.password(), u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, CREDENCIALES_INVALIDAS));

        RolSistema rol = rolDe(usuario);
        String token = jwtService.generar(usuario.getId(), usuario.getCorreo(), nombreCompleto(usuario), rol);
        return new LoginResponseDTO(token, "Bearer", jwtService.expiracionEnSegundos(), toSesion(usuario, rol));
    }

    @Override
    public SesionUsuarioDTO usuarioActual() {
        Usuario usuario = usuarioRepository.findById(usuarioActual.id())
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "El usuario de la sesion ya no esta disponible"));
        return toSesion(usuario, rolDe(usuario));
    }

    private RolSistema rolDe(Usuario usuario) {
        return RolSistema.desdeNombre(usuario.getRol() != null ? usuario.getRol().getNombre() : null)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "El usuario no tiene un rol valido asignado"));
    }

    private String nombreCompleto(Usuario usuario) {
        return usuario.getNombre() + " " + usuario.getApellido();
    }

    private SesionUsuarioDTO toSesion(Usuario usuario, RolSistema rol) {
        return new SesionUsuarioDTO(usuario.getId(), usuario.getNombre(), usuario.getApellido(),
                usuario.getCorreo(), rol.name());
    }
}
