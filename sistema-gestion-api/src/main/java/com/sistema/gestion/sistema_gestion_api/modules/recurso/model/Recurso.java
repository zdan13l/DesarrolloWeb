package com.sistema.gestion.sistema_gestion_api.modules.recurso.model;

import com.sistema.gestion.sistema_gestion_api.modules.categoria.model.Categoria;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.model.Ubicacion;
import jakarta.persistence.*;

@Entity
public class Recurso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "tipo", nullable = false)
    private TipoRecurso tipoRecurso;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private String caracteristicas;

    @Column(name = "modalidad", nullable = false)
    private ModalidadRecurso modalidadRecurso;

    @Column(name = "estado_operativo", nullable = false)
    private EstadoOperativo estadoOperativo;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "ubicacion_id", nullable = false)
    private Ubicacion ubicacion;





    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public TipoRecurso getTipoRecurso() {
        return tipoRecurso;
    }

    public void setTipoRecurso(TipoRecurso tipoRecurso) {
        this.tipoRecurso = tipoRecurso;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCaracteristicas() {
        return caracteristicas;
    }

    public void setCaracteristicas(String caracteristicas) {
        this.caracteristicas = caracteristicas;
    }

    public ModalidadRecurso getModalidadRecurso() {
        return modalidadRecurso;
    }

    public void setModalidadRecurso(ModalidadRecurso modalidadRecurso) {
        this.modalidadRecurso = modalidadRecurso;
    }

    public EstadoOperativo getEstadoOperativo() {
        return estadoOperativo;
    }

    public void setEstadoOperativo(EstadoOperativo estadoOperativo) {
        this.estadoOperativo = estadoOperativo;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Ubicacion getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(Ubicacion ubicacion) {
        this.ubicacion = ubicacion;
    }
}
