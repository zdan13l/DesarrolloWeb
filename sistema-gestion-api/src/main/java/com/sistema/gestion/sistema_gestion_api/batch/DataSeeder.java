package com.sistema.gestion.sistema_gestion_api.batch;

import com.sistema.gestion.sistema_gestion_api.modules.categoria.model.Categoria;
import com.sistema.gestion.sistema_gestion_api.modules.categoria.repository.CategoriaRepository;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.Incidente;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.SeveridadIncidente;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.model.TipoIncidente;
import com.sistema.gestion.sistema_gestion_api.modules.incidente.repository.IncidenteRepository;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.EstadoMantenimiento;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.model.Mantenimiento;
import com.sistema.gestion.sistema_gestion_api.modules.mantenimiento.repository.MantenimientoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.EstadoFisico;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.EstadoPrestamo;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.model.Prestamo;
import com.sistema.gestion.sistema_gestion_api.modules.prestamo.repository.PrestamoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.EstadoOperativo;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.ModalidadRecurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.Recurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.model.TipoRecurso;
import com.sistema.gestion.sistema_gestion_api.modules.recurso.repository.RecursoRepository;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.EstadoReserva;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.model.Reserva;
import com.sistema.gestion.sistema_gestion_api.modules.reserva.repository.ReservaRepository;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.model.Ubicacion;
import com.sistema.gestion.sistema_gestion_api.modules.ubicacion.repository.UbicacionRepository;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Rol;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.model.Usuario;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.repository.RolRepository;
import com.sistema.gestion.sistema_gestion_api.modules.usuario.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CategoriaRepository categoriaRepository;
    private final UbicacionRepository ubicacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final RecursoRepository recursoRepository;
    private final ReservaRepository reservaRepository;
    private final PrestamoRepository prestamoRepository;
    private final IncidenteRepository incidenteRepository;
    private final MantenimientoRepository mantenimientoRepository;

    public DataSeeder(CategoriaRepository categoriaRepository,
                       UbicacionRepository ubicacionRepository,
                       UsuarioRepository usuarioRepository,
                       RolRepository rolRepository,
                       RecursoRepository recursoRepository,
                       ReservaRepository reservaRepository,
                       PrestamoRepository prestamoRepository,
                       IncidenteRepository incidenteRepository,
                       MantenimientoRepository mantenimientoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.recursoRepository = recursoRepository;
        this.reservaRepository = reservaRepository;
        this.prestamoRepository = prestamoRepository;
        this.incidenteRepository = incidenteRepository;
        this.mantenimientoRepository = mantenimientoRepository;
    }

    @Override
    public void run(String... args) {
        if (categoriaRepository.count() > 0) {
            log.info("DataSeeder: ya hay datos, se omite la carga.");
            return;
        }

        Categoria catAulas = categoria("Aulas", "Espacios para clases regulares");
        Categoria catLabs = categoria("Laboratorios", "Salas con equipo especializado");
        Categoria catEquipos = categoria("Equipos audiovisuales", "Proyectores, cámaras y portátiles");

        Ubicacion edA101 = ubicacion("Aula 101", "Edificio A", 1, "Capacidad 40 personas");
        Ubicacion edB204 = ubicacion("Laboratorio 204", "Edificio B", 2, "Laboratorio de sistemas");
        Ubicacion bodega = ubicacion("Bodega de equipos", "Edificio A", 0, "Almacén de préstamos");

        Rol rolSolicitante = rol("Solicitante");
        Rol rolGestor = rol("Gestor de recursos");
        Rol rolAdministrador = rol("Administrador");

        Usuario docente = usuario("Ana", "Martínez", "ana.martinez@campus.edu", rolSolicitante);
        Usuario estudiante = usuario("Luis", "Pérez", "luis.perez@campus.edu", rolSolicitante);
        Usuario gestor = usuario("Camila", "Rojas", "camila.rojas@campus.edu", rolGestor);

        Recurso aula101 = recurso("Aula 101", TipoRecurso.ESPACIO, "Aula estándar con proyector",
                "Capacidad 40, tablero, proyector", ModalidadRecurso.RESERVABLE,
                EstadoOperativo.DISPONIBLE, catAulas, edA101);

        Recurso labSistemas = recurso("Laboratorio de Sistemas", TipoRecurso.ESPACIO,
                "Laboratorio con 20 equipos de cómputo", "20 PC, aire acondicionado",
                ModalidadRecurso.RESERVABLE, EstadoOperativo.DISPONIBLE, catLabs, edB204);

        Recurso proyectorPortatil = recurso("Proyector portátil Epson", TipoRecurso.EQUIPO,
                "Proyector portátil para préstamo", "HDMI, 3000 lúmenes",
                ModalidadRecurso.PRESTABLE, EstadoOperativo.DISPONIBLE, catEquipos, bodega);

        Recurso portatilDell = recurso("Portátil Dell Latitude", TipoRecurso.EQUIPO,
                "Portátil para préstamo a estudiantes", "Core i5, 8GB RAM",
                ModalidadRecurso.AMBAS, EstadoOperativo.BLOQUEADO, catEquipos, bodega);

        Instant ahora = Instant.now();

        reserva(aula101, docente, ahora.plus(1, ChronoUnit.DAYS),
                ahora.plus(1, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS), EstadoReserva.CONFIRMADA);

        reserva(labSistemas, estudiante, ahora.plus(2, ChronoUnit.DAYS),
                ahora.plus(2, ChronoUnit.DAYS).plus(3, ChronoUnit.HOURS), EstadoReserva.CONFIRMADA);

        prestamo(proyectorPortatil, estudiante,
                ahora.minus(3, ChronoUnit.DAYS), ahora.minus(1, ChronoUnit.DAYS),
                EstadoPrestamo.DEVUELTO, EstadoFisico.BUENO, EstadoFisico.BUENO,
                "Sin novedades", "Cable HDMI, control remoto", ahora.minus(1, ChronoUnit.DAYS));

        prestamo(portatilDell, estudiante,
                ahora.minus(1, ChronoUnit.DAYS), ahora.plus(1, ChronoUnit.DAYS),
                EstadoPrestamo.ACTIVO, EstadoFisico.BUENO, EstadoFisico.BUENO,
                "Préstamo en curso", "Cargador", null);

        incidente(portatilDell, gestor, TipoIncidente.FALLA_FUNCIONAMIENTO,
                SeveridadIncidente.CRITICA, "El portátil no enciende, posible falla de fuente");

        mantenimiento(portatilDell, ahora.minus(1, ChronoUnit.HOURS), null,
                EstadoMantenimiento.ABIERTA, "Revisión de fuente de poder", "Pendiente diagnóstico técnico");

        log.info("DataSeeder: datos de prueba cargados correctamente.");
    }

    private Categoria categoria(String nombre, String descripcion) {
        Categoria c = new Categoria();
        c.setNombre(nombre);
        c.setDescripcion(descripcion);
        return categoriaRepository.save(c);
    }

    private Ubicacion ubicacion(String nombre, String edificio, int piso, String detalle) {
        Ubicacion u = new Ubicacion();
        u.setNombre(nombre);
        u.setEdificio(edificio);
        u.setPiso(piso);
        u.setDetalle(detalle);
        return ubicacionRepository.save(u);
    }

    private Rol rol(String nombre) {
        Rol r = new Rol();
        r.setNombre(nombre);
        return rolRepository.save(r);
    }

    private Usuario usuario(String nombre, String apellido, String correo, Rol rol) {
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setApellido(apellido);
        u.setCorreo(correo);
        u.setActivo(true);
        u.setRol(rol);
        return usuarioRepository.save(u);
    }

    private Recurso recurso(String nombre, TipoRecurso tipo, String descripcion, String caracteristicas,
                             ModalidadRecurso modalidad, EstadoOperativo estado, Categoria categoria, Ubicacion ubicacion) {
        Recurso r = new Recurso();
        r.setNombre(nombre);
        r.setTipoRecurso(tipo);
        r.setDescripcion(descripcion);
        r.setCaracteristicas(caracteristicas);
        r.setModalidadRecurso(modalidad);
        r.setEstadoOperativo(estado);
        r.setCategoria(categoria);
        r.setUbicacion(ubicacion);
        return recursoRepository.save(r);
    }

    private Reserva reserva(Recurso recurso, Usuario usuario, Instant inicio, Instant fin, EstadoReserva estado) {
        Reserva r = new Reserva();
        r.setRecurso(recurso);
        r.setUsuario(usuario);
        r.setFechaHoraInicio(inicio);
        r.setFechaHoraFin(fin);
        r.setFechaCreacion(Instant.now());
        r.setEstadoReserva(estado);
        return reservaRepository.save(r);
    }

    private Prestamo prestamo(Recurso recurso, Usuario usuario, Instant entrega, Instant limite,
                               EstadoPrestamo estadoPrestamo, EstadoFisico estadoInicial, EstadoFisico estadoFinal,
                               String observaciones, String accesorios, Instant devolucion) {
        Reserva reservaBase = reserva(recurso, usuario, entrega, limite, EstadoReserva.FINALIZADA);

        Prestamo p = new Prestamo();
        p.setRecurso(recurso);
        p.setUsuario(usuario);
        p.setReserva(reservaBase);
        p.setFechaHoraEntrega(entrega);
        p.setFechaHoraLimite(limite);
        p.setFechaHoraDevolucion(devolucion);
        p.setEstadoPrestamo(estadoPrestamo);
        p.setEstadoInicial(estadoInicial);
        p.setEstadoFinal(estadoFinal);
        p.setObservaciones(observaciones);
        p.setAccesorios(accesorios);
        return prestamoRepository.save(p);
    }

    private Incidente incidente(Recurso recurso, Usuario usuario, TipoIncidente tipo,
                                 SeveridadIncidente severidad, String descripcion) {
        Incidente i = new Incidente();
        i.setRecurso(recurso);
        i.setUsuario(usuario);
        i.setTipoIncidente(tipo);
        i.setSeveridadIncidente(severidad);
        i.setDescripcion(descripcion);
        i.setFecha(Instant.now());
        return incidenteRepository.save(i);
    }

    private Mantenimiento mantenimiento(Recurso recurso, Instant apertura, Instant cierre,
                                         EstadoMantenimiento estado, String diagnostico, String observaciones) {
        Mantenimiento m = new Mantenimiento();
        m.setRecurso(recurso);
        m.setFechaApertura(apertura);
        m.setFechaCierre(cierre);
        m.setEstadoMantenimiento(estado);
        m.setDiagnostico(diagnostico);
        m.setObservaciones(observaciones);
        return mantenimientoRepository.save(m);
    }
}
