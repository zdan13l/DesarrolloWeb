DROP TABLE IF EXISTS mantenimiento;
DROP TABLE IF EXISTS incidente;
DROP TABLE IF EXISTS prestamo;
DROP TABLE IF EXISTS reserva;
DROP TABLE IF EXISTS recurso;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS ubicacion;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS rol;

CREATE TABLE rol (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL,
    rol_id BIGINT,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES rol(id)
);

CREATE TABLE categoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE ubicacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    edificio VARCHAR(255) NOT NULL,
    piso INT NOT NULL,
    detalle VARCHAR(255)
);

CREATE TABLE recurso (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    caracteristicas VARCHAR(255) NOT NULL,
    modalidad VARCHAR(50) NOT NULL,
    estado_operativo VARCHAR(50) NOT NULL,
    categoria_id BIGINT NOT NULL,
    ubicacion_id BIGINT NOT NULL,
    CONSTRAINT fk_recurso_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id),
    CONSTRAINT fk_recurso_ubicacion FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(id)
);

CREATE TABLE reserva (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    estado VARCHAR(50) NOT NULL,
    recurso_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_reserva_recurso FOREIGN KEY (recurso_id) REFERENCES recurso(id),
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE prestamo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora_entrega TIMESTAMP NOT NULL,
    fecha_hora_limite TIMESTAMP NOT NULL,
    fecha_hora_devolucion TIMESTAMP,
    estado_inicial VARCHAR(50) NOT NULL,
    estado_final VARCHAR(50) NOT NULL,
    observaciones VARCHAR(255) NOT NULL,
    accesorios VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    recurso_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    reserva_id BIGINT NOT NULL,
    CONSTRAINT fk_prestamo_recurso FOREIGN KEY (recurso_id) REFERENCES recurso(id),
    CONSTRAINT fk_prestamo_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    CONSTRAINT fk_prestamo_reserva FOREIGN KEY (reserva_id) REFERENCES reserva(id)
);

CREATE TABLE incidente (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo_incidente VARCHAR(50) NOT NULL,
    severidad_incidente VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    recurso_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_incidente_recurso FOREIGN KEY (recurso_id) REFERENCES recurso(id),
    CONSTRAINT fk_incidente_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE mantenimiento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_apertura TIMESTAMP NOT NULL,
    fecha_cierre TIMESTAMP,
    estado VARCHAR(50) NOT NULL,
    diagnostico VARCHAR(255) NOT NULL,
    observaciones VARCHAR(255) NOT NULL,
    recurso_id BIGINT NOT NULL,
    CONSTRAINT fk_mantenimiento_recurso FOREIGN KEY (recurso_id) REFERENCES recurso(id)
);
