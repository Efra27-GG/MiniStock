# Guía de Control de Versiones - MiniStock

## 📌 Ubicación de la Versión

La versión de MiniStock y Stocky se controla desde un único archivo centralizado:

**Archivo:** `/constants/version.ts`

```typescript
export const MINISTOCK_VERSION = '1.0.0';
export const STOCKY_VERSION = '1.0.0';
```

## 🔄 Cómo Actualizar la Versión

### Opción 1: Actualizar ambas versiones
Si los cambios afectan tanto a MiniStock como a Stocky:

```typescript
export const MINISTOCK_VERSION = '1.1.0';
export const STOCKY_VERSION = '1.1.0';
```

### Opción 2: Actualizar solo MiniStock
Si los cambios solo afectan a la aplicación principal:

```typescript
export const MINISTOCK_VERSION = '1.1.0';
export const STOCKY_VERSION = '1.0.0';
```

### Opción 3: Actualizar solo Stocky
Si los cambios solo afectan al chatbot:

```typescript
export const MINISTOCK_VERSION = '1.0.0';
export const STOCKY_VERSION = '1.1.0';
```

## 📍 Dónde se Muestra la Versión

### 1. Mi Perfil (ProfileSettings)
- **Ubicación:** Sección "Acerca de MiniStock"
- **Muestra:** `MINISTOCK_VERSION`

### 2. Stocky - Asistente Virtual
- **Ubicación:** Sección "Stocky - Asistente Virtual" en Mi Perfil
- **Muestra:** `STOCKY_VERSION`

### 3. Chat de Stocky
- **Ubicación:** Mensaje de bienvenida del chatbot
- **Muestra:** `STOCKY_VERSION`

## 📊 Sistema de Versionado

Usamos **Versionado Semántico** (Semantic Versioning):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─── Correcciones de bugs
  │     └───────── Nuevas funcionalidades (compatible)
  └─────────────── Cambios incompatibles

Ejemplos:
- 1.0.0 → 1.0.1 : Corrección de un bug
- 1.0.1 → 1.1.0 : Nueva funcionalidad agregada
- 1.1.0 → 2.0.0 : Cambio mayor en la arquitectura
```

## 📝 Historial de Versiones

### v1.0.0 (Actual)
- ✅ Sistema completo de autenticación (login/registro)
- ✅ Gestión de categorías y productos
- ✅ Gestión de clientes y proveedores
- ✅ Sistema de ventas con inventario dinámico
- ✅ Sistema de compras con inventario dinámico
- ✅ Reportes y gráficas (ingresos, egresos, balance)
- ✅ Stocky: Chatbot asistente con consultas de inventario
- ✅ Diseño responsive optimizado para todos los dispositivos
- ✅ Almacenamiento local con localStorage

## 🎯 Próximas Versiones (Planificadas)

### v1.1.0
- [ ] Exportar reportes a PDF
- [ ] Filtros avanzados en gráficas
- [ ] Modo oscuro

### v1.2.0
- [ ] Notificaciones de stock bajo
- [ ] Backup y restauración de datos
- [ ] Múltiples usuarios por cuenta

### v2.0.0
- [ ] Integración con APIs externas
- [ ] Dashboard mejorado con widgets
- [ ] Sistema de roles y permisos

---

**Nota:** Cada vez que hagas cambios significativos, actualiza la versión en `/constants/version.ts` y documenta los cambios en este archivo.
