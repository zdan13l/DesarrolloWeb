package com.sistema.gestion.sistema_gestion_api.modules.auth.service;

import com.sistema.gestion.sistema_gestion_api.modules.auth.dto.LoginRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.auth.dto.LoginResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.auth.dto.SesionUsuarioDTO;

public interface AuthService {

    LoginResponseDTO login(LoginRequestDTO dto);

    SesionUsuarioDTO usuarioActual();
}
