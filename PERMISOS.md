# Autenticación y permisos por rol

Contrato de la tercera entrega. Todas las partes del trabajo se apoyan en este documento y en la base de seguridad ya construida.

## Qué ya está hecho (base compartida)

**Backend** (`sistema-gestion-api`)
- Spring Security con tokens JWT: `/api/**` exige autenticación, salvo `POST /api/auth/login`.
- Contraseñas con BCrypt (`Usuario.password`). `UsuarioRequestDTO.password` es obligatoria al crear un usuario y opcional al editarlo (si se omite se conserva la actual). Nunca se devuelve en las respuestas.
- Respuestas 401 y 403 con el formato único de error (`timestamp`, `status`, `error`, `message`, `path`, `errors`).
- `@EnableMethodSecurity` activo: los controllers pueden usar `@PreAuthorize("hasRole('GESTOR')")`.
- `UsuarioActual` (inyectable) entrega `id()`, `rol()` y `esSolicitante()` del token de la petición en curso.
- Swagger con esquema Bearer: el botón *Authorize* acepta el token devuelto por el login.

**Frontend** (`frontend`)
- `AuthService`: sesión (`usuario()`, `rol()`, `token()`), `login()`, `cerrarSesion()`, `tieneRol(...)`. La sesión se guarda en localStorage hasta que el token vence.
- `authInterceptor`: agrega `Authorization: Bearer` a las peticiones a la API y, ante un 401, cierra la sesión y lleva a `/login`.
- `autenticadoGuard` ya protege todo el layout; `rolGuard('GESTOR', 'ADMINISTRADOR')` restringe una ruta por rol y redirige a `/acceso-denegado`.
- Pantalla `/login` y pantalla `/acceso-denegado`.

## Contrato de la API

`POST /api/auth/login`

```json
{ "correo": "camila.rojas@campus.edu", "password": "gestor12345" }
```

Respuesta 200:

```json
{
  "token": "eyJ...",
  "tipo": "Bearer",
  "expiraEnSegundos": 28800,
  "usuario": { "id": 3, "nombre": "Camila", "apellido": "Rojas", "correo": "camila.rojas@campus.edu", "rol": "GESTOR" }
}
```

- 401 si el correo o la contraseña son incorrectos o el usuario está inactivo.
- `GET /api/auth/me` devuelve el `usuario` del token (401 si falta o es inválido).
- Roles del sistema: `SOLICITANTE`, `GESTOR` y `ADMINISTRADOR`. Se deducen de la primera palabra del nombre del rol en base de datos (`Solicitante`, `Gestor de recursos`, `Administrador`).
- El token dura 8 horas (`app.seguridad.jwt-expiracion-horas`). El secreto sale de `JWT_SECRETO` o, en desarrollo, de un valor por defecto en `application.properties`.

## Usuarios de prueba (DataSeeder)

| Rol | Correo | Contraseña | id |
|---|---|---|---|
| Solicitante | ana.martinez@campus.edu | solicitante123 | 1 |
| Solicitante | luis.perez@campus.edu | solicitante123 | 2 |
| Gestor | camila.rojas@campus.edu | gestor12345 | 3 |
| Administrador | diego.ramirez@campus.edu | admin12345 | 4 |

## Matriz de permisos

Origen: sección 8 del documento de diseño. «Autenticado» significa cualquier rol con sesión.

| Operación | Solicitante | Gestor | Administrador |
|---|---|---|---|
| Consultar catálogo y disponibilidad | Sí | Sí | Sí |
| Crear, modificar y cancelar reservas propias | Sí | Sí | Sí |
| Administrar todas las reservas | No | Sí | Sí |
| Registrar entrega y devolución | No | Sí | Sí |
| Consultar préstamos propios | Sí | Sí | Sí |
| Reportar incidente | Sí | Sí | Sí |
| Revisar incidentes, bloquear y habilitar recursos | No | Sí | Sí |
| Registrar mantenimientos | No | Sí | Sí |
| Tablero e indicadores | No | Sí | Sí |
| CRUD de recursos, categorías, ubicaciones, usuarios y roles | No | No | Sí |

## Permisos por endpoint

| Módulo | Endpoint | Quién |
|---|---|---|
| Recursos | `GET /api/recursos`, `GET /{id}`, `GET /{id}/disponibilidad` | Autenticado |
| Recursos | `POST`, `PUT /{id}`, `DELETE /{id}` | Administrador |
| Recursos | `PATCH /{id}/habilitar` | Gestor, Administrador |
| Categorías y ubicaciones | `GET` (lista y por id) | Autenticado |
| Categorías y ubicaciones | `POST`, `PUT`, `DELETE` | Administrador |
| Usuarios y roles | Todos los endpoints de `/api/usuarios` y `GET /api/roles` | Administrador |
| Reservas | `GET /api/reservas`, `GET /{id}` | Gestor y Administrador ven todas; el Solicitante solo las suyas |
| Reservas | `POST` | Autenticado. El Solicitante crea siempre a su nombre (el `usuarioId` sale del token); Gestor y Administrador pueden indicar el usuario |
| Reservas | `PUT /{id}`, `PATCH /{id}/cancelar` | Dueño de la reserva, Gestor o Administrador |
| Reservas | `DELETE /{id}` | Gestor, Administrador |
| Préstamos | `GET /api/prestamos`, `GET /{id}` | Gestor y Administrador ven todos (incluido `?vencidos=true`); el Solicitante solo los suyos |
| Préstamos | `POST` (entrega), `PATCH /{id}/devolucion`, `PUT /{id}` | Gestor, Administrador |
| Préstamos | `DELETE /{id}` | Administrador |
| Incidentes | `POST` | Autenticado (el reportante sale del token si es Solicitante) |
| Incidentes | `GET` (lista y por id), `PUT`, `DELETE` | Gestor, Administrador |
| Mantenimientos | Todos los endpoints | Gestor, Administrador |
| Indicadores | Todos los endpoints | Gestor, Administrador |

Decisión pendiente de confirmar por el equipo: el enunciado dice que el Gestor «administra recursos», pero la matriz del documento de diseño reserva el CRUD de recursos al Administrador. La tabla anterior sigue la matriz del documento.

## Cómo usar la base

**Backend**
- Restringir por rol en el controller: `@PreAuthorize("hasAnyRole('GESTOR', 'ADMINISTRADOR')")`.
- Reglas de propiedad en el servicio: inyectar `UsuarioActual` y comparar `usuarioActual.id()` con el dueño del registro.
- Pruebas: `AuthTestSupport.como(mvc, Perfil.SOLICITANTE)` envía la petición con el token de ese usuario (login real); `AuthTestSupport.sinToken()` la envía sin credenciales. `@Import(AdministradorPorDefecto.class)` hace que todas las peticiones de la clase vayan como administrador salvo que se indique otro perfil.

**Frontend**
- Restringir una ruta: `canActivate: [rolGuard('GESTOR', 'ADMINISTRADOR')]` en el archivo `*.routes.ts` de la feature.
- Mostrar u ocultar elementos: `inject(AuthService).tieneRol('GESTOR', 'ADMINISTRADOR')`.
- Usuario de la sesión: `inject(AuthService).usuario()`.
- Los permisos se validan siempre en el servidor; la interfaz solo oculta opciones.
