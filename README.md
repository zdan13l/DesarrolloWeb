# Sistema de Gestión de Recursos

Proyecto de Desarrollo Web — API REST para la gestión de recursos, préstamos, reservas, mantenimientos, incidentes y ubicaciones de una institución.

## Stack tecnológico

[![Tech stack: Git, GitHub, Apache Maven, Spring Boot, H2 Database](https://stack.rajinkhan.com/v1/stack.svg?i=git%2Cgithub%2Capachemaven%2Cspringboot%2Ch2database)](https://stack.rajinkhan.com/?i=git%2Cgithub%2Capachemaven%2Cspringboot%2Ch2database)

- **Java 21**
- **Spring Boot 3.4.0**
  - Spring Web (API REST)
  - Spring Data JPA
  - Spring Boot Validation
- **H2 Database** (base de datos en memoria/desarrollo)
- **Maven** (gestión de dependencias y build)
- **JUnit / Spring Boot Test** (pruebas)

## Estructura del proyecto

El backend (`sistema-gestion-api`) está organizado en módulos por dominio, cada uno con su propia capa de `controller`, `dto`, `model`, `repository` y `service`:

- `categoria`
- `incidente`
- `mantenimiento`
- `prestamo`
- `recurso`
- `reserva`
- `ubicacion`
- `usuario`

También incluye un paquete `batch` con un seeder (`CommandLineRunner`) para carga inicial de datos.

## Requisitos previos

- JDK 21+
- Maven 3.9+ (o usar el wrapper `mvnw` incluido en el proyecto)

## Cómo ejecutar

```bash
cd sistema-gestion-api
./mvnw spring-boot:run
```

La API quedará disponible en `http://localhost:8080`.

## Cómo ejecutar las pruebas

```bash
cd sistema-gestion-api
./mvnw test
```
