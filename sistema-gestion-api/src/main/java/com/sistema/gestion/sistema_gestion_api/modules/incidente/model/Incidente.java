package com.sistema.gestion.sistema_gestion_api.modules.incidente.model;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import jakarta.persistence.*;
import java.time.Instant;


@Entity
public class Incidente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoIncidente tipoIncidente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeveridadIncidente severidadIncidente;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Instant fecha; //revisar el tipo de dato

    @ManyToOne
    @JoinColumn(name = "recurso_id", nullable = false)
    private Recurso recurso;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;





    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TipoIncidente getTipoIncidente() {
        return tipoIncidente;
    }

    public void setTipoIncidente(TipoIncidente tipoIncidente) {
        this.tipoIncidente = tipoIncidente;
    }

    public SeveridadIncidente getSeveridadIncidente() {
        return severidadIncidente;
    }

    public void setSeveridadIncidente(SeveridadIncidente severidadIncidente) {
        this.severidadIncidente = severidadIncidente;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Instant getFecha() {
        return fecha;
    }

    public void setFecha(Instant fecha) {
        this.fecha = fecha;
    }

    public Recurso getRecurso() {
        return recurso;
    }

    public void setRecurso(Recurso recurso) {
        this.recurso = recurso;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
