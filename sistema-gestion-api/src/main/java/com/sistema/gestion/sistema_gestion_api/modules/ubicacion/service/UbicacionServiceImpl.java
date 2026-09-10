package com.sistema.gestion.sistema_gestion_api.modules.ubicacion.service;

import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto.UbicacionRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.dto.UbicacionResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.model.Ubicacion;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.repository.UbicacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UbicacionServiceImpl implements UbicacionService {

    private final UbicacionRepository ubicacionRepository;

    public UbicacionServiceImpl(UbicacionRepository ubicacionRepository) {
        this.ubicacionRepository = ubicacionRepository;
    }

    @Override
    public List<UbicacionResponseDTO> listarTodas() {
        return ubicacionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UbicacionResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Override
    public List<UbicacionResponseDTO> buscarPorEdificio(String edificio) {
        return ubicacionRepository.findByEdificioIgnoreCase(edificio).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UbicacionResponseDTO crear(UbicacionRequestDTO dto) {
        Ubicacion ubicacion = new Ubicacion();
        ubicacion.setNombre(dto.nombre());
        ubicacion.setEdificio(dto.edificio());
        ubicacion.setPiso(dto.piso());
        ubicacion.setDetalle(dto.detalle());
        return toResponse(ubicacionRepository.save(ubicacion));
    }

    @Override
    public UbicacionResponseDTO actualizar(Long id, UbicacionRequestDTO dto) {
        Ubicacion ubicacion = buscarEntidad(id);
        ubicacion.setNombre(dto.nombre());
        ubicacion.setEdificio(dto.edificio());
        ubicacion.setPiso(dto.piso());
        ubicacion.setDetalle(dto.detalle());
        return toResponse(ubicacionRepository.save(ubicacion));
    }

    @Override
    public void eliminar(Long id) {
        if (!ubicacionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ubicacion no encontrada: " + id);
        }
        ubicacionRepository.deleteById(id);
    }

    private Ubicacion buscarEntidad(Long id) {
        return ubicacionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ubicacion no encontrada: " + id));
    }

    private UbicacionResponseDTO toResponse(Ubicacion ubicacion) {
        return new UbicacionResponseDTO(
                ubicacion.getId(),
                ubicacion.getNombre(),
                ubicacion.getEdificio(),
                ubicacion.getPiso(),
                ubicacion.getDetalle()
        );
    }
}
