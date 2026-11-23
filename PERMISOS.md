# Autenticación y permisos

## Login

`POST /api/auth/login`

```json
{ "correo": "camila.rojas@campus.edu", "password": "gestor12345" }
```

```json
{
  "token": "eyJ...",
  "tipo": "Bearer",
  "expiraEnSegundos": 28800,
  "usuario": { "id": 3, "nombre": "Camila", "apellido": "Rojas", "correo": "camila.rojas@campus.edu", "rol": "GESTOR" }
}
```

- El token va en el encabezado `Authorization: Bearer <token>`.
- `GET /api/auth/me` devuelve el usuario del token.
- Credenciales incorrectas o usuario inactivo: 401. Sin permiso para la operación: 403.
- Roles: `SOLICITANTE`, `GESTOR`, `ADMINISTRADOR`.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Solicitante | ana.martinez@campus.edu | solicitante123 |
| Solicitante | luis.perez@campus.edu | solicitante123 |
| Gestor | camila.rojas@campus.edu | gestor12345 |
| Administrador | diego.ramirez@campus.edu | admin12345 |

## Permisos por endpoint

| Módulo | Endpoint | Quién |
|---|---|---|
| Recursos | `GET` (lista, por id, disponibilidad) | Todos |
| Recursos | `POST`, `PUT`, `DELETE` | Administrador |
| Recursos | `PATCH /{id}/habilitar` | Gestor, Administrador |
| Categorías, ubicaciones | `GET` | Todos |
| Categorías, ubicaciones | `POST`, `PUT`, `DELETE` | Administrador |
| Usuarios | `GET` | Gestor, Administrador |
| Usuarios | `POST`, `PUT`, `DELETE` | Administrador |
| Roles | `GET` | Administrador |
| Reservas | `GET` | Gestor y Administrador ven todas; el Solicitante solo las suyas |
| Reservas | `POST` | Todos. El Solicitante reserva siempre a su nombre |
| Reservas | `PUT`, `PATCH /{id}/cancelar` | Dueño de la reserva, Gestor, Administrador |
| Reservas | `DELETE` | Gestor, Administrador |
| Préstamos | `GET` | Gestor y Administrador ven todos; el Solicitante solo los suyos |
| Préstamos | `POST`, `PUT`, `PATCH /{id}/devolucion` | Gestor, Administrador |
| Préstamos | `DELETE` | Administrador |
| Incidentes | `POST` | Todos |
| Incidentes | `GET`, `PUT`, `DELETE` | Gestor, Administrador |
| Mantenimientos | Todos | Gestor, Administrador |
| Indicadores | Todos | Gestor, Administrador |

- Al crear un incidente, quien reporta es siempre el usuario del token: el cuerpo ya no lleva `usuarioId`. Al editarlo se conserva el reportante original.

## Seguridad del token

- El backend verifica la firma HS256 del JWT en cada petición: un token con el payload cambiado, sin firma, con `alg=none`, firmado con otra clave o vencido responde 401. El rol sale solo del claim firmado.
- Los permisos de la tabla anterior los aplica el backend con `@PreAuthorize` en cada controller; ocultar pantallas en la interfaz no es una medida de seguridad. Un token válido del rol equivocado responde 403.
- `JWT_SECRETO` debe definirse en producción: el valor por defecto de `application.properties` es público en el repositorio y permitiría firmar tokens con cualquier rol.
- Pruebas: `JwtIntegridadTests` (tokens alterados) y `PermisosPorRolTests` (rol por endpoint).

## Pantallas por rol (frontend)

| Pantalla | Quién |
|---|---|
| Tablero (`/`) | Gestor, Administrador (el Solicitante pasa al catálogo) |
| Catálogo, reservas, préstamos (lista), reportar incidente | Todos |
| Incidentes (lista), mantenimientos | Gestor, Administrador |
| Administración (categorías, ubicaciones, usuarios) | Administrador |

El menú lateral muestra solo los enlaces permitidos al rol, el nombre del usuario y "Cerrar sesión".

## Uso

Backend
- Por rol: `@PreAuthorize("hasAnyRole('GESTOR', 'ADMINISTRADOR')")` en el controller.
- Por propiedad: `UsuarioActual.id()` y `UsuarioActual.rol()` en el servicio.
- Pruebas: `AuthTestSupport.como(mvc, Perfil.GESTOR)` y `AuthTestSupport.sinToken()`.

Frontend
- Ruta: `canActivate: [rolGuard('GESTOR', 'ADMINISTRADOR')]`.
- Mostrar u ocultar: `AuthService.tieneRol(...)`. El usuario actual está en `AuthService.usuario()`.
