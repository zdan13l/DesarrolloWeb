

Proyecto desarrollo web

Sistema inteligente para la gestión de reservas, préstamos y
mantenimiento de recursos en un campus universitario

En las universidades y centros de formación es común que aulas especializadas, laboratorios, salas
de  estudio,  auditorios  y  equipos  institucionales  sean  administrados  mediante  hojas  de  cálculo,
mensajes  de  correo  o  registros  manuales.  Esta  gestión  puede  generar  reservas  duplicadas,
préstamos sin suficiente trazabilidad, devoluciones tardías y reportes incompletos de daños o fallas.

Por  tal  motivo,  estudiantes,  docentes  y  personal  administrativo  deben  invertir  tiempo  buscando
recursos  disponibles  o  resolviendo  conflictos  que  podrían  prevenirse  mediante  una  herramienta
centralizada. Los responsables de los recursos también requieren una forma sencilla de conocer su
estado, las reservas existentes y las novedades reportadas.

El  cliente  ha  solicitado  el  desarrollo  de  una  aplicación  web  que  centralice  la  reserva,  entrega,
devolución y seguimiento básico de los recursos físicos del campus. El sistema deberá facilitar la
operación  diaria  y  conservar  información  suficiente  para  consultar  el  uso  de  los  recursos  sin
incorporar automatizaciones o integraciones que aumenten innecesariamente la complejidad del
prototipo.

El cliente ha identificado los siguientes problemas de los sistemas actuales:

1.  Disponibilidad y asignación: dobles reservas, conflictos de horario y falta de visibilidad sobre

recursos bloqueados o no disponibles.

2.  Préstamos  y  devoluciones:  entregas  sin  un  registro  uniforme,  devoluciones  tardías  y

ausencia de un historial básico.

3.  Daños y  mantenimiento:  fallas  reportadas  por diferentes  canales  y  demora  en  marcar  un

recurso como no disponible.

4.  Gestión de recursos: dificultad para conocer de manera sencilla cuáles recursos se reservan

con mayor frecuencia y cuáles presentan incidentes.

Todos  estos  problemas  surgen  por  la  ausencia  de  un  sistema  único  que  conecte  la  información
básica  de  los  recursos  con  las  reservas,  los  préstamos,  las  devoluciones,  los  incidentes  y  el
mantenimiento.

Por todo lo anterior, el cliente desea diseñar y desarrollar un prototipo que permita administrar un
flujo  acotado:  publicación  de  recursos,  consulta  de  disponibilidad,  reserva,  préstamo  cuando
aplique, devolución, reporte de novedades, bloqueo y mantenimiento básico.

El principal reto del proyecto consiste en transformar una gestión manual y dispersa en un proceso
digital claro y trazable, priorizando las funcionalidades esenciales que puedan ser implementadas y
probadas de forma consistente durante el curso.


1.  Objetivo general

Implementar  un  sistema  web  que  centralice  la  gestión  de  espacios  y  equipos  institucionales,
permita  realizar  reservas  y  préstamos  con  validación  básica  de  disponibilidad,  registre  entregas,
devoluciones e incidentes, gestione bloqueos y mantenimientos sencillos y presente indicadores
básicos de utilización de los recursos.

2.  Características funcionales

•  Catálogo de recursos: consulta de espacios y equipos por categoría, ubicación, tipo,

características principales, estado y disponibilidad básica.

•  Reservas: creación, consulta, modificación y cancelación de reservas, con validación

de conflictos para el mismo recurso.

•  Préstamos  y  devoluciones:  registro  de  entrega,  responsable,  fecha  límite,  estado

inicial, devolución y observaciones.

•  Reporte de daños o fallas: registro de incidentes por tipo, severidad y descripción, con

posibilidad de bloquear el recurso cuando la novedad sea crítica.

•  Mantenimiento  básico:  registro  y  seguimiento  sencillo  de  una  intervención  hasta

habilitar nuevamente el recurso.

•  Tablero  e  indicadores  básicos:  consulta  del  estado  actual  de  los  recursos  y
visualización de uno o dos indicadores sencillos de reservas, devoluciones o incidentes.

3.  Usuarios del sistema

•  Usuario  solicitante  (estudiante,  docente  o  funcionario):  consulta  recursos  y
disponibilidad,  crea,  modifica  o  cancela  reservas  y  consulta  la  información  de  sus
préstamos.

•  Gestor de recursos: administra recursos y reservas, registra entregas y devoluciones,

revisa incidentes, bloquea recursos y registra mantenimientos básicos.

•  Administrador  del  sistema:  configura  usuarios,  categorías,  ubicaciones,  recursos  y

parámetros generales; en la entrega final gestiona los roles de acceso.

4.  Requisitos funcionales

a.  Catálogo y disponibilidad

i.  Cada  recurso  debe  tener  como  mínimo:  nombre,  tipo,  categoría,  ubicación,

descripción, características principales y estado.

ii.  Los  recursos  pueden  ser  espacios  reservables,  equipos  prestables  o  recursos

que soporten ambas modalidades.

iii.  La búsqueda debe permitir filtros básicos por categoría, ubicación, tipo y estado.
iv.  La  disponibilidad  puede  mostrarse  mediante  una  tabla,  lista  o  calendario
simplificado. No se requiere un calendario avanzado ni actualización en tiempo
real.



b.  Reservas y validación de conflictos

i.  El usuario selecciona recurso, fecha, hora inicial y hora final o duración.
ii.  Antes  de  confirmar,  el  servidor  valida  que  no  exista  otra  reserva  activa  para  el
mismo  recurso  en  un  intervalo  de  tiempo  solapado  y  que  el  recurso  no  esté
bloqueado.

iii.  El sistema debe permitir consultar, modificar y cancelar una reserva antes de su

inicio.

iv.  Los estados mínimos de la reserva son: confirmada, finalizada y cancelada.
v.  Si existe un conflicto, el sistema informa que el recurso no está disponible. No es

obligatorio sugerir horarios o recursos alternativos.

c.  Préstamo de equipos y devolución

i.  Para  recursos  prestables,  el  gestor  registra  la  entrega  indicando  usuario

responsable, fecha y hora, fecha límite de devolución y estado inicial.

ii.  Los  accesorios  pueden  registrarse  en  un  campo  de  texto  o  lista  simple;  no  se

requiere un módulo independiente de inventario de accesorios.

iii.  Al  devolver  un  equipo,  el  gestor  registra  fecha  y  hora,  estado  final  y

observaciones.

iv.  El sistema identifica si la devolución fue puntual o tardía comparando la fecha

real con la fecha límite.

v.  No  se  debe  permitir  prestar  un  recurso  que  se  encuentre  bloqueado  o  como

prestado.

d.  Reporte de daños o fallas

i.  El  reporte  debe  contener  como  mínimo:  recurso,  tipo  de  novedad,  severidad,

descripción y fecha.

ii.  Tipos  sugeridos:  daño  físico,  falla  de  funcionamiento,  accesorio  faltante  o

condición inadecuada del espacio.

iii.  La severidad puede manejarse con tres niveles: leve, media y crítica.
iv.  Cuando  un  incidente  se  registre  como  crítico,  el  recurso  puede  quedar

bloqueado hasta su revisión.
e.  Mantenimiento y bloqueo de recursos

i.  Un  recurso  puede  pasar  al  estado  bloqueado  cuando  requiere  revisión  o

reparación.

ii.  El  mantenimiento  debe  registrar  como  mínimo:  recurso,  fecha  de  apertura,

estado, descripción o diagnóstico breve y fecha de cierre.

iii.  Estados mínimos de la intervención: abierta, en proceso, finalizada y cancelada.
iv.  Al finalizar el mantenimiento, el gestor puede habilitar nuevamente el recurso.



f.  Tablero operativo y analítica

i.  El  gestor debe poder  consultar  una  tabla  con  los  recursos  y  su  estado  actual:

disponible, reservado, prestado o bloqueado.

ii.  La aplicación debe presentar como mínimo el número de reservas por recurso o

categoría.

iii.  Como indicador adicional puede mostrarse el número de devoluciones tardías o

de incidentes registrados.

iv.  Las visualizaciones pueden ser tablas o gráficas sencillas.

Reglas de negocio mínimas

Regla

RN-01

RN-02

RN-03

RN-04

RN-05

Descripción
No puede existir más de una reserva activa para el mismo recurso en intervalos
de tiempo solapados.
Un recurso bloqueado por mantenimiento no puede reservarse ni prestarse
durante el periodo del bloqueo.
Un recurso que figure como prestado no puede entregarse nuevamente hasta
registrar su devolución.
Un incidente crítico puede generar el bloqueo del recurso hasta que un gestor lo
habilite nuevamente.
Una intervención de mantenimiento finalizada debe permitir cambiar el recurso a
un estado disponible cuando corresponda.

5.  Requisitos no funcionales

a.  Experiencia de usuario

Interfaz responsiva para computador y teléfono móvil.

o
o  Las acciones principales consultar, reservar, registrar entrega, registrar devolución y

reportar una novedad deben realizarse con un número razonable de pasos.

o  Los  estados  de  los  recursos  deben  ser  comprensibles  mediante  texto  visible  y

mensajes claros de éxito o error.

b.  Seguridad y privacidad

o  La autenticación y autorización por roles se implementarán en la tercera entrega.
o  Las  operaciones  REST  protegidas  deben  validar  permisos  en  el  servidor  y  no

únicamente en la interfaz.

o  El  sistema  debe  recolectar  únicamente  los  datos  personales  necesarios  para  la

gestión de usuarios, reservas y préstamos.

c.  Disponibilidad y consistencia

o  Las validaciones de conflicto de reservas deben realizarse en el servidor para evitar

dobles reservas.

o  Las operaciones principales deben manejar errores de forma clara y evitar estados

incoherentes en reservas, préstamos, incidentes o mantenimientos.



o  No se exige procesamiento en tiempo real, arquitectura distribuida ni mecanismos
avanzados de concurrencia diferentes a las validaciones necesarias en el servidor.

6.  Entregables

a.  (10%) Primera entrega

o  Descripción detallada de casos de uso para la aplicación (20%).
o  Mockups de las pantallas junto con el diagrama de navegación (15%).
o  Diagrama  con  las  entidades  a  persistir  (diagrama  de  clases,  modelo  ER  o

equivalente) (15%).
o  Aplicación  multipágina

implemente
funcionalidades CRUD de las entidades y asociaciones incluidas en el alcance de
esta entrega (15%).

(MPA)  con  diseño  visual  básico  que

o  Programa Batch en Java Spring que cargue la base de datos con la información inicial
requerida para recursos, ubicaciones, categorías, horarios y demás datos maestros
definidos por el equipo (10%).

o  Video  en  el  que  se  expliquen  el  diseño  y  las  funcionalidades  implementadas y  en

paralelo, se muestre qué parte del código fuente las implementa (25%).

Nota: para esta entrega no se debe implementar autenticación todavía.

b.  (20%) Segunda entrega

o  Diseño detallado de servicios REST y arquitectura SPA (20%).
o

Implementación de las funcionalidades principales de la aplicación mediante SPA y
servicios REST (50%).

o  Video en el que se expliquen las funcionalidades y en paralelo, se muestre qué parte

del código fuente las implementa (30%).

Nota: para esta entrega no se debe implementar autenticación todavía.

c.  (30%) Tercera entrega

o  Aplicación de una página (SPA) + servicios REST con las funcionalidades principales

del sistema. Incluye autenticación y autorización por roles (40%).

o  Pruebas de integración automatizadas: como mínimo una por tipo de método HTTP

utilizado en los servicios complejos del sistema (20%).

o  Una prueba de sistema automatizada para el caso de uso más complejo y largo del

proyecto (15%).

o  Video que explique las funcionalidades finales y, en paralelo, identifique qué parte

del código fuente las implementa (25%).

7.  Aclaraciones de las entregas

Para la primera entrega, a nivel de diseño se deberá considerar el sistema simplificado descrito en
este enunciado. A nivel de implementación, el alcance estará limitado a los siguientes componentes
funcionales mínimos:



1.  Gestión de recursos y disponibilidad:

•  CRUD de recursos, categorías y ubicaciones.
•  Consulta básica de disponibilidad mediante una tabla, lista o calendario simplificado.

2.  Gestión de reservas:

•  Crear, consultar, modificar y cancelar reservas.
•  Validación de solapamiento para el mismo recurso y bloqueo del recurso.

3.  Préstamos y devoluciones:

•  Registro básico de entrega y devolución de equipos.

4.  Incidentes:

•  Formulario de reporte con recurso, tipo, severidad y descripción.

5.  Analítica inicial:

•  Tabla con el número de reservas por recurso o categoría.

6.  Carga inicial:

•  Programa Batch para poblar categorías, ubicaciones, recursos y datos de ejemplo.

En la primera entrega no es obligatorio implementar autenticación ni autorización; sin embargo, el
diseño debe contemplar desde el inicio los roles y permisos que se implementarán posteriormente.

Para la segunda entrega, como mínimo deberán implementarse mediante SPA + REST: catálogo y
búsqueda, reservas con validación de conflictos, préstamo/devolución, incidentes, mantenimiento
básico y una vista sencilla de indicadores.

Para la tercera entrega deberá completarse la seguridad por roles y se deberá implementar el flujo
seleccionado para la prueba de sistema.


