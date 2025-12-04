// Glosario de conceptos de negocio para Stocky
export const getGlossaryResponse = (lower: string): string | null => {
  
  // CONCEPTOS DE INVENTARIO
  if (/(stock|inventario|existencia)/i.test(lower)) {
    return `📦 **¿Qué es el Stock o Inventario?**

El **stock** o **inventario** es la cantidad de productos o mercancías que tienes disponibles para vender en tu negocio.

🎯 **Conceptos clave:**

• **Stock disponible:** Productos listos para venta
• **Stock mínimo:** Cantidad mínima que debes mantener
• **Stock de seguridad:** Extra para imprevistos
• **Ruptura de stock:** Cuando se acaba un producto

💡 **Mejores prácticas:**

1. **Control regular:** Revisa tu inventario semanalmente
2. **Rotación:** Vende primero lo más antiguo (PEPS)
3. **Punto de reorden:** Define cuándo reabastecer
4. **Evita sobrestock:** No acumules demasiado producto

📊 **En MiniStock:**
Tu stock se actualiza automáticamente:
• Las **ventas** restan stock
• Las **compras** suman stock

¿Quieres saber sobre otro concepto?`;
  }

  if (/(crud|crear.*leer|operaciones básicas|operaciones basicas)/i.test(lower)) {
    return `✍️ **¿Qué es CRUD?**

**CRUD** son las siglas de las 4 operaciones básicas en cualquier sistema:

📝 **C**reate (Crear)
• Agregar nuevos registros
• Ejemplo: Crear un nuevo producto o cliente

👀 **R**ead (Leer)
• Consultar información existente
• Ejemplo: Ver lista de productos o ventas

✏️ **U**pdate (Actualizar)
• Modificar registros existentes
• Ejemplo: Cambiar precio de un producto

🗑️ **D**elete (Eliminar)
• Borrar registros
• Ejemplo: Eliminar un producto descontinuado

🎯 **En MiniStock puedes:**

• **Crear:** Productos, clientes, proveedores, ventas, compras
• **Leer:** Ver toda tu información y reportes
• **Actualizar:** Editar cualquier registro
• **Eliminar:** Borrar lo que ya no necesites

💡 **Tip:** Siempre verifica antes de eliminar, ¡es permanente!

¿Necesitas ayuda con alguna operación específica?`;
  }

  if (/(cliente|comprador|consumidor)/i.test(lower) && /(qué es|que es|significa)/i.test(lower)) {
    return `👥 **¿Qué es un Cliente?**

Un **cliente** es la persona o empresa que compra tus productos o servicios.

🎯 **Tipos de clientes:**

• **Cliente ocasional:** Compra esporádicamente
• **Cliente frecuente:** Compra regularmente
• **Cliente VIP:** Genera mayores ingresos
• **Cliente potencial:** Aún no ha comprado

📊 **Por qué registrar clientes:**

1. **Seguimiento de ventas:** Saber quién compra qué
2. **Historial:** Ver patrones de compra
3. **Fidelización:** Ofrecer promociones personalizadas
4. **Contacto:** Tener forma de comunicarte

💡 **Mejores prácticas:**

✅ Registra nombre, teléfono y email
✅ Actualiza información regularmente
✅ Analiza quiénes son tus mejores clientes
✅ Mantén buena comunicación
✅ Premia la lealtad

🎁 **Estrategias de fidelización:**

• Descuentos por volumen
• Programas de puntos
• Atención personalizada
• Promociones exclusivas

En MiniStock puedes ver estadísticas detalladas de cada cliente. ¡Prueba preguntarme "¿Quién es mi mejor cliente?"!`;
  }

  if (/(proveedor|supplier|abastecedor|distribuidor)/i.test(lower) && /(qué es|que es|significa)/i.test(lower)) {
    return `🏭 **¿Qué es un Proveedor?**

Un **proveedor** es la persona o empresa que te vende los productos que luego tú comercializas.

🎯 **Importancia de los proveedores:**

• **Abastecimiento:** Te surten de mercancía
• **Calidad:** Determinan la calidad de tus productos
• **Precios:** Afectan tu margen de ganancia
• **Confiabilidad:** Entregas a tiempo

📊 **Criterios para elegir proveedores:**

1. **Precio:** Compara y negocia
2. **Calidad:** Verifica la mercancía
3. **Puntualidad:** Entregas a tiempo
4. **Crédito:** Facilidades de pago
5. **Servicio:** Atención y soporte

💡 **Mejores prácticas:**

✅ Mantén varios proveedores (no dependas de uno)
✅ Negocia términos claros
✅ Paga puntualmente para mantener buena relación
✅ Lleva registro de compras por proveedor
✅ Evalúa rendimiento periódicamente

⚠️ **Señales de alerta:**

• Entregas tardías constantes
• Productos defectuosos
• Precios inconsistentes
• Mala comunicación

🤝 **Relación ganar-ganar:**

Un buen proveedor es un socio estratégico. Cultiva relaciones a largo plazo basadas en confianza mutua.

¿Quieres consejos sobre cómo negociar con proveedores?`;
  }

  if (/(margen|ganancia|utilidad|rentabilidad|beneficio)/i.test(lower) && /(qué es|que es|significa)/i.test(lower)) {
    return `📊 **¿Qué es el Margen de Ganancia?**

El **margen de ganancia** es el porcentaje de beneficio que obtienes sobre cada venta.

💰 **Fórmulas clave:**

**Margen bruto:**
Margen = ((Precio Venta - Costo) / Precio Venta) × 100

**Ganancia por unidad:**
Ganancia = Precio Venta - Costo Compra

📈 **Ejemplo práctico:**

Compras un producto a $100
Lo vendes a $150

• Ganancia: $150 - $100 = $50
• Margen: ($50 / $150) × 100 = 33.3%

🎯 **Márgenes por industria:**

• Alimentos: 20-30%
• Ropa: 40-60%
• Electrónica: 10-20%
• Joyería: 50-100%
• Servicios: 60-80%

💡 **Estrategias de margen:**

**Alto margen, bajo volumen:**
• Productos exclusivos o de lujo
• Menos ventas pero mayor ganancia

**Bajo margen, alto volumen:**
• Productos de consumo masivo
• Más ventas pero menor ganancia individual

En MiniStock puedes ver tu balance general. ¡Analiza regularmente tu rentabilidad!

¿Quieres que calcule el margen de algún producto específico?`;
  }

  if (/(precio|pricing|tarifa)/i.test(lower) && /(qué es|que es|significa|cómo|como)/i.test(lower)) {
    return `💵 **¿Cómo Fijar Precios?**

El **precio** es el valor monetario que asignas a tus productos o servicios.

🎯 **Métodos de fijación de precios:**

**1. Costo + Margen:**
Precio = Costo / (1 - Margen deseado)

Ejemplo: Costo $100, margen 30%
Precio = $100 / 0.70 = $142.86

**2. Competencia:**
• Precio similar al mercado
• Ligeramente más bajo (penetración)
• Ligeramente más alto (diferenciación)

**3. Valor percibido:**
• Basado en lo que el cliente valora
• Calidad, marca, experiencia

💡 **Factores a considerar:**

✅ **Costos:** Compra + operativos
✅ **Competencia:** Precios del mercado
✅ **Cliente:** Poder adquisitivo
✅ **Valor:** Calidad y beneficios
✅ **Objetivos:** Volumen vs. margen

⚠️ **Errores comunes:**

• Precio muy bajo (pierdes dinero)
• Precio muy alto (no vendes)
• No considerar todos los costos
• Copiar competencia sin análisis

💡 **Regla de oro:**

Tu precio debe:
1. Cubrir todos los costos
2. Generar margen de ganancia
3. Ser competitivo
4. Reflejar valor entregado

¿Quieres ayuda para calcular el precio de un producto?`;
  }

  if (/(venta|vender|ingreso|revenue)/i.test(lower) && /(qué es|que es|significa)/i.test(lower)) {
    return `💰 **¿Qué es una Venta?**

Una **venta** es la operación comercial donde entregas un producto o servicio a cambio de dinero.

🎯 **Componentes de una venta:**

• **Producto:** Lo que vendes
• **Cliente:** A quién le vendes
• **Cantidad:** Cuántas unidades
• **Precio:** Valor de venta
• **Total:** Cantidad × Precio

📊 **Tipos de ventas:**

**Por volumen:**
• Venta al detalle (menudeo)
• Venta al mayoreo (grandes cantidades)

**Por forma:**
• Venta al contado (pago inmediato)
• Venta a crédito (pago diferido)

✨ **Técnicas para vender más:**

• **Upselling:** Vender producto superior
• **Cross-selling:** Vender productos complementarios
• **Descuentos por volumen:** Incentivar compras grandes
• **Bundles:** Paquetes de productos

En MiniStock, cada venta reduce automáticamente el stock. ¡Mantén siempre actualizado tu inventario!

¿Quieres consejos sobre cómo aumentar tus ventas?`;
  }

  if (/(compra|adquisición|adquisicion|purchase|egreso)/i.test(lower) && /(qué es|que es|significa)/i.test(lower)) {
    return `🛒 **¿Qué es una Compra?**

Una **compra** es cuando adquieres productos de un proveedor para luego venderlos o usarlos en tu negocio.

🎯 **Elementos de una compra:**

• **Producto:** Lo que compras
• **Proveedor:** A quién le compras
• **Cantidad:** Cuántas unidades
• **Costo:** Precio de compra
• **Total:** Cantidad × Costo

💡 **Buenas prácticas de compra:**

1. **Planifica:** No compres de improviso
2. **Compara:** Revisa precios de varios proveedores
3. **Negocia:** Pide descuentos por volumen
4. **Calcula bien:** No compres más de lo que puedes vender
5. **Verifica:** Revisa calidad al recibir

⚠️ **Errores comunes:**

• Comprar demasiado (capital congelado)
• Comprar muy poco (quedarse sin stock)
• No verificar calidad
• No negociar precios

En MiniStock, cada compra suma automáticamente al stock. ¡Controla bien tus egresos!

¿Necesitas ayuda para calcular tu margen de ganancia?`;
  }

  if (/(balance|estado.*resultado)/i.test(lower) && /(qué es|que es|significa)/i.test(lower)) {
    return `💼 **¿Qué es el Balance?**

El **balance** es la diferencia entre tus ingresos y egresos en un período determinado.

📊 **Fórmula básica:**
Balance = Ingresos Totales - Egresos Totales

🎯 **Tipos de balance:**

**Balance positivo (utilidad):**
• Ingresos > Egresos
• ✅ Estás generando ganancias
• Reinvierte o ahorra

**Balance negativo (pérdida):**
• Ingresos < Egresos
• ⚠️ Estás perdiendo dinero
• Revisa costos y aumenta ventas

**Punto de equilibrio:**
• Ingresos = Egresos
• No ganas ni pierdes
• Necesitas crecer

💡 **Mejora tu balance:**

**Aumenta ingresos:**
✅ Más ventas
✅ Mejores precios
✅ Nuevos productos
✅ Más clientes

**Reduce egresos:**
✅ Negocia con proveedores
✅ Optimiza gastos
✅ Elimina desperdicios

En MiniStock puedes ver tu balance en tiempo real. ¡Pregúntame "muestra mi balance"!`;
  }

  if (/(categoría|categoria|clasificación|clasificacion)/i.test(lower) && /(qué es|que es|significa)/i.test(lower)) {
    return `📁 **¿Qué es una Categoría?**

Una **categoría** es una forma de organizar y agrupar productos similares o relacionados.

🎯 **Beneficios de categorizar:**

1. **Organización:** Encuentra productos rápidamente
2. **Análisis:** Ve qué categorías venden más
3. **Gestión:** Controla mejor el inventario
4. **Compras:** Planifica reabastecimientos
5. **Estrategia:** Toma decisiones por categoría

📊 **Ejemplos de categorías:**

**Por tipo de producto:**
• Electrónica
• Ropa y calzado
• Alimentos y bebidas
• Hogar y decoración
• Belleza y cuidado personal

💡 **Mejores prácticas:**

✅ Nombres claros y descriptivos
✅ No demasiadas categorías (5-15 ideal)
✅ Evita superposiciones
✅ Revisa y ajusta regularmente

En MiniStock puedes crear y gestionar categorías fácilmente. ¡Organiza tu inventario!`;
  }

  return null;
};

export const getAdviceResponse = (lower: string): string | null => {
  
  if (/(vender más|vender mas|aumentar ventas|incrementar ventas)/i.test(lower)) {
    return `📈 **Cómo Aumentar tus Ventas**

🎯 **Estrategias probadas:**

**1. Conoce a tu cliente:**
• Identifica sus necesidades
• Escucha sus problemas
• Ofrece soluciones específicas

**2. Técnicas de venta:**

**Cross-selling (venta cruzada):**
"Con tu café, ¿gustas un pan?"
Productos complementarios

**Upselling (venta superior):**
"Por solo $X más, llévate el modelo premium"
Versión mejorada

**Bundling (paquetes):**
"3 productos por el precio de 2"
Combos atractivos

**3. Promociones inteligentes:**

• **Descuentos por volumen:** "Lleva 3, paga 2"
• **Descuentos por temporada:** Liquidaciones
• **Programas de lealtad:** Puntos o cashback
• **Urgencia:** "Oferta válida hoy"

**4. Excelente servicio:**

✨ Atención rápida y amable
✨ Conocimiento del producto
✨ Seguimiento post-venta
✨ Resolución de problemas

🎯 **Plan de acción rápido:**

**Esta semana:**
1. Identifica tu producto estrella
2. Crea una promoción atractiva
3. Comunícala a tus clientes

**Este mes:**
1. Mejora presentación de productos
2. Implementa una técnica de venta
3. Pide feedback a clientes

💡 **Recuerda:**
"El cliente no compra productos, compra soluciones a sus problemas"

En MiniStock analiza tus estadísticas para identificar oportunidades. ¿Quieres ver tus productos más vendidos?`;
  }

  if (/(manejar.*inventario|gestionar.*inventario|controlar.*stock|organizar.*productos)/i.test(lower)) {
    return `📦 **Cómo Gestionar Mejor tu Inventario**

🎯 **Principios fundamentales:**

**1. Control regular:**

✅ **Conteo físico:**
• Semanal para productos importantes
• Mensual para productos regulares
• Trimestral para productos de baja rotación

✅ **Conciliación:**
• Compara físico vs. sistema
• Identifica diferencias
• Investiga causas (merma, robo, errores)

**2. Niveles de stock óptimos:**

📊 **Stock mínimo:**
Mínimo = Venta diaria promedio × Días de reabastecimiento

📊 **Punto de reorden:**
Cuando llegues al mínimo, es hora de comprar

**3. Organización física:**

🏪 **Layout efectivo:**
• Productos populares accesibles
• Similar agrupado (categorías)
• Sistema de ubicación claro
• PEPS para perecederos

**4. Prevención de problemas:**

**Evita sobrestock:**
• Capital congelado
• Obsolescencia
• Espacio desperdiciado

**Evita ruptura de stock:**
• Ventas perdidas
• Clientes insatisfechos

💡 **Checklist mensual:**

□ Conteo físico
□ Identificar productos sin rotación
□ Verificar niveles mínimos
□ Planificar compras próximo mes
□ Analizar márgenes por categoría

🎯 **Regla de oro:**

"El mejor inventario es el que se vende rápido con buen margen"

MiniStock te ayuda con alertas y reportes automáticos. ¿Quieres ver tus productos de bajo stock?`;
  }

  if (/(fidelizar.*cliente|retener.*cliente|lealtad.*cliente|cliente.*frecuente)/i.test(lower)) {
    return `💙 **Cómo Fidelizar Clientes**

Un cliente fiel vale 10 veces más que uno nuevo.

🎯 **Estrategias de fidelización:**

**1. Excelencia en servicio:**

✨ **Antes de la venta:**
• Atención personalizada
• Asesoría honesta

✨ **Durante la venta:**
• Proceso ágil
• Información clara

✨ **Después de la venta:**
• Seguimiento
• Soporte
• Garantías claras

**2. Programas de lealtad:**

🎁 **Sistema de puntos:**
$1 = 1 punto
100 puntos = $10 descuento

🎁 **Beneficios exclusivos:**
• Descuentos especiales
• Preventa de novedades
• Regalos de cumpleaños

**3. Comunicación constante:**

📱 WhatsApp, Email, Redes sociales

📬 **Contenido:**
• Nuevos productos
• Promociones exclusivas
• Tips y consejos

**4. Personalización:**

👤 **Conoce a tu cliente:**
• Nombre (¡úsalo!)
• Preferencias de compra
• Historial

**5. Supera expectativas:**

✨ **Detalles que marcan:**
• Empaque especial
• Nota de agradecimiento
• Regalo sorpresa pequeño

🎯 **Recuerda:**

"Cuesta 5 veces más conseguir un cliente nuevo que retener uno existente"

Usa MiniStock para identificar tus mejores clientes y darles atención especial. ¿Quieres ver tu análisis de clientes?`;
  }

  return null;
};
