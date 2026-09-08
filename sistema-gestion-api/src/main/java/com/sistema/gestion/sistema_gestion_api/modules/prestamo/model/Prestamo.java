package com.sistema.gestion.sistema_gestion_api.modules.prestamo.model;

import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.Reserva;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
public class Prestamo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_hora_entrega", nullable = false)
    private Instant fechaHoraEntrega;

    @Column(name = "fecha_hora_limite", nullable = false)
    private Instant fechaHoraLimite;


    @Column(name = "fecha_hora_devolucion")
    private Instant fechaHoraDevolucion;


    @Enumerated(EnumType.STRING)
    @Column(name = "estado_inicial", nullable = false)
    private EstadoFisico estadoInicial;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_final", nullable = false)
    private EstadoFisico estadoFinal;

    @Column(nullable = false)
    private String observaciones;

    @Column(nullable = false)
    private String accesorios;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPrestamo estadoPrestamo;

    @ManyToOne
    @JoinColumn(name = "recurso_id", nullable = false)
    private Recurso recurso;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;







    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getFechaHoraEntrega() {
        return fechaHoraEntrega;
    }

    public void setFechaHoraEntrega(Instant fechaHoraEntrega) {
        this.fechaHoraEntrega = fechaHoraEntrega;
    }

    public Instant getFechaHoraLimite() {
        return fechaHoraLimite;
    }

    public void setFechaHoraLimite(Instant fechaHoraLimite) {
        this.fechaHoraLimite = fechaHoraLimite;
    }

    public Instant getFechaHoraDevolucion() {
        return fechaHoraDevolucion;
    }

    public void setFechaHoraDevolucion(Instant fechaHoraDevolucion) {
        this.fechaHoraDevolucion = fechaHoraDevolucion;
    }

    public EstadoFisico getEstadoInicial() {
        return estadoInicial;
    }

    public void setEstadoInicial(EstadoFisico estadoInicial) {
        this.estadoInicial = estadoInicial;
    }

    public EstadoFisico getEstadoFinal() {
        return estadoFinal;
    }

    public void setEstadoFinal(EstadoFisico estadoFinal) {
        this.estadoFinal = estadoFinal;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getAccesorios() {
        return accesorios;
    }

    public void setAccesorios(String accesorios) {
        this.accesorios = accesorios;
    }

    public EstadoPrestamo getEstadoPrestamo() {
        return estadoPrestamo;
    }

    public void setEstadoPrestamo(EstadoPrestamo estadoPrestamo) {
        this.estadoPrestamo = estadoPrestamo;
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

    public Reserva getReserva() {
        return reserva;
    }

    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
    }
}
