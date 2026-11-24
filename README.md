# Sistema de Gestión de Recursos

Proyecto de Desarrollo Web — API REST y aplicación web para la gestión de recursos, préstamos, reservas, mantenimientos, incidentes, ubicaciones y control de acceso por roles de una institución.

## Stack tecnológico

[![Tech stack: Git, GitHub, Apache Maven, Spring Boot, H2 Database](https://stack.rajinkhan.com/v1/stack.svg?i=git%2Cgithub%2Capachemaven%2Cspringboot%2Ch2database)](https://stack.rajinkhan.com/?i=git%2Cgithub%2Capachemaven%2Cspringboot%2Ch2database)

- **Java 21**
- **Spring Boot 3.4.0**
  - Spring Web para la API REST
  - Spring Data JPA
  - Spring Boot Validation
  - Spring Security y JWT para autenticación y control de acceso por roles
- **H2 Database** como base de datos relacional
- **Maven** para la gestión de dependencias y construcción
- **JUnit 5 y MockMvc** para pruebas unitarias, de integración, seguridad y sistema
- **Spring Boot Actuator** para monitoreo
- **springdoc-openapi** para la documentación Swagger UI de la API

### Frontend

Aplicación web de una sola página en `frontend/` que consume la API REST:

- **Angular**
- **TypeScript**
- **Angular Router** con guardas e interceptores JWT
- **Angular CLI** para construcción y servidor de desarrollo
- **Node.js 22+ y npm** para la gestión de dependencias

## Estructura del proyecto

- `sistema-gestion-api/`: backend con la API REST
- `sistema-gestion-api/PontiReservas_E2E.postman_collection.json`: colección de pruebas End-to-End en Postman y Newman con autenticación JWT por rol
- `frontend/`: aplicación web en Angular

El backend en `sistema-gestion-api` está organizado en módulos por dominio y seguridad, cada uno con sus capas de `controller`, `dto`, `model`, `repository` y `service`:

- `auth`
- `categoria`
- `incidente`
- `mantenimiento`
- `prestamo`
- `recurso`
- `reserva`
- `ubicacion`
- `usuario`

También incluye un paquete `batch` con la clase `DataSeeder` para la carga inicial de datos y usuarios de prueba.

## Requisitos previos

- JDK 21 o superior
- Maven 3.9 o superior, o usar el wrapper `mvnw` incluido en el proyecto
- Node.js 22 o superior y npm para ejecutar el frontend

## Usuarios de prueba

Al iniciar el backend se cargan automáticamente los siguientes usuarios y roles para probar la aplicación web, Swagger UI o Postman:

| Rol | Nombre | Correo | Contraseña |
| :--- | :--- | :--- | :--- |
| `ADMINISTRADOR` | Diego Ramírez | `diego.ramirez@campus.edu` | `admin12345` |
| `GESTOR` | Camila Rojas | `camila.rojas@campus.edu` | `gestor12345` |
| `SOLICITANTE` | Ana Martínez | `ana.martinez@campus.edu` | `solicitante123` |
| `SOLICITANTE` | Luis Pérez | `luis.perez@campus.edu` | `solicitante123` |

## Cómo ejecutar

El backend necesita **Java 21**. Si `java -version` muestra otra versión, apunta `JAVA_HOME` al JDK 21 antes de seguir; con Java 17 falla con `UnsupportedClassVersionError`.

Hay dos formas de levantar el proyecto. En las dos, la base de datos se crea de nuevo con los datos de ejemplo cada vez que arranca el backend.

### Opción 1: desarrollo (dos terminales)

Terminal 1, el backend:

```bash
cd sistema-gestion-api
./mvnw spring-boot:run
```

Terminal 2, el frontend:

```bash
cd frontend
npm install
npm start
```

La aplicación se abre en `http://localhost:4200`. Los cambios del frontend se ven al guardar.

### Opción 2: todo desde el backend

Se compila el frontend una vez y el backend lo sirve junto con la API:

```bash
cd frontend
npm install
npm run build
cd ../sistema-gestion-api
./mvnw spring-boot:run
```

La aplicación se abre en `http://localhost:8080`. El resultado de la compilación queda en `sistema-gestion-api/src/main/resources/static` y no se sube al repositorio, así que hay que repetir `npm run build` después de cambiar el frontend.

### Qué hay en el puerto 8080

- `http://localhost:8080/api/...`: la API REST.
- `http://localhost:8080/swagger-ui.html`: la documentación de la API, donde se puede probar con el botón **Authorize**.
- `http://localhost:8080/`: la aplicación web, **solo si antes se hizo `npm run build`** (opción 2). Si no, responde 404 y hay que abrir la aplicación en el puerto 4200 (opción 1).

## Cómo ejecutar las pruebas

Si el backend está corriendo en otra terminal, es necesario detenerlo antes de ejecutar `./mvnw test` para evitar el bloqueo del archivo de base de datos H2.

```bash
cd sistema-gestion-api
./mvnw test
```

Para ejecutar específicamente la prueba de sistema de flujo completo con roles reales:

```bash
cd sistema-gestion-api
./mvnw test -Dtest=SistemaFlujoCompletoTests
```

Para ejecutar la colección End-to-End de Postman desde consola con el backend corriendo en `http://localhost:8080`:

```bash
cd sistema-gestion-api
npx newman run PontiReservas_E2E.postman_collection.json
```

La colección inicia sesión automáticamente con los roles `ADMINISTRADOR`, `SOLICITANTE` y `GESTOR`, y valida el ciclo completo: creación de recurso, reserva, detección de solapamiento horario, entrega de préstamo, devolución tardía, incidente crítico con bloqueo automático, mantenimiento, habilitación del recurso y nueva reserva.

## Diagrama de navegación

En el archivo [`DiagramadeNavegacion.pdf`](./DiagramadeNavegacion.pdf) está el diagrama de navegación completo de la aplicación, por si lo quieren revisar antes de entrar a probarla.

## Mockups

Los mockups de las pantallas están hechos en Figma: https://www.figma.com/proto/CAwhnKbtCnrAH8Xunz1QoZ/PontiReservas?node-id=0-1&t=71j6AcbdDmoBbRE0-1

Si no lo pueden visualizar, también está el respaldo en PDF: [`MockupsPontiReservas.pdf`](./MockupsPontiReservas.pdf)

## Casos de uso 

Descripción detallada de los casos de uso para la aplicación [`CUs Proyecto Web`](<CUs Proyecto Web.xlsx>)

## Diagrama Entidad-Relación
Diagrama ER con las entidades a persistir en la página web, contando además con los enums utilizados para el desarrollo [`Diagrama ER`](DiagramaER.pdf)

## Matriz de permisos por rol
Detalle de los permisos y control de acceso por endpoint y vista en [`PERMISOS.md`](./PERMISOS.md)

## Video de sustentación - Entrega 1

https://youtu.be/E-NTiO7pRbI

## Video de sustentación - Entrega 2

https://youtu.be/tcBbIMrVMgw?si=NDi8EC16Mej2wrJC

## Video de sustentación - Entrega 3

https://youtu.be/f4EfJff_9Oo