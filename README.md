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

## Aplicación multipágina (MPA)

Además de la API REST, el proyecto ahora incluye una aplicación multipágina (Thymeleaf) que consume esos mismos endpoints: sidebar de navegación por módulo (Recursos, Categorías, Ubicaciones, Reservas, Préstamos, Incidentes) y formularios básicos de CRUD para cada entidad del alcance de esta entrega. Se sirve desde la misma app en `http://localhost:8080/`.

## Diagrama de navegación

En el archivo [`DiagramadeNavegacion.pdf`](./DiagramadeNavegacion.pdf) está el diagrama de navegación completo de la aplicación, por si lo quieren revisar antes de entrar a probarla.

## Mockups

Los mockups de las pantallas están hechos en Figma: https://www.figma.com/proto/CAwhnKbtCnrAH8Xunz1QoZ/PontiReservas?node-id=0-1&t=71j6AcbdDmoBbRE0-1

Si no lo pueden visualizar, también está el respaldo en PDF: [`MockupsPontiReservas.pdf`](./MockupsPontiReservas.pdf)

## Casos de uso 

Descripción detallada de los casos de uso para la aplicación [`CUs Proyecto Web`](<CUs Proyecto Web.xlsx>)

## Diagrama Entidad-Relación
Diagrama ER con las entidades a persistir en la página web, contando además con los enums utilizados para el desarrollo [`Diagrama ER`](DiagramaER.pdf)

## Video de sustentación

https://youtu.be/E-NTiO7pRbI