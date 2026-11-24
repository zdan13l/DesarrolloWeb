# PontiReservas – SPA Angular

Aplicación Angular que consume la API REST de `sistema-gestion-api` (puerto 8080).

## Cómo ejecutar

```bash
npm install
npm start          # http://localhost:4200
npm test           # pruebas unitarias
npm run build      # compila en ../sistema-gestion-api/src/main/resources/static
```

El backend debe estar corriendo. En desarrollo la SPA llama a `http://localhost:8080/api` (`src/environments/environment.development.ts`); en producción usa `/api`, porque la sirve el propio backend.

## Estructura

```
src/app/
  app.config.ts, app.routes.ts
  core/
    auth/          sesión, login, interceptor de token, guards y lectura del JWT
    errors/        manejador global de errores
    interceptors/  interceptor de errores HTTP
    layout/shell/  barra lateral por rol, barra superior, mensajes y diálogo de confirmación
    models/        formato de error de la API
  shared/          tabla genérica, etiqueta de estado, mensajes, diálogo de confirmación, 404 y acceso denegado
  features/        catalogo, reservas, prestamos, incidentes, mantenimientos, dashboard, admin
```

Cada feature trae sus propios modelos y servicios, y su archivo `*.routes.ts` con las rutas cargadas de forma perezosa desde `app.routes.ts`.

## Convenciones

- Componentes standalone con signals (`signal`, `input()`, `computed`); no se usa zone.js.
- Formularios reactivos, `HttpClient` y RxJS en los servicios.
- Las fechas viajan en ISO-8601 UTC y se muestran en hora local.
- Las reglas de negocio las valida el servidor; la interfaz muestra el mensaje que devuelve.
- Los permisos por rol se aplican con `rolGuard(...)` en las rutas y `AuthService.tieneRol(...)` en las pantallas. Ver [PERMISOS.md](../PERMISOS.md).
- Para mostrar un error en la propia pantalla y no como toast: `{ context: new HttpContext().set(OMITIR_TOAST_ERROR, true) }`.
