package com.sistema.gestion.sistema_gestion_api.modules.categoria.service;

import com.sistema.gestion.sistema_gestion_api.modules.categoria.dto.CategoriaRequestDTO;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.dto.CategoriaResponseDTO;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.model.Categoria;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.repository.CategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    public List<CategoriaResponseDTO> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CategoriaResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Override
    public List<CategoriaResponseDTO> buscarPorNombre(String nombre) {
        return categoriaRepository.findByNombreContainingIgnoreCase(nombre).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CategoriaResponseDTO crear(CategoriaRequestDTO dto) {
        Categoria categoria = new Categoria();
        categoria.setNombre(dto.nombre());
        categoria.setDescripcion(dto.descripcion());
        return toResponse(categoriaRepository.save(categoria));
    }

    @Override
    public CategoriaResponseDTO actualizar(Long id, CategoriaRequestDTO dto) {
        Categoria categoria = buscarEntidad(id);
        categoria.setNombre(dto.nombre());
        categoria.setDescripcion(dto.descripcion());
        return toResponse(categoriaRepository.save(categoria));
    }

    @Override
    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada: " + id);
        }
        categoriaRepository.deleteById(id);
    }

    private Categoria buscarEntidad(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada: " + id));
    }

    private CategoriaResponseDTO toResponse(Categoria categoria) {
        return new CategoriaResponseDTO(categoria.getId(), categoria.getNombre(), categoria.getDescripcion());
    }
}
