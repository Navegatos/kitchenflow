# Manual de usuario — KitchenFlow

Guía operativa para realizar operaciones **Create, Read, Update y Delete (CRUD)** desde la interfaz web de KitchenFlow.

> **Alcance:** Este manual describe lo que puedes hacer **hoy en la aplicación**. Si una operación no está disponible en pantalla, se indica como **No implementado**.

---

## 1. Acceso al sistema

### Iniciar sesión (Create — sesión)

1. Abre la aplicación en el navegador: `http://localhost:5173`
2. Si no has iniciado sesión, serás redirigido a **Login**.
3. Ingresa tu **correo electrónico** y **contraseña**.
4. Haz clic en **Ingresar**.
5. El sistema te llevará al panel principal según tu rol (Admin, Gerente, Chef o Mesero).

| Operación | Estado |
|-----------|--------|
| **Create** (iniciar sesión) | Implementado |
| **Read** (ver datos de tu perfil en la barra lateral) | Implementado |
| **Update** (cambiar contraseña propia) | No implementado |
| **Delete** (cerrar cuenta) | No implementado |

### Cerrar sesión

1. En la barra lateral inferior, haz clic en **Cerrar sesión**.
2. Vuelves a la pantalla de login.

---

## 2. Navegación general

Tras iniciar sesión, el menú lateral muestra las secciones disponibles según tu rol:

| Sección | Ruta | Descripción |
|---------|------|-------------|
| Dashboard | `/` | Resumen general |
| Inventario | `/inventario` | Ingredientes y movimientos de stock |
| Ingreso | `/ingreso-inventario` | Registro de compras/entradas |
| Recetas | `/recetas` | Creación y consulta de recetas |
| Menú / Platos | `/menu` | Vista del menú activo |
| Finanzas | `/finanzas` | Indicadores financieros |
| Ventas | `/ventas` | Resumen de ventas |
| Reportes | `/reportes` | Reportes y exportación |
| Mermas | `/mermas` | Registro de pérdidas de inventario |
| Usuarios | `/usuarios` | Gestión de usuarios del sistema |
| Configuración | `/configuracion` | Parámetros del negocio |

---

## 3. CRUD por módulo

### 3.1 Usuarios

**Ruta:** Menú lateral → **Usuarios** (`/usuarios`)  
**Roles con acceso:** Administrador y Gerente.

#### Create — Crear usuario

1. Entra a **Usuarios**.
2. Haz clic en **Nuevo Usuario** (esquina superior derecha).
3. Completa el formulario:
   - Nombre completo
   - Correo electrónico
   - Contraseña (obligatoria al crear)
   - Rol (Admin, Gerente, Chef o Mesero)
   - Sucursal (opcional)
   - Estado activo/inactivo
4. Haz clic en **Guardar**.
5. Aparecerá un mensaje de confirmación y el usuario se agregará a la tabla.

#### Read — Consultar usuarios

1. Entra a **Usuarios**.
2. La tabla muestra todos los usuarios: nombre, correo, rol, sucursal, estado y último acceso.
3. Usa el campo **Buscar usuario...** para filtrar por nombre o correo.
4. La matriz **Permisos por Rol** (panel derecho) es solo informativa; no se puede editar.

| Operación | Estado |
|-----------|--------|
| Ver detalle individual de un usuario (pantalla aparte) | No implementado |

#### Update — Editar usuario

1. En la tabla de usuarios, haz clic en el icono de **lápiz** (Editar) en la fila del usuario.
2. Modifica los campos necesarios (nombre, correo, rol, sucursal, estado).
3. Haz clic en **Guardar**.

> **Nota:** Al editar no se puede cambiar la contraseña desde este formulario.

| Operación | Estado |
|-----------|--------|
| Restablecer contraseña de otro usuario | No implementado |

#### Delete — Eliminar usuario

| Operación | Estado |
|-----------|--------|
| Eliminar usuario permanentemente | No implementado |

**Alternativa disponible:** desactivar al usuario con el interruptor **Estado del usuario** al editarlo. Un usuario inactivo no puede acceder al sistema, pero el registro permanece en la base de datos.

---

### 3.2 Productos / Ingredientes (Inventario)

**Ruta:** Menú lateral → **Inventario** (`/inventario`)

#### Create — Crear ingrediente

1. Entra a **Inventario**.
2. Asegúrate de estar en la pestaña **Ingredientes**.
3. Haz clic en **Nuevo Ingrediente**.
4. Completa el formulario:
   - Nombre
   - Proveedor
   - Stock inicial
   - Stock mínimo
   - Costo por unidad
   - Unidad (lista desplegable)
   - Categoría (lista desplegable)
5. Haz clic en **Guardar**.

#### Read — Consultar ingredientes

1. Entra a **Inventario** → pestaña **Ingredientes**.
2. Revisa la tabla con stock, mínimo, costo, valor y estado (Normal / Stock bajo / Sin stock).
3. Usa los filtros:
   - **Buscar ingrediente o proveedor...**
   - **Todas las categorías** (desplegable)
   - **Todos / Normal / Bajo / Crítico** (desplegable de estado)

| Operación | Estado |
|-----------|--------|
| Ver ficha detallada de un producto (pantalla aparte) | No implementado |

#### Update — Editar ingrediente

| Operación | Estado |
|-----------|--------|
| Editar datos del ingrediente (nombre, costo, stock mínimo, etc.) | No implementado |

> Existe un botón de **lápiz** en la columna Acciones, pero **no está conectado** a ninguna acción.

#### Delete — Eliminar ingrediente

| Operación | Estado |
|-----------|--------|
| Eliminar o desactivar ingrediente | No implementado |

---

### 3.3 Movimientos de inventario

**Rutas:** **Inventario** (`/inventario`) e **Ingreso** (`/ingreso-inventario`)

#### Create — Registrar movimiento (desde Inventario)

1. Entra a **Inventario** → pestaña **Ingredientes**.
2. En la fila del ingrediente, haz clic en el icono de **flechas circulares** (Registrar movimiento).
3. Selecciona el tipo: **Compra**, **Uso** o **Merma**.
4. Indica la **cantidad** y opcionalmente **notas**.
5. Haz clic en **Guardar**.

El stock del ingrediente se actualiza automáticamente.

#### Create — Registrar ingreso de compra (desde Ingreso)

1. Entra a **Ingreso** en el menú lateral.
2. En **Nuevo ingreso**, selecciona el **Producto**.
3. Indica **Cantidad** y **Costo unitario** (referencial; el ingreso registra la cantidad en stock).
4. Haz clic en **Registrar ingreso**.

#### Read — Consultar movimientos

**Opción A — Historial general**

1. Entra a **Inventario**.
2. Cambia a la pestaña **Movimientos**.
3. Revisa la tabla: fecha, ingrediente, tipo, cantidad, costo y notas.

**Opción B — Ingresos recientes**

1. Entra a **Ingreso**.
2. Revisa la tabla inferior con los últimos ingresos registrados.

#### Update — Editar movimiento

| Operación | Estado |
|-----------|--------|
| Modificar un movimiento existente | No implementado |

#### Delete — Eliminar movimiento

| Operación | Estado |
|-----------|--------|
| Eliminar movimiento del historial | No implementado |

> Los botones de la **Zona de Peligro** en Configuración ("Limpiar historial de movimientos") **no están implementados**.

---

### 3.4 Recetas

**Ruta:** Menú lateral → **Recetas** (`/recetas`)

#### Create — Crear receta

1. Entra a **Recetas**.
2. Haz clic en **Nueva Receta**.
3. En el **Constructor de Receta**, completa:
   - Nombre del plato
   - Categoría
   - Precio de venta
   - Descripción (opcional)
4. Busca ingredientes en **Agregar Ingredientes**, selecciónalos y define la cantidad de cada uno.
5. Revisa el panel **Análisis en Tiempo Real** (costo, margen, ganancia).
6. Haz clic en **Guardar Receta**.

#### Read — Consultar recetas

1. Entra a **Recetas**.
2. Revisa las tarjetas con nombre, categoría, precio, costo, margen y cantidad de ingredientes.
3. Usa **Buscar receta...** y los filtros por categoría.
4. Haz clic en una tarjeta para abrir el **detalle** con desglose de ingredientes y márgenes.

| Operación | Estado |
|-----------|--------|
| Ver recetas inactivas | No implementado (solo se listan recetas activas) |

#### Update — Editar receta

| Operación | Estado |
|-----------|--------|
| Modificar nombre, precio, ingredientes o desactivar receta | No implementado |

#### Delete — Eliminar receta

| Operación | Estado |
|-----------|--------|
| Eliminar o desactivar receta | No implementado |

---

### 3.5 Menú / Platos

**Ruta:** Menú lateral → **Menú / Platos** (`/menu`)

#### Read — Consultar menú

1. Entra a **Menú / Platos**.
2. Revisa las tarjetas de cada plato activo: costo de receta, precio actual y margen.

| Operación | Estado |
|-----------|--------|
| **Create** — Agregar plato desde esta pantalla | No implementado |
| **Update** — Guardar cambio de precio | No implementado |
| **Delete** — Quitar plato del menú | No implementado |

> El campo **Editar precio** y el botón **Guardar** son visuales; los cambios **no se guardan** en el servidor. Para crear platos, usa **Recetas** → **Nueva Receta**.

---

### 3.6 Mermas

**Ruta:** Menú lateral → **Mermas** (`/mermas`)

#### Create — Registrar merma

1. Entra a **Mermas**.
2. Haz clic en **Registrar Merma**.
3. Selecciona el **Ingrediente**.
4. Indica la **Cantidad** (el costo estimado se calcula automáticamente).
5. Elige el **Motivo** (lista predefinida).
6. Haz clic en **Registrar Merma**.

El stock del ingrediente disminuye y queda registrado en el historial.

#### Read — Consultar mermas

1. Entra a **Mermas**.
2. Revisa los indicadores superiores (merma total, promedio diario, registros, ingredientes afectados).
3. Consulta el gráfico **Merma por motivo**.
4. Revisa la tabla **Historial de mermas**.

#### Update — Editar merma

| Operación | Estado |
|-----------|--------|
| Modificar un registro de merma | No implementado |

#### Delete — Eliminar merma

| Operación | Estado |
|-----------|--------|
| Eliminar registro de merma | No implementado |

> Los registros de merma son inmutables por diseño (auditoría).

---

### 3.7 Configuración del negocio

**Ruta:** Menú lateral → **Configuración** (`/configuracion`)

#### Read — Consultar configuración

1. Entra a **Configuración**.
2. Revisa las secciones:
   - **Datos del Negocio** (nombre, dirección, teléfono, correo, RUT, tipo)
   - **Configuración Financiera** (moneda, impuestos, márgenes, alertas)
   - **Integración Toteat** (estado, API key, sincronización, webhook)
   - **Notificaciones** (alertas de stock, merma, reportes, rentabilidad)

#### Update — Modificar configuración

1. Edita los campos de la sección deseada.
2. Haz clic en **Guardar cambios** (o **Guardar** en Integración Toteat) al final de cada sección.
3. Espera el mensaje de confirmación.

| Operación | Estado |
|-----------|--------|
| **Create** — Crear nueva configuración | No implementado (existe un único registro del sistema) |
| **Delete** — Eliminar configuración | No implementado |

#### Zona de Peligro

Los botones **Limpiar historial de movimientos**, **Restablecer datos de prueba** y **Eliminar cuenta** están visibles pero:

| Operación | Estado |
|-----------|--------|
| Todas las acciones de Zona de Peligro | No implementado |

---

### 3.8 Pedidos

| Operación | Estado |
|-----------|--------|
| **Create** — Crear pedido | No implementado |
| **Read** — Ver listado o detalle de pedidos | No implementado |
| **Update** — Cambiar estado de pedido | No implementado |
| **Delete** — Cancelar pedido | No implementado |

> La API backend soporta pedidos, pero **no hay pantalla** en la aplicación para gestionarlos. Las secciones **Ventas** y **Dashboard** muestran datos agregados de ventas, no pedidos individuales.

---

### 3.9 Proveedores

| Operación | Estado |
|-----------|--------|
| **Create** — Crear proveedor | No implementado |
| **Read** — Listar o consultar proveedores | No implementado |
| **Update** — Editar proveedor | No implementado |
| **Delete** — Eliminar proveedor | No implementado |

> Al crear un ingrediente puedes escribir un nombre de proveedor en texto libre, pero no existe gestión de proveedores como entidad.

---

### 3.10 Categorías de producto

| Operación | Estado |
|-----------|--------|
| **Create** — Crear categoría | No implementado |
| **Read** — Ver categorías | Implementado (solo lectura en desplegables al crear ingredientes) |
| **Update** — Editar categoría | No implementado |
| **Delete** — Eliminar categoría | No implementado |

---

### 3.11 Catálogos del sistema (solo lectura)

Estos datos aparecen en formularios pero **no se pueden crear, editar ni eliminar** desde la interfaz:

| Catálogo | Dónde se usa | CRUD en UI |
|----------|--------------|------------|
| Sucursales | Formulario de usuarios | Solo **Read** (desplegable) |
| Categorías de receta | Formulario de recetas | Solo **Read** (desplegable) |
| Unidades de producto | Formulario de ingredientes | Solo **Read** (desplegable) |
| Motivos de merma | Formulario de mermas | Solo **Read** (desplegable) |
| Permisos por rol | Pantalla de usuarios | Solo **Read** (matriz informativa) |

---

### 3.12 Módulos de solo consulta (Read)

Estas secciones **no permiten crear, editar ni eliminar** registros. Solo muestran información y reportes.

#### Dashboard (`/`)

- Resumen de ventas, inventario, mermas y alertas.
- **CRUD:** solo **Read**.

#### Finanzas (`/finanzas`)

- Indicadores de rentabilidad, márgenes y costos.
- Filtro por período (botones de rango temporal).
- **CRUD:** solo **Read**.

#### Ventas (`/ventas`)

- Resumen agregado de ventas.
- **CRUD:** solo **Read**.

#### Reportes (`/reportes`)

1. Entra a **Reportes**.
2. Consulta los reportes disponibles en pantalla.
3. Para exportar, usa el botón de **descarga/exportar** (genera archivo CSV).

| Operación | Estado |
|-----------|--------|
| **Read** (ver reportes) | Implementado |
| **Read** (exportar CSV) | Implementado |
| **Create / Update / Delete** | No implementado |

---

## 4. Resumen CRUD por entidad

| Entidad | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| Sesión / Login | ✅ | ✅ | ❌ | ❌ (solo cerrar sesión) |
| Usuarios | ✅ | ✅ | ✅ | ❌ (desactivar ≈ soft delete) |
| Productos / Ingredientes | ✅ | ✅ | ❌ | ❌ |
| Movimientos de inventario | ✅ | ✅ | ❌ | ❌ |
| Recetas | ✅ | ✅ | ❌ | ❌ |
| Menú / Platos | ❌ | ✅ | ❌ | ❌ |
| Mermas | ✅ | ✅ | ❌ | ❌ |
| Configuración | ❌ | ✅ | ✅ | ❌ |
| Pedidos | ❌ | ❌ | ❌ | ❌ |
| Proveedores | ❌ | ❌ | ❌ | ❌ |
| Categorías de producto | ❌ | ⚠️ | ❌ | ❌ |
| Catálogos (sucursales, unidades, etc.) | ❌ | ⚠️ | ❌ | ❌ |
| Dashboard / Finanzas / Ventas | ❌ | ✅ | ❌ | ❌ |
| Reportes | ❌ | ✅ (+ export) | ❌ | ❌ |

**Leyenda:** ✅ Implementado · ❌ No implementado · ⚠️ Solo lectura parcial (desplegables o listados auxiliares)

---

## 5. Roles y acceso

No todos los usuarios ven las mismas secciones. El menú lateral filtra las opciones según el rol:

| Rol | Acceso típico |
|-----|---------------|
| **Admin** | Todas las secciones |
| **Gerente** | Operaciones + usuarios + configuración |
| **Chef** | Inventario, recetas, mermas, menú |
| **Mesero** | Dashboard, ventas (según permisos configurados) |

Si no ves una opción del menú, tu rol no tiene permiso para acceder a esa ruta.

---

## 6. Mensajes y confirmaciones

- Al guardar correctamente aparece una notificación verde (toast) en la esquina de la pantalla.
- Si hay un error (datos incompletos, duplicado, stock insuficiente), aparece una notificación roja con el detalle.
- Los formularios con campos obligatorios vacíos no se envían (el botón **Guardar** no hace nada o muestra error).

---

## 7. Referencia rápida — ¿Dónde hago qué?

| Quiero… | Ir a… | Acción |
|---------|-------|--------|
| Crear un usuario | Usuarios → Nuevo Usuario | ✅ |
| Desactivar un usuario | Usuarios → Editar → Apagar "Estado del usuario" | ✅ |
| Agregar un ingrediente | Inventario → Nuevo Ingrediente | ✅ |
| Registrar entrada de stock | Inventario → icono movimiento **o** Ingreso → Registrar ingreso | ✅ |
| Crear una receta | Recetas → Nueva Receta | ✅ |
| Ver costo y margen de una receta | Recetas → clic en la tarjeta | ✅ |
| Registrar una merma | Mermas → Registrar Merma | ✅ |
| Cambiar datos del negocio | Configuración → editar → Guardar cambios | ✅ |
| Editar un ingrediente existente | — | ❌ No implementado |
| Editar una receta existente | — | ❌ No implementado |
| Cambiar precio del menú | — | ❌ No implementado |
| Gestionar pedidos | — | ❌ No implementado |
| Eliminar cualquier registro | — | ❌ No implementado |

---

*Documento generado para KitchenFlow — refleja el estado de la interfaz web a junio 2026.*
