# Guion del video — PontiReservas

Duración: **~15 min**, ~5 min por persona. Pantalla dividida: **app + DevTools (Network) a la izquierda, VS Code a la derecha**.

## Reparto por criterio de evaluación

| Parte | Peso | Tiempo | Quién |
|---|---|---|---|
| **A. Diseño de servicios REST y arquitectura SPA** | 20% | ~4 min | P1 (REST), P2 (SPA), P3 (errores y contrato) |
| **B. Funcionalidades principales con SPA + REST** | 50% | ~10 min | P1 Reservas, P2 Préstamos e Incidentes, P3 Mantenimiento y Dashboard |
| **C. Explicación con código en paralelo** | 30% | dentro de B | Los tres: cada paso de B muestra su código |

Regla de oro de C: **nunca se muestra una acción en la app sin enseñar, en la misma toma, la petición HTTP y el archivo que la implementa**. Orden fijo en cada paso: 1) clic en la app, 2) petición en Network, 3) controller, 4) service, 5) código Angular.

Hilo conductor de B (una sola historia, igual que la colección Postman E2E):

1. P1 reserva un recurso y provoca un conflicto de horario (409).
2. P2 reporta un incidente crítico y el recurso queda bloqueado, así que ya no se puede reservar.
3. P3 finaliza el mantenimiento, el recurso se habilita y el dashboard lo refleja.

## Preparación

- Backend: `cd sistema-gestion-api && ./mvnw spring-boot:run` (puerto 8080, Swagger en `/swagger-ui.html`).
- Frontend: SPA servida por Spring (`apiUrl: '/api'`) o `ng serve` con `environment.development.ts`.
- Pestañas: SPA, Swagger UI, DevTools con filtro Fetch/XHR, Postman con `PontiReservas_E2E.postman_collection.json`.
- Datos: un recurso `DISPONIBLE` con modalidad `AMBAS` o `RESERVABLE` (lo carga `batch/DataSeeder.java`). Fechas de reserva en el futuro.
- Archivos abiertos en VS Code, en este orden: `ReservaController`, `ReservaServiceImpl`, `GlobalExceptionHandler`, `app.routes.ts`, `app.config.ts`, `error.interceptor.ts`, `reserva.service.ts`, `reserva-form.ts`, `PrestamoServiceImpl`, `IncidenteServiceImpl`, `MantenimientoServiceImpl`, `IndicadoresService`, `dashboard.ts`.
- Ensayar el flujo completo una vez. Si la base quedó sucia, borrar `sistema-gestion-api/data/` y reiniciar.
- Editor con zoom ≥150%, navegador al 125%.

---

## PARTE A — Diseño de servicios REST y arquitectura SPA (20%)

### A0. Apertura — P1 (0:00–0:25)

> "Somos [nombres]. PontiReservas gestiona recursos de una institución: reservas, préstamos, incidentes y mantenimientos. Es una SPA en Angular que consume una API REST en Spring Boot. Primero explicamos el diseño y después demostramos los flujos con su código."

Mostrar 10 s cada uno: `DiagramaER.pdf` y `DiagramadeNavegacion.pdf`.

### A1. Diseño de los servicios REST — P1 (0:25–2:00)

**Decir:** arquitectura por módulos de dominio y por capas.

- **Código:** árbol de `modules/reserva/` con `controller`, `dto`, `model`, `repository`, `service`.
- **Decir:** "Los controladores no exponen entidades, usan DTOs de request y response. La validación va en el request con Bean Validation y la lógica de negocio solo en el service."
- **Código:** `ReservaRequestDTO` (anotaciones), `ReservaController` (`@RequestMapping("/api/reservas")`).

**Decir:** convenciones REST.

- **App:** Swagger UI, abrir el grupo *reservas* y luego *recursos*.
- **Decir:** "Recursos en plural, `GET` lista y detalle, `POST` crea, `PUT` actualiza, `DELETE` elimina. Las transiciones de estado son `PATCH` explícitos: `/prestamos/{id}/devolucion`, `/mantenimientos/{id}/finalizar`. Los filtros van como query params, por ejemplo `/reservas?recursoId=1`, y hay consultas derivadas como `/recursos/{id}/disponibilidad`."

Tabla de endpoints (mostrar como slide, 5 s):

| Módulo | Ruta base | Operaciones especiales |
|---|---|---|
| Recursos | `/api/recursos` | `GET /{id}/disponibilidad` |
| Reservas | `/api/reservas` | filtros `recursoId`, `usuarioId` |
| Préstamos | `/api/prestamos` | `PATCH /{id}/devolucion` |
| Incidentes | `/api/incidentes` | bloqueo automático si es CRÍTICA |
| Mantenimientos | `/api/mantenimientos` | `PATCH /{id}/finalizar`, `/{id}/cancelar` |
| Indicadores | `/api/indicadores` | `/resumen`, `/estado-recursos`, `/reservas-por-recurso`, `/reservas-por-categoria` |
| Categorías, ubicaciones, usuarios, roles | `/api/...` | CRUD |

### A2. Arquitectura SPA — P2 (2:00–3:30)

**Código:** `app.routes.ts`.

> "La SPA usa Angular con componentes standalone. Un `Shell` con el menú lateral contiene todas las áreas, y cada una se carga de forma perezosa con `loadChildren`: catálogo, reservas, préstamos, incidentes, mantenimientos y admin. Solo se descarga el código de la pantalla que se visita."

**Código:** `app.config.ts`.

> "Configuramos el router con `withComponentInputBinding`, así los parámetros de ruta llegan como inputs del componente, y el `HttpClient` con un interceptor global."

**Código:** `reserva.service.ts` y `reserva.model.ts`.

> "Cada módulo tiene un servicio que encapsula el `HttpClient` y devuelve `Observable`s tipados con interfaces que reflejan los DTOs del backend. Los componentes nunca arman URLs ni llaman a `HttpClient` directamente."

**Código:** carpeta `shared/` (`data-table`, `confirm-dialog`, `toast`, `status-badge`).

> "Los componentes reutilizables evitan repetir código: una tabla genérica, el diálogo de confirmación, los toasts y los badges de estado."

### A3. Contrato de errores — P3 (3:30–4:15)

**Código:** `config/GlobalExceptionHandler.java`.

> "Todos los errores del backend tienen el mismo formato: `timestamp`, `status`, `error`, `message`, `path` y una lista `errors` con `campo` y `mensaje`. 400 para datos inválidos, 404 si no existe, 409 para conflictos de negocio."

**Código:** `error.interceptor.ts` y `core/models/api-error.ts`.

> "El interceptor lee ese mismo formato y muestra un toast. Si una pantalla necesita mostrar el error en línea, como el conflicto de horario, usa el token `OMITIR_TOAST_ERROR`. Por eso el contrato del backend y el manejo de errores del frontend encajan sin código especial por pantalla."

---

## PARTE B + C — Funcionalidades principales con código en paralelo (50% + 30%)

### B1. Reservas — P1 (4:15–7:30)

**Qué decir al inicio:** "Una reserva bloquea un recurso en una franja horaria. Las reglas: no puede estar en el pasado, el fin es posterior al inicio, el recurso no puede estar bloqueado, debe permitir reserva y no puede solaparse con otra confirmada."

**Paso 1. Crear reserva exitosa**

- **App:** Reservas → Nueva reserva. Elegir recurso, usuario, inicio y fin futuros. Guardar. Aparece en la lista como CONFIRMADA.
- **Network:** `POST /api/reservas` → 201, mostrar el JSON de respuesta.
- **Código Angular:** `reserva-form.ts` (`FormGroup` con `Validators`, función `aIso()` que convierte la hora local a ISO‑8601 UTC) y `reserva.service.ts` → `crear()`.
- **Código Spring:** `ReservaController.crear` → `ReservaServiceImpl.crear()`: `validarCoherenciaFechas` → `validarReglasRecursoYDisponibilidadCreacion` → guarda con estado `CONFIRMADA`, todo dentro de `@Transactional`.

**Paso 2. Conflicto de horario**

- **App:** repetir la misma reserva. El formulario muestra en línea "Existe un conflicto de horario con otra reserva confirmada".
- **Network:** `POST /api/reservas` → 409 con el cuerpo de error unificado.
- **Código:** `reserva.service.ts` (`SIN_TOAST` evita el toast global), bloque `@if (errorApi(); as e)` en el template de `reserva-form.ts`, y `reservaRepository.findSolapamientos(...)` en el service.

**Paso 3. Validación de datos (20 s)**

- **App:** enviar con fin anterior al inicio. Aparece el mensaje de error.
- **Código:** `validarCoherenciaFechas` y la respuesta 400 de `GlobalExceptionHandler`.

**Pase a P2:** "El recurso quedó reservado. Ahora ocurre un daño sobre ese mismo recurso."

### B2. Préstamos e Incidentes — P2 (7:30–12:00)

**Qué decir al inicio:** "Estos dos módulos modifican el estado del recurso, por eso sus reglas viven en el service y se ejecutan en transacciones."

**Paso 1. Entrega de préstamo**

- **App:** Préstamos → Entrega. Elegir recurso y usuario, fecha límite, guardar. Aparece en préstamos activos.
- **Network:** `POST /api/prestamos` → 201.
- **Código Angular:** `prestamo-entrega.ts` y `prestamo.service.ts`.
- **Código Spring:** `PrestamoServiceImpl.crear()`: 409 si el recurso está BLOQUEADO, ya está prestado o su modalidad no admite préstamo.

**Paso 2. Devolución**

- **App:** Préstamos → Devolución. Registrar estado físico final y observaciones.
- **Network:** `PATCH /api/prestamos/{id}/devolucion` → 200.
- **Código:** `PrestamoServiceImpl.registrarDevolucion()`: solo se devuelve un préstamo ACTIVO (si no, 409), calcula `devolucionTardia` contra la fecha límite y deja el recurso DISPONIBLE en la misma transacción.

**Paso 3. Incidente crítico que bloquea el recurso (el momento central del video)**

- **App:** Incidentes → Nuevo. Mismo recurso de la reserva, severidad CRÍTICA, guardar.
- **App:** abrir Recursos y mostrar que ahora aparece BLOQUEADO.
- **Network:** `POST /api/incidentes` → 201, con `recursoBloqueado: true`.
- **Código Angular:** `incidente-form.ts` y `incidente.service.ts`.
- **Código Spring:** `IncidenteServiceImpl.crear()` → `bloquearSiEsCritico()`: "si la severidad es CRÍTICA, el service pone el recurso en BLOQUEADO en la misma transacción. La regla está en una sola capa, no en el controller ni en Angular."

**Paso 4. Efecto en cadena**

- **App:** intentar crear una reserva sobre ese recurso. Resultado: 409 "El recurso se encuentra BLOQUEADO y no puede ser reservado".
- **Código:** mostrar de nuevo `validarReglasRecursoYDisponibilidadCreacion` en `ReservaServiceImpl`: la misma regla protege al recurso desde otro módulo.

**Pase a P3:** "Para volver a usarlo interviene mantenimiento."

### B3. Mantenimiento, Dashboard y verificación — P3 (12:00–15:00)

**Paso 1. Mantenimiento**

- **App:** Mantenimientos → Nuevo sobre el recurso bloqueado. Abrir el detalle, pasar a EN_PROCESO y finalizar con la opción de habilitar el recurso.
- **Network:** `POST /api/mantenimientos`, `PUT /{id}`, `PATCH /{id}/finalizar` → 200.
- **Código Angular:** `mantenimiento-detalle.ts` y `mantenimiento.service.ts`.
- **Código Spring:** `MantenimientoServiceImpl.actualizar()` solo permite ABIERTA → EN_PROCESO y exige `finalizar` o `cancelar` para cerrar. `finalizar(id, habilitarRecurso)` aplica RN‑05: el gestor decide si el recurso queda DISPONIBLE o sigue BLOQUEADO.
- **Decir:** "Las transiciones críticas son endpoints `PATCH` explícitos, no un campo editable libremente."
- **App:** repetir la reserva que antes dio 409. Ahora funciona y se cierra el ciclo.

**Paso 2. Dashboard**

- **App:** Dashboard con resumen, estado de recursos y reservas por recurso y por categoría.
- **Network:** `GET /api/indicadores/resumen`, `/estado-recursos`, `/reservas-por-recurso`, `/reservas-por-categoria`.
- **Código:** `IndicadoresService` (agregaciones en el servidor) y `dashboard.ts` con `barras-conteo`.
- **Decir:** "Las agregaciones se calculan en el backend, el frontend solo dibuja. El recurso que acabamos de bloquear y habilitar ya se refleja aquí."

**Paso 3. Verificación automática (45 s)**

- **Postman:** Collection Runner con `PontiReservas_E2E.postman_collection.json` (crear reserva, validar solapamiento, incidente crítico, validar recurso bloqueado, finalizar mantenimiento). Mostrar los tests en verde.
- **Código:** `GestionFlujoTests.java` y los `*.spec.ts` del frontend.
- **Decir:** "La misma historia que hicimos a mano está automatizada de punta a punta."

**Cierre (15 s, los tres o P3)**

> "Diseñamos una API REST por módulos con DTOs, validación y errores uniformes, y una SPA Angular con carga perezosa, servicios tipados e interceptor global. Las reglas de negocio —solapamientos, bloqueo por incidente crítico, devoluciones y mantenimiento— están centralizadas en la capa de servicio y verificadas con Postman y pruebas automáticas. Gracias."

---

## Lista de verificación

- [ ] Cada paso de B muestra: app, petición en Network, código Spring y código Angular.
- [ ] Se dicen códigos HTTP reales: 201, 200, 400, 409.
- [ ] Se muestra un flujo que cruza módulos (reserva, incidente, bloqueo, mantenimiento).
- [ ] Cada persona dice su nombre al empezar su parte.
- [ ] Sin credenciales ni datos personales en pantalla.

## Problemas a resolver antes de grabar

1. **Cancelar reserva:** `reserva.service.ts` llama `PATCH /api/reservas/{id}/cancelar` y `ReservaServiceImpl.cancelar()` existe, pero `ReservaController` no expone ese endpoint. No lo demuestren o agréguenlo.
2. **README desactualizado:** solo describe la MPA Thymeleaf, no la SPA Angular.
3. **Dónde se sirve la SPA:** `static/` solo tiene `css` y `js` de la MPA. Si el build de Angular no está copiado ahí, graben con `ng serve`.
