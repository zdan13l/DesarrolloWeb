# PontiReservas – SPA Angular

Frontend de la entrega 2. Consume los servicios REST de `sistema-gestion-api` (Spring Boot, puerto 8080).
El diseño completo está en el documento *Diseño de servicios REST y arquitectura SPA* (secciones 3, 4 y 6).

## Cómo ejecutar

```bash
cd frontend
npm install
npm start          # http://localhost:4200
npm test           # pruebas unitarias
npm run build      # compilación de producción en dist/frontend
```

El backend debe estar corriendo (`./mvnw spring-boot:run` en `sistema-gestion-api`). En desarrollo la SPA llama a
`http://localhost:8080/api` (ver `src/environments/environment.development.ts`) y el backend habilita CORS para
`http://localhost:4200`. En producción usa `/api` (mismo origen).

## Estructura y quién edita qué

```
src/app/
  app.config.ts, app.routes.ts      ← Base. No se editan.
  core/                             ← Base. No se edita.
    interceptors/error.interceptor.ts
    layout/shell/                    barra lateral, barra superior, toasts y diálogo de confirmación
    models/api-error.ts              formato único de error del backend
  shared/                           ← Base. No se edita.
    data-table/  status-badge/  toast/  confirm-dialog/  pendiente/  not-found/
  features/                         ← Aquí trabaja cada grupo, solo en sus carpetas.
    catalogo/  reservas/  prestamos/            Grupo 2 (rutas: catalogo, recursos, reservas, prestamos)
    dashboard/  incidentes/  mantenimientos/  admin/   Grupo 3
```

Cada carpeta de `features/` ya trae su archivo `*.routes.ts` con las rutas del Word apuntando a la página de relleno
`Pendiente`. Para implementar una pantalla: crea el componente dentro de la misma carpeta y cambia `Pendiente` por él.

### Reglas para no pisarse

1. Edita solo tu carpeta de `features/`. Las rutas ya están conectadas en `app.routes.ts` y no hace falta tocarlo.
2. **Cada feature trae sus propios modelos y servicios** (por ejemplo `features/reservas/reserva.service.ts`
   y `features/reservas/reserva.model.ts`). No importes archivos de otra feature.
3. Si necesitas una lista que otro grupo también usa (categorías para un filtro, usuarios para un desplegable), haz tu
   propio `GET` en tu servicio. Se duplican unas pocas líneas a propósito.
4. Usa solo las clases de `src/styles.css` (`.btn`, `.card`, `.form-grid`, `.form-field`, `.alerta`, `.page-header`...) y las
   variables de color. No las redefinas.
5. Si crees que la base necesita un cambio (interceptor, layout, componente compartido), avisa antes en vez de editarla.

## Qué ofrece la base

| Pieza | Uso |
|---|---|
| `environment.apiUrl` | URL base de la API: `` `${environment.apiUrl}/reservas` ``. |
| Interceptor de errores | Toda respuesta de error se muestra como toast con el campo `message` del backend (y un detalle por campo en los 400). El error se relanza, así que puedes reaccionar en `subscribe({ error })`. |
| `OMITIR_TOAST_ERROR` | Para mostrar el error en tu propia pantalla (p. ej. el 409 del formulario de reservas) y no como toast: `{ context: new HttpContext().set(OMITIR_TOAST_ERROR, true) }`. |
| `leerErrorApi(err)`, `mensajeDeError(err)` | Leen un error de `HttpClient` en el formato `{ status, message, errors[] }`. |
| `ToastService` | `exito('Reserva creada')`, `info(...)`, `error(...)`. |
| `ConfirmService` | `confirmar({ titulo, mensaje, peligro: true })` devuelve un `Observable<boolean>`; encadénalo con `filter(Boolean)` y `switchMap`. |
| `<app-data-table>` | Tabla genérica con columnas de tipo texto, fecha, estado y booleano, acciones por fila y vista de tarjetas en teléfono. |
| `<app-status-badge>` | Etiqueta de color para cualquier enum (`DISPONIBLE`, `CONFIRMADA`, `CRITICA`, `EN_PROCESO`...). |
| Parámetros de ruta como `input()` | Con `withComponentInputBinding()` un componente recibe `:id` así: `readonly id = input.required<string>();`. |

Ejemplo mínimo de una pantalla de lista:

```ts
@Component({
  imports: [DataTable],
  template: `
    <header class="page-header"><h1>Reservas</h1></header>
    <app-data-table [columnas]="columnas" [filas]="reservas()" [cargando]="cargando()" />
  `,
})
export class ReservasLista {
  private readonly servicio = inject(ReservaService);
  protected readonly cargando = signal(true);
  protected readonly reservas = toSignal(
    this.servicio.listar().pipe(finalize(() => this.cargando.set(false))),
    { initialValue: [] },
  );
  protected readonly columnas: Columna<Reserva>[] = [
    { clave: 'recursoNombre', etiqueta: 'Recurso' },
    { clave: 'fechaHoraInicio', etiqueta: 'Inicio', tipo: 'fecha' },
    { clave: 'estadoReserva', etiqueta: 'Estado', tipo: 'estado' },
  ];
}
```

## Convenciones

- Componentes standalone con signals (`signal`, `input()`, `computed`); el proyecto no usa zone.js.
- Formularios reactivos, `HttpClient` + RxJS en los servicios, y el pipe `async` o `toSignal` en las plantillas.
- Las fechas viajan en ISO-8601 UTC (`Instant`); muéstralas con el pipe `date`, que las pasa a hora local.
- Reglas de negocio solo en el servidor: la SPA muestra el mensaje que devuelve el backend, no lo reimplementa.
- Nombres de archivo en minúscula con guion (`reserva.service.ts`, `reservas-lista.ts`); texto de la interfaz en español.
