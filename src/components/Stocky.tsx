import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Send, Sparkles } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import stockyLogo from 'figma:asset/869157f32535268e74eceaec6ea380f56a06fab5.png';
import * as CRUD from './StockyCRUD';
import { getGlossaryResponse, getAdviceResponse } from './StockyGlossary';
import { STOCKY_VERSION } from '../constants/version';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chartType?: 'pie' | 'bar' | 'line' | 'balance';
  chartData?: any;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Income {
  id: string;
  productId: string;
  productName: string;
  clientId: string;
  clientName: string;
  quantity: number;
  total: number;
  date: string;
}

interface Expense {
  id: string;
  productId: string;
  productName: string;
  providerId: string;
  providerName: string;
  quantity: number;
  total: number;
  date: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface Provider {
  id: string;
  name: string;
  contact: string;
  email: string;
}

interface ConversationContext {
  lastTopic?: string;
  lastProduct?: string;
  lastProductId?: string;
  lastCategory?: string;
  lastClient?: string;
  lastClientId?: string;
  lastProvider?: string;
  lastProviderId?: string;
  lastAnalysisType?: 'sales' | 'purchases' | 'balance' | 'clients' | 'products';
  lastNumericValue?: number;
  lastDateRange?: string;
  recentTopics: string[];
  mentionedProducts: string[];
  mentionedClients: string[];
  questionCount: number;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
}

interface ConversationFlow {
  action?: 'create' | 'edit' | 'delete' | 'list';
  entity?: 'product' | 'category' | 'client' | 'provider' | 'sale' | 'purchase';
  step: number;
  data: any;
  itemToEdit?: any;
}

export function Stocky() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `¡Hola! Soy Stocky 📦 v${STOCKY_VERSION}, tu asistente inteligente de inventario y asesor de negocios.

Puedo ayudarte con:
• 📊 **Gráficas y estadísticas** de tu negocio (pregunta: "muestra gráficas")
• 📦 Información detallada de productos
• 💰 Análisis de ventas y compras
• 👥 Datos de clientes y proveedores
• 💡 Recomendaciones personalizadas
• 📈 Tendencias y proyecciones
• ✍️ Crear, editar y eliminar registros
• 📚 Conceptos de negocio y ventas
• 🎯 Consejos para mejorar tu negocio

💡 **Tip:** Pregunta "muestra gráficas" para ver todas las visualizaciones disponibles.

¿Qué te gustaría hacer?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [context, setContext] = useState<ConversationContext>({
    mentionedProducts: [],
    mentionedClients: [],
    questionCount: 0,
    conversationHistory: [],
  });
  const [flow, setFlow] = useState<ConversationFlow>({
    step: 0,
    data: {},
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadData = () => {
    const storedProducts = localStorage.getItem('ministock_products');
    if (storedProducts) setProducts(JSON.parse(storedProducts));

    const storedCategories = localStorage.getItem('ministock_categories');
    if (storedCategories) setCategories(JSON.parse(storedCategories));

    // Load sales (new format) or incomes (old format)
    const storedSales = localStorage.getItem('ministock_sales');
    const storedIncomes = localStorage.getItem('ministock_incomes');
    
    if (storedSales) {
      const sales = JSON.parse(storedSales);
      const flattenedIncomes: any[] = [];
      sales.forEach((sale: any) => {
        sale.items.forEach((item: any) => {
          flattenedIncomes.push({
            id: `${sale.id}-${item.productId}`,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.subtotal,
            clientName: sale.clientName,
            clientId: sale.clientId,
            date: sale.date,
          });
        });
      });
      setIncomes(flattenedIncomes);
    } else if (storedIncomes) {
      setIncomes(JSON.parse(storedIncomes));
    }

    // Load purchases (new format) or expenses (old format)
    const storedPurchases = localStorage.getItem('ministock_purchases');
    const storedExpenses = localStorage.getItem('ministock_expenses');
    
    if (storedPurchases) {
      const purchases = JSON.parse(storedPurchases);
      const flattenedExpenses: any[] = [];
      purchases.forEach((purchase: any) => {
        purchase.items.forEach((item: any) => {
          flattenedExpenses.push({
            id: `${purchase.id}-${item.productId}`,
            productId: item.productId,
            productName: item.productName,
            providerId: purchase.providerId,
            providerName: purchase.providerName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.subtotal,
            date: purchase.date,
          });
        });
      });
      setExpenses(flattenedExpenses);
    } else if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }

    const storedClients = localStorage.getItem('ministock_clients');
    if (storedClients) setClients(JSON.parse(storedClients));

    const storedProviders = localStorage.getItem('ministock_providers');
    if (storedProviders) setProviders(JSON.parse(storedProviders));
  };

  // Función auxiliar para extraer palabras clave
  const extractKeywords = (text: string): string[] => {
    const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'o', 'a', 'con', 'por', 'para', 'que', 'me', 'mi', 'tu', 'su', 'es', 'son', 'está', 'están', 'hay', 'tengo', 'tienes', 'tiene'];
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  };

  // Búsqueda inteligente de productos
  const findProducts = (query: string): Product[] => {
    const keywords = extractKeywords(query);
    return products.filter(p => 
      keywords.some(kw => 
        p.name.toLowerCase().includes(kw) || 
        p.description.toLowerCase().includes(kw)
      )
    );
  };

  // Análisis de tendencias
  const analyzeTrends = (): string => {
    const totalSales = incomes.reduce((sum, i) => sum + i.total, 0);
    const totalPurchases = expenses.reduce((sum, e) => sum + e.total, 0);
    const balance = totalSales - totalPurchases;
    const margin = totalSales > 0 ? ((balance / totalSales) * 100).toFixed(1) : '0';

    const productSales = new Map<string, { quantity: number; total: number }>();
    incomes.forEach(income => {
      const current = productSales.get(income.productName) || { quantity: 0, total: 0 };
      productSales.set(income.productName, {
        quantity: current.quantity + income.quantity,
        total: current.total + income.total,
      });
    });

    const sortedProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3);

    let response = `📈 **Análisis de Tendencias**

`;
    response += `💰 Ventas totales: $${totalSales.toFixed(2)}
`;
    response += `🛒 Compras totales: $${totalPurchases.toFixed(2)}
`;
    response += `${balance >= 0 ? '✅' : '⚠️'} Balance: $${balance.toFixed(2)}
`;
    response += `📊 Margen: ${margin}%
`;

    if (sortedProducts.length > 0) {
      response += `
🏆 **Productos más vendidos:**
`;
      sortedProducts.forEach(([name, data], i) => {
        response += `${i + 1}. ${name}: ${data.quantity} unidades ($${data.total.toFixed(2)})
`;
      });
    }

    return response;
  };

  // Recomendaciones inteligentes
  const getSmartRecommendations = (): string => {
    const recommendations: string[] = [];
    
    // Stock bajo
    const lowStock = products.filter(p => p.quantity < 10);
    if (lowStock.length > 0) {
      recommendations.push(`⚠️ **Productos con bajo stock (${lowStock.length}):**
${lowStock.map(p => `  • ${p.name}: ${p.quantity} unidades`).join('\n')}`);
    }

    // Sin stock
    const outOfStock = products.filter(p => p.quantity === 0);
    if (outOfStock.length > 0) {
      recommendations.push(`🚨 **Productos sin stock (${outOfStock.length}):**
${outOfStock.map(p => `  • ${p.name}`).join('\n')}`);
    }

    // Productos sin vender
    const soldProductIds = new Set(incomes.map(i => i.productId));
    const notSold = products.filter(p => !soldProductIds.has(p.id) && p.quantity > 0);
    if (notSold.length > 0) {
      recommendations.push(`💡 **Productos sin ventas aún (${notSold.length}):**
${notSold.slice(0, 5).map(p => `  • ${p.name}`).join('\n')}`);
    }

    // Análisis de rentabilidad
    const highValueProducts = products.filter(p => p.price * p.quantity > 1000);
    if (highValueProducts.length > 0) {
      recommendations.push(`💎 **Productos de alto valor en inventario:**
${highValueProducts.slice(0, 3).map(p => `  • ${p.name}: $${(p.price * p.quantity).toFixed(2)}`).join('\n')}`);
    }

    if (recommendations.length === 0) {
      return '✅ ¡Tu inventario está en excelente estado! No tengo recomendaciones críticas por el momento.';
    }

    return recommendations.join('\n\n');
  };

  // Generador de respuestas inteligente
  const generateResponse = (userMessage: string): { text: string; chartType?: 'pie' | 'bar' | 'line' | 'balance'; chartData?: any } => {
    const lower = userMessage.toLowerCase();
    const keywords = extractKeywords(userMessage);
    
    // Actualizar contexto
    setContext(prev => ({
      ...prev,
      questionCount: prev.questionCount + 1,
      conversationHistory: [...prev.conversationHistory, { role: 'user', content: userMessage, timestamp: new Date() }],
    }));

    // === REFERENCIAS CONTEXTUALES (MEMORIA) ===
    // Detectar pronombres y referencias a mensajes anteriores
    const isContextReference = /(él|el|ella|esa|ese|esto|eso|esta|este|su|sus|cuánto|cuanto|cuánta|cuanta|cuántos|cuantos|cuántas|cuantas|qué|que|cómo|como|dónde|donde|por qué|porque|^y\s|^pero\s)/i.test(lower);
    
    if (isContextReference && context.conversationHistory.length > 1) {
      // Referencias a clientes
      if (context.lastClient && (/(cuánto|cuanto|cuánta|cuanta|cuántos|cuantos|ha comprado|compras|gasta|gastado|productos|teléfono|telefono|email|correo|contacto)/i.test(lower))) {
        const client = clients.find(c => c.name === context.lastClient);
        const clientIncomes = incomes.filter(i => i.clientName === context.lastClient);
        
        // ¿Cuánto ha gastado/comprado?
        if (/(cuánto|cuanto|total|gastado|comprado)/i.test(lower)) {
          const total = clientIncomes.reduce((sum, i) => sum + i.total, 0);
          setContext(prev => ({ ...prev, lastNumericValue: total }));
          return { text: `💰 **${context.lastClient}** ha gastado un total de **$${total.toFixed(2)}** en ${clientIncomes.length} compra(s).` };
        }
        
        // ¿Cuántas compras ha hecho?
        if (/(cuántas|cuantas|compras|veces|ha comprado)/i.test(lower)) {
          const totalUnits = clientIncomes.reduce((sum, i) => sum + i.quantity, 0);
          return { text: `📊 **${context.lastClient}** ha realizado **${clientIncomes.length} compra(s)** con un total de **${totalUnits} unidad(es)**.` };
        }
        
        // ¿Qué productos compra?
        if (/(qué|que|cuáles|cuales|productos|items|artículos|articulos)/i.test(lower)) {
          const productCounts = new Map<string, number>();
          clientIncomes.forEach(income => {
            productCounts.set(income.productName, (productCounts.get(income.productName) || 0) + income.quantity);
          });
          const sortedProducts = Array.from(productCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
          
          return { text: `📦 **Productos comprados por ${context.lastClient}:**\n\n${sortedProducts.map(([name, qty], i) => `${i + 1}. ${name}: ${qty} unidad(es)`).join('\n')}` };
        }
        
        // Información de contacto
        if (/(teléfono|telefono|email|correo|contacto)/i.test(lower) && client) {
          return { text: `📞 **Contacto de ${context.lastClient}:**\n\n• Teléfono: ${client.phone || 'No registrado'}\n• Email: ${client.email || 'No registrado'}` };
        }
      }
      
      // Referencias a productos
      if (context.lastProduct && (/(cuánto|cuanto|cuánta|cuanta|stock|precio|cuesta|vale|cantidad|hay|quedan|descripción|descripcion|categoría|categoria)/i.test(lower))) {
        const product = products.find(p => p.name === context.lastProduct);
        
        if (!product) {
          return { text: `❌ No encuentro información sobre "${context.lastProduct}" en el inventario actual.` };
        }
        
        // ¿Cuánto cuesta/vale?
        if (/(cuánto|cuanto|precio|cuesta|vale)/i.test(lower)) {
          setContext(prev => ({ ...prev, lastNumericValue: product.price }));
          return { text: `💵 **${product.name}** cuesta **$${product.price.toFixed(2)}** por unidad.` };
        }
        
        // ¿Cuánto stock hay?
        if (/(cuánto|cuanto|cuánta|cuanta|stock|hay|quedan|cantidad|tengo)/i.test(lower)) {
          return { text: `📦 **${product.name}** tiene **${product.quantity} unidad(es)** en stock.\n\n${product.quantity === 0 ? '⚠️ Producto sin stock' : product.quantity < 10 ? '⚠️ Stock bajo - considera reabastecer' : '✅ Stock adecuado'}` };
        }
        
        // Descripción
        if (/(descripción|descripcion|qué es|que es|de qué|de que)/i.test(lower)) {
          return { text: `📝 **${product.name}**\n\n${product.description || 'Sin descripción disponible'}\n\n💵 Precio: $${product.price.toFixed(2)}\n📦 Stock: ${product.quantity} unidades` };
        }
        
        // Categoría
        if (/(categoría|categoria|tipo|clasificación|clasificacion)/i.test(lower)) {
          const category = categories.find(c => c.id === product.categoryId);
          return { text: `📁 **${product.name}** pertenece a la categoría: **${category?.name || 'Sin categoría'}**` };
        }
      }
      
      // Referencias a análisis anteriores
      if (context.lastAnalysisType) {
        if (/(más|mas|detalle|detalles|información|informacion|completo|amplia)/i.test(lower)) {
          if (context.lastAnalysisType === 'clients') {
            // Redirigir a análisis completo de clientes
            const clientSales = new Map<string, { count: number; total: number }>();
            incomes.forEach(income => {
              const current = clientSales.get(income.clientName) || { count: 0, total: 0 };
              clientSales.set(income.clientName, {
                count: current.count + 1,
                total: current.total + income.total,
              });
            });
            
            const topClients = Array.from(clientSales.entries())
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 10);
            
            return { text: `👥 **Análisis Detallado de Clientes**\n\n${topClients.map(([name, data], i) => {
              const avg = data.total / data.count;
              return `${i + 1}. **${name}**\n   • Compras: ${data.count}\n   • Total: $${data.total.toFixed(2)}\n   • Promedio: $${avg.toFixed(2)}`;
            }).join('\n\n')}` };
          }
        }
      }
      
      // Referencias numéricas del contexto
      if (context.lastNumericValue && (/(cómo|como|por qué|porque|es mucho|es poco|está bien|esta bien)/i.test(lower))) {
        return { text: `💡 Basándome en el valor de **$${context.lastNumericValue.toFixed(2)}** que mencioné antes, puedo decir que:\n\n${context.lastNumericValue > 1000 ? '✅ Es un valor significativo para tu negocio.' : context.lastNumericValue > 100 ? '📊 Es un valor moderado.' : '⚠️ Es un valor bajo, considera estrategias para incrementarlo.'}` };
      }
    }

    // === GLOSARIO Y ASESORAMIENTO DE NEGOCIOS ===
    // Intentar responder con el glosario
    if (/(qué es|que es|define|definición|definicion|significa|significado|explica|explicame|explícame)/i.test(lower)) {
      const glossaryResponse = getGlossaryResponse(lower);
      if (glossaryResponse) {
        return { text: glossaryResponse };
      }
    }

    // Intentar responder con consejos y mejores prácticas
    if (/(cómo|como|consejos|tips|recomiendas|sugieres|ayuda.*para|mejorar|aumentar|optimizar)/i.test(lower)) {
      const adviceResponse = getAdviceResponse(lower);
      if (adviceResponse) {
        return { text: adviceResponse };
      }
    }

    // === OPERACIONES CRUD ===
    // Detectar intención de CREAR
    if (/(crear|agregar|añadir|nuevo|nueva|registrar|agregar|agrega|crea|añade|registra)/i.test(lower)) {
      // Crear PRODUCTO
      if (/(producto|artículo|articulo|item)/i.test(lower)) {
        return { text: `✍️ **Crear Nuevo Producto**

Para crear un producto, por favor ve a la sección "Productos" y haz clic en el botón "Agregar Producto".

Necesitarás proporcionar:
• Nombre del producto
• Descripción
• Precio
• Cantidad inicial
• Categoría

¿Necesitas ayuda con algo más?` };
      }
      
      // Crear CATEGORÍA
      if (/(categoría|categoria|clasificación|clasificacion)/i.test(lower)) {
        return { text: `✍️ **Crear Nueva Categoría**

Para crear una categoría, ve a la sección "Productos" y haz clic en "Gestionar Categorías".

Necesitarás proporcionar:
• Nombre de la categoría
• Descripción

Las categorías te ayudan a organizar mejor tus productos. Por ejemplo: Electrónica, Ropa, Alimentos, etc.

¿Quieres saber algo más?` };
      }
      
      // Crear CLIENTE
      if (/(cliente|comprador)/i.test(lower)) {
        return { text: `✍️ **Crear Nuevo Cliente**

Para registrar un cliente, ve a la sección "Clientes" y haz clic en "Agregar Cliente".

Necesitarás proporcionar:
• Nombre del cliente
• Teléfono
• Email

Mantener un registro de clientes te permite hacer seguimiento de ventas y estadísticas.

¿Necesitas ayuda con algo más?` };
      }
      
      // Crear PROVEEDOR
      if (/(proveedor|supplier)/i.test(lower)) {
        return { text: `✍️ **Crear Nuevo Proveedor**

Para registrar un proveedor, ve a la sección "Proveedores" y haz clic en "Agregar Proveedor".

Necesitarás proporcionar:
• Nombre del proveedor
• Contacto
• Email

Los proveedores son importantes para el registro de compras.

¿Quieres saber algo más?` };
      }
      
      // Crear VENTA/INGRESO
      if (/(venta|ingreso|vender)/i.test(lower)) {
        return { text: `✍️ **Registrar Nueva Venta**

Para registrar una venta, ve a la sección "Ingresos/Ventas" y haz clic en "Registrar Venta".

Podrás:
• Seleccionar uno o múltiples productos
• Elegir el cliente
• Definir cantidades
• El sistema calculará automáticamente el total
• El stock se actualizará automáticamente

💡 **Tip:** Las ventas reducen el stock automáticamente.

¿Necesitas ayuda con algo más?` };
      }
      
      // Crear COMPRA/EGRESO
      if (/(compra|egreso|gasto|adquisición|adquisicion)/i.test(lower)) {
        return { text: `✍️ **Registrar Nueva Compra**

Para registrar una compra, ve a la sección "Egresos/Compras" y haz clic en "Registrar Compra".

Podrás:
• Seleccionar uno o múltiples productos
• Elegir el proveedor
• Definir cantidades
• El sistema calculará automáticamente el total
• El stock se actualizará automáticamente

💡 **Tip:** Las compras aumentan el stock automáticamente.

¿Quieres saber algo más?` };
      }
      
      // Respuesta genérica para crear
      return { text: `✍️ **Crear/Agregar Registros**

¿Qué deseas crear?

📦 **Productos:** "Crear producto"
📁 **Categorías:** "Crear categoría"
👥 **Clientes:** "Crear cliente"
🏭 **Proveedores:** "Crear proveedor"
💰 **Ventas:** "Crear venta"
🛒 **Compras:** "Crear compra"

Especifica qué quieres crear y te guiaré paso a paso.` };
    }
    
    // Detectar intención de EDITAR/MODIFICAR
    if (/(editar|modificar|actualizar|cambiar|cambio|modifica|actualiza)/i.test(lower)) {
      // Editar PRODUCTO
      if (/(producto|artículo|articulo|item)/i.test(lower)) {
        return { text: `✏️ **Editar Producto**

Para editar un producto:
1. Ve a la sección "Productos"
2. Busca el producto que quieres modificar
3. Haz clic en el botón de editar (lápiz)
4. Modifica los campos que necesites
5. Guarda los cambios

Puedes cambiar: nombre, descripción, precio, cantidad y categoría.

¿Necesitas ayuda con algo más?` };
      }
      
      // Editar CLIENTE
      if (/(cliente|comprador)/i.test(lower)) {
        return { text: `✏️ **Editar Cliente**

Para editar un cliente:
1. Ve a la sección "Clientes"
2. Busca el cliente en la lista
3. Haz clic en el botón de editar (lápiz)
4. Modifica los campos necesarios
5. Guarda los cambios

Puedes actualizar: nombre, teléfono y email.

¿Quieres saber algo más?` };
      }
      
      // Editar PROVEEDOR
      if (/(proveedor|supplier)/i.test(lower)) {
        return { text: `✏️ **Editar Proveedor**

Para editar un proveedor:
1. Ve a la sección "Proveedores"
2. Busca el proveedor en la lista
3. Haz clic en el botón de editar (lápiz)
4. Modifica los campos necesarios
5. Guarda los cambios

Puedes actualizar: nombre, contacto y email.

¿Necesitas ayuda con algo más?` };
      }
      
      return { text: `✏️ **Editar Registros**

¿Qué deseas editar?

📦 **Productos:** "Editar producto"
👥 **Clientes:** "Editar cliente"
🏭 **Proveedores:** "Editar proveedor"

Ve a la sección correspondiente y usa el botón de editar (✏️) en el registro que quieras modificar.` };
    }
    
    // Detectar intención de ELIMINAR/BORRAR
    if (/(eliminar|borrar|quitar|remover|delete|elimina|borra|quita|remueve)/i.test(lower)) {
      // Eliminar PRODUCTO
      if (/(producto|artículo|articulo|item)/i.test(lower)) {
        return { text: `🗑️ **Eliminar Producto**

Para eliminar un producto:
1. Ve a la sección "Productos"
2. Busca el producto que quieres eliminar
3. Haz clic en el botón de eliminar (🗑️)
4. Confirma la eliminación

⚠️ **Advertencia:** Esta acción no se puede deshacer. Asegúrate de que realmente quieres eliminar el producto.

¿Necesitas ayuda con algo más?` };
      }
      
      // Eliminar CLIENTE
      if (/(cliente|comprador)/i.test(lower)) {
        return { text: `🗑️ **Eliminar Cliente**

Para eliminar un cliente:
1. Ve a la sección "Clientes"
2. Busca el cliente en la lista
3. Haz clic en el botón de eliminar (🗑️)
4. Confirma la eliminación

⚠️ **Advertencia:** Esta acción no se puede deshacer.

¿Quieres saber algo más?` };
      }
      
      // Eliminar PROVEEDOR
      if (/(proveedor|supplier)/i.test(lower)) {
        return { text: `🗑️ **Eliminar Proveedor**

Para eliminar un proveedor:
1. Ve a la sección "Proveedores"
2. Busca el proveedor en la lista
3. Haz clic en el botón de eliminar (🗑️)
4. Confirma la eliminación

⚠️ **Advertencia:** Esta acción no se puede deshacer.

¿Necesitas ayuda con algo más?` };
      }
      
      return { text: `🗑️ **Eliminar Registros**

¿Qué deseas eliminar?

📦 **Productos:** "Eliminar producto"
👥 **Clientes:** "Eliminar cliente"
🏭 **Proveedores:** "Eliminar proveedor"

⚠️ **Importante:** Las eliminaciones son permanentes. Ve a la sección correspondiente y usa el botón de eliminar (🗑️).` };
    }
    
    // Detectar intención de VER/LISTAR
    if (/(listar|mostrar|ver|lista|muestra|muéstrame|muestrame|dime)/i.test(lower)) {
      // Ya hay lógica más abajo para estas operaciones
      // pero agregamos un caso catch-all aquí
      if (/(todo|todos|todas|qué tengo|que tengo)/i.test(lower)) {
        return { text: `📋 **Ver Información**

¿Qué quieres ver?

📦 **Productos:** "Muestra productos" o "Lista de productos"
👥 **Clientes:** "Muestra clientes" o "Lista de clientes"
🏭 **Proveedores:** "Muestra proveedores"
💰 **Ventas:** "Muestra ventas"
🛒 **Compras:** "Muestra compras"
📊 **Gráficas y Estadísticas:** "Muestra gráficas" o "Análisis general"

💡 ¡Las gráficas están integradas conmigo! Pregunta "muestra gráficas" para verlas.` };
      }
    }

    // === SOLICITUD DE GRÁFICAS ===
    if (/(gráfica|grafica|gráfico|grafico|chart|visualiza|muestra.*gráfica|muestra.*grafica|dibuja|estadística|estadistica)/i.test(lower)) {
      // Si es una pregunta genérica sobre gráficas, mostrar menú de opciones
      if (!/(balance|distribución|distribucion|ingresos.*egresos|pie|producto|vendido|top|mejor.*producto|bar|venta.*tiempo|histórico|historico|line|tendencia)/i.test(lower)) {
        return { text: `📊 **Gráficas y Estadísticas Disponibles**

¡Puedo mostrarte diferentes visualizaciones de tus datos! Elige la que necesites:

📈 **Gráficas de Productos:**
• "Muestra gráfica de productos más vendidos"
• "Gráfica de productos" o "Top productos"

📉 **Gráficas de Balance:**
• "Muestra gráfica de balance"
• "Gráfica de ingresos vs egresos"
• "Distribución de ingresos y egresos"

📊 **Gráficas de Tendencias:**
• "Muestra gráfica de ventas en el tiempo"
• "Tendencia de ventas"
• "Historial de ventas"

💡 **Tip:** También puedo darte análisis con:
• "Dame un resumen general"
• "Análisis de tendencias"
• "Recomendaciones"

¿Qué gráfica te gustaría ver?` };
      }
      
      // Gráfica de balance/pie
      if (/(balance|distribución|distribucion|ingresos.*egresos|pie)/i.test(lower)) {
        const totalSales = incomes.reduce((sum, i) => sum + i.total, 0);
        const totalPurchases = expenses.reduce((sum, e) => sum + e.total, 0);
        
        if (totalSales === 0 && totalPurchases === 0) {
          return { text: '📊 No hay datos suficientes para generar la gráfica de balance. Registra algunas ventas y compras primero.' };
        }
        
        const pieData = [
          { name: 'Ingresos', value: totalSales, color: '#00FFFF' },
          { name: 'Egresos', value: totalPurchases, color: '#0047AB' },
        ];
        
        return {
          text: `📊 **Gráfica de Distribución: Ingresos vs Egresos**\n\nIngresos: $${totalSales.toFixed(2)}\nEgresos: $${totalPurchases.toFixed(2)}\nBalance: $${(totalSales - totalPurchases).toFixed(2)}`,
          chartType: 'pie',
          chartData: pieData,
        };
      }
      
      // Gráfica de productos más vendidos
      if (/(producto|vendido|top|mejor.*producto|bar)/i.test(lower)) {
        const productSales: { [key: string]: number } = {};
        incomes.forEach(income => {
          if (!productSales[income.productName]) {
            productSales[income.productName] = 0;
          }
          productSales[income.productName] += income.total;
        });

        const topProductsData = Object.entries(productSales)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, total]) => ({ name, total }));
        
        if (topProductsData.length === 0) {
          return { text: '📊 No hay ventas registradas para generar la gráfica de productos.' };
        }
        
        return {
          text: `📊 **Gráfica de Barras: Top 5 Productos Más Vendidos**\n\n${topProductsData.map((p, i) => `${i + 1}. ${p.name}: $${p.total.toFixed(2)}`).join('\n')}`,
          chartType: 'bar',
          chartData: topProductsData,
        };
      }
      
      // Gráfica de tendencia mensual
      if (/(tendencia|mensual|evolución|evolucion|line|tiempo)/i.test(lower)) {
        const monthlyData: { [key: string]: { incomes: number; expenses: number } } = {};
        
        incomes.forEach(income => {
          const month = new Date(income.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          if (!monthlyData[month]) {
            monthlyData[month] = { incomes: 0, expenses: 0 };
          }
          monthlyData[month].incomes += income.total;
        });

        expenses.forEach(expense => {
          const month = new Date(expense.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          if (!monthlyData[month]) {
            monthlyData[month] = { incomes: 0, expenses: 0 };
          }
          monthlyData[month].expenses += expense.total;
        });

        const lineData = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          ingresos: data.incomes,
          egresos: data.expenses,
          balance: data.incomes - data.expenses,
        }));
        
        if (lineData.length === 0) {
          return { text: '📊 No hay datos suficientes para generar la gráfica de tendencias. Registra algunas transacciones primero.' };
        }
        
        return {
          text: `📊 **Gráfica de Tendencia: Evolución Mensual**\n\nMostrando ${lineData.length} periodo(s) de datos`,
          chartType: 'line',
          chartData: lineData,
        };
      }
      
      // Gráfica por defecto (balance)
      const totalSales = incomes.reduce((sum, i) => sum + i.total, 0);
      const totalPurchases = expenses.reduce((sum, e) => sum + e.total, 0);
      const balance = totalSales - totalPurchases;
      
      return {
        text: `📊 **Análisis Financiero Visual**\n\nPuedo mostrarte:\n• Gráfica de balance (pie)\n• Gráfica de productos más vendidos (barras)\n• Gráfica de tendencia mensual (líneas)\n\nSolo dime cuál quieres ver. Por ejemplo:\n"Muestra la gráfica de balance"\n"Gráfica de productos más vendidos"\n"Tendencia mensual"`,
        chartType: 'balance',
        chartData: {
          totalSales,
          totalPurchases,
          balance,
        },
      };
    }

    // === SALUDOS Y DESPEDIDAS ===
    if (/^(hola|hey|buenas|buenos|buen|qué tal|que tal|saludos)/i.test(lower)) {
      const greetings = [
        '¡Hola! 👋 ¿En qué puedo ayudarte con tu inventario hoy?',
        '¡Hey! 😊 Estoy listo para ayudarte. ¿Qué necesitas saber?',
        '¡Buenas! 📦 ¿Qué información necesitas de tu negocio?',
      ];
      return { text: greetings[Math.floor(Math.random() * greetings.length)] };
    }

    if (/(gracias|gracias|thank|thx|excelente|perfecto|genial)/i.test(lower)) {
      const thanks = [
        '¡De nada! 💙 Estoy aquí cuando me necesites.',
        '¡Un placer ayudarte! 😊 ¿Algo más?',
        '¡Para eso estoy! 📦 Si necesitas más información, solo pregunta.',
      ];
      return { text: thanks[Math.floor(Math.random() * thanks.length)] };
    }

    if (/(adiós|adios|chao|hasta luego|nos vemos|bye)/i.test(lower)) {
      return { text: '¡Hasta pronto! 👋 Que tengas un excelente día gestionando tu inventario.' };
    }

    // === CONSULTAS SOBRE PRODUCTOS ESPECÍFICOS ===
    const foundProducts = findProducts(userMessage);
    if (foundProducts.length > 0 && (lower.includes('precio') || lower.includes('cuánto cuesta') || lower.includes('cuanto cuesta'))) {
      const product = foundProducts[0];
      setContext(prev => ({ ...prev, lastProduct: product.name, lastProductId: product.id }));
      return { text: `💵 **${product.name}**\n\nPrecio: $${product.price.toFixed(2)}\nStock: ${product.quantity} unidades\nValor total: $${(product.price * product.quantity).toFixed(2)}\n${product.description ? `\n📝 ${product.description}` : ''}` };
    }

    if (foundProducts.length > 0 && (lower.includes('stock') || lower.includes('cantidad') || lower.includes('cuántas') || lower.includes('cuantas'))) {
      const product = foundProducts[0];
      setContext(prev => ({ ...prev, lastProduct: product.name, lastProductId: product.id }));
      return { text: `📦 **${product.name}**\n\nStock actual: ${product.quantity} unidades\nPrecio unitario: $${product.price.toFixed(2)}\nValor en inventario: $${(product.price * product.quantity).toFixed(2)}\n\n${product.quantity === 0 ? '⚠️ Producto sin stock' : product.quantity < 10 ? '⚠️ Stock bajo - considera reabastecer' : '✅ Stock adecuado'}` };
    }

    // === ANÁLISIS COMPLETO ===
    if (/(análisis|analisis|resumen|overview|dashboard|general)/i.test(lower)) {
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
      const totalSales = incomes.reduce((sum, i) => sum + i.total, 0);
      const totalPurchases = expenses.reduce((sum, e) => sum + e.total, 0);
      
      return { text: `📊 **Resumen Completo del Negocio**\n\n` +
        `📦 **Inventario:**\n` +
        `  • ${products.length} productos diferentes\n` +
        `  • ${totalItems} unidades totales\n` +
        `  • Valor: $${totalValue.toFixed(2)}\n\n` +
        `💰 **Financiero:**\n` +
        `  • Ventas: $${totalSales.toFixed(2)}\n` +
        `  • Compras: $${totalPurchases.toFixed(2)}\n` +
        `  • Balance: $${(totalSales - totalPurchases).toFixed(2)}\n\n` +
        `👥 **Contactos:**\n` +
        `  • ${clients.length} clientes\n` +
        `  • ${providers.length} proveedores\n\n` +
        `📁 **Categorías:** ${categories.length}` };
    }

    // === TENDENCIAS ===
    if (/(tendencia|trend|evolución|evolucion|comportamiento)/i.test(lower)) {
      return { text: analyzeTrends() };
    }

    // === RECOMENDACIONES ===
    if (/(recomend|suger|consejo|qué debo|que debo|ayuda)/i.test(lower)) {
      return { text: getSmartRecommendations() };
    }

    // === VENTAS ===
    if (/(venta|vendido|ingreso)/i.test(lower)) {
      const totalSales = incomes.reduce((sum, i) => sum + i.total, 0);
      const totalUnits = incomes.reduce((sum, i) => sum + i.quantity, 0);
      
      if (lower.includes('hoy') || lower.includes('día')) {
        const today = new Date().toDateString();
        const todaySales = incomes.filter(i => new Date(i.date).toDateString() === today);
        const todayTotal = todaySales.reduce((sum, i) => sum + i.total, 0);
        return { text: `📅 **Ventas de hoy:**\n\n${todaySales.length} ventas\n${todaySales.reduce((sum, i) => sum + i.quantity, 0)} unidades\nTotal: $${todayTotal.toFixed(2)}` };
      }

      if (lower.includes('mes')) {
        const thisMonth = new Date().getMonth();
        const monthSales = incomes.filter(i => new Date(i.date).getMonth() === thisMonth);
        const monthTotal = monthSales.reduce((sum, i) => sum + i.total, 0);
        return { text: `📅 **Ventas del mes:**\n\n${monthSales.length} ventas\n${monthSales.reduce((sum, i) => sum + i.quantity, 0)} unidades\nTotal: $${monthTotal.toFixed(2)}` };
      }

      return { text: `💰 **Resumen de Ventas**\n\n` +
        `Total de ventas: ${incomes.length}\n` +
        `Unidades vendidas: ${totalUnits}\n` +
        `Ingresos totales: $${totalSales.toFixed(2)}\n` +
        `Promedio por venta: $${incomes.length > 0 ? (totalSales / incomes.length).toFixed(2) : '0.00'}` };
    }

    // === COMPRAS ===
    if (/(compra|adquisición|adquisicion|egreso|gasto)/i.test(lower)) {
      const totalPurchases = expenses.reduce((sum, e) => sum + e.total, 0);
      const totalUnits = expenses.reduce((sum, e) => sum + e.quantity, 0);
      
      return { text: `🛒 **Resumen de Compras**\n\n` +
        `Total de compras: ${expenses.length}\n` +
        `Unidades compradas: ${totalUnits}\n` +
        `Gastos totales: $${totalPurchases.toFixed(2)}\n` +
        `Promedio por compra: $${expenses.length > 0 ? (totalPurchases / expenses.length).toFixed(2) : '0.00'}` };
    }

    // === CLIENTES ===
    if (/(cliente|comprador)/i.test(lower)) {
      // Estadísticas detalladas del mejor cliente
      if (/(mejor|más|mas|top|estadística|estadistica|quien.*compra|quién.*compra)/i.test(lower)) {
        const clientSales = new Map<string, { 
          count: number; 
          total: number; 
          clientId: string;
          products: Map<string, number>;
          lastPurchaseDate: Date;
        }>();
        
        incomes.forEach(income => {
          const current = clientSales.get(income.clientName) || { 
            count: 0, 
            total: 0, 
            clientId: income.clientId,
            products: new Map(),
            lastPurchaseDate: new Date(0),
          };
          
          const productCount = current.products.get(income.productName) || 0;
          current.products.set(income.productName, productCount + income.quantity);
          
          const purchaseDate = new Date(income.date);
          if (purchaseDate > current.lastPurchaseDate) {
            current.lastPurchaseDate = purchaseDate;
          }
          
          clientSales.set(income.clientName, {
            clientId: income.clientId,
            count: current.count + 1,
            total: current.total + income.total,
            products: current.products,
            lastPurchaseDate: current.lastPurchaseDate,
          });
        });
        
        if (clientSales.size === 0) {
          return { text: '📊 Aún no tienes ventas registradas para analizar clientes.' };
        }
        
        const sortedClients = Array.from(clientSales.entries())
          .sort((a, b) => b[1].total - a[1].total);
        
        // Estadística detallada del mejor cliente
        if (/(quien|quién|cuál|cual|mejor cliente|cliente.*más|cliente.*mas)/i.test(lower) && sortedClients.length > 0) {
          const [bestClientName, bestClientData] = sortedClients[0];
          const client = clients.find(c => c.id === bestClientData.clientId);
          
          // Productos favoritos del cliente
          const favoriteProducts = Array.from(bestClientData.products.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
          
          const avgPurchase = bestClientData.total / bestClientData.count;
          const daysSinceLastPurchase = Math.floor(
            (new Date().getTime() - bestClientData.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          // Guardar en contexto
          setContext(prev => ({ 
            ...prev, 
            lastClient: bestClientName, 
            lastClientId: bestClientData.clientId,
            lastAnalysisType: 'clients',
            lastNumericValue: bestClientData.total
          }));
          
          return { text: `🏆 **Mejor Cliente: ${bestClientName}**

📊 **Estadísticas Generales:**
• Total gastado: $${bestClientData.total.toFixed(2)}
• Número de compras: ${bestClientData.count}
• Promedio por compra: $${avgPurchase.toFixed(2)}
• Última compra: hace ${daysSinceLastPurchase} día(s)

📦 **Productos Favoritos:**
${favoriteProducts.map(([product, qty], i) => `${i + 1}. ${product} (${qty} unidades)`).join('\n')}

📞 **Información de Contacto:**
${client ? `• Teléfono: ${client.phone || 'No registrado'}
• Email: ${client.email || 'No registrado'}` : '• Información no disponible'}

💡 **Recomendación:** 
${daysSinceLastPurchase > 30 ? '⚠️ Este cliente no ha comprado en más de un mes. Considera contactarlo con una promoción.' : '✅ Cliente activo. Mantén la buena relación.'}` };
        }
        
        // Top clientes
        const topClients = sortedClients.slice(0, 10);
        
        return { text: `👥 **Top ${topClients.length} Mejores Clientes**

${topClients.map(([name, data], i) => {
  const avg = data.total / data.count;
  return `${i + 1}. **${name}**
   • Compras: ${data.count}
   • Total: $${data.total.toFixed(2)}
   • Promedio: $${avg.toFixed(2)}`;
}).join('\n\n')}

💡 **Tip:** Pregunta "¿quién es mi mejor cliente?" para ver estadísticas detalladas.` };
      }
      
      // Estadísticas generales de todos los clientes
      if (/(todos|estadísticas|estadisticas|análisis|analisis|resumen)/i.test(lower)) {
        if (clients.length === 0) {
          return { text: '👥 No tienes clientes registrados aún.' };
        }
        
        const clientSales = new Map<string, { count: number; total: number }>();
        incomes.forEach(income => {
          const current = clientSales.get(income.clientName) || { count: 0, total: 0 };
          clientSales.set(income.clientName, {
            count: current.count + 1,
            total: current.total + income.total,
          });
        });
        
        const clientsWithPurchases = clientSales.size;
        const clientsWithoutPurchases = clients.length - clientsWithPurchases;
        const totalRevenue = Array.from(clientSales.values()).reduce((sum, c) => sum + c.total, 0);
        const avgRevenuePerClient = clientsWithPurchases > 0 ? totalRevenue / clientsWithPurchases : 0;
        
        return { text: `👥 **Análisis Completo de Clientes**

📊 **Resumen General:**
• Total de clientes: ${clients.length}
• Clientes activos: ${clientsWithPurchases}
• Clientes sin compras: ${clientsWithoutPurchases}

💰 **Ingresos por Clientes:**
• Ingresos totales: $${totalRevenue.toFixed(2)}
• Promedio por cliente: $${avgRevenuePerClient.toFixed(2)}

🏆 **Top 3 Clientes:**
${Array.from(clientSales.entries())
  .sort((a, b) => b[1].total - a[1].total)
  .slice(0, 3)
  .map(([name, data], i) => `${i + 1}. ${name}: $${data.total.toFixed(2)} (${data.count} compras)`)
  .join('\n')}

💡 **Recomendación:**
${clientsWithoutPurchases > 0 ? `⚠️ Tienes ${clientsWithoutPurchases} cliente(s) que aún no han comprado. ¡Contactalos!` : '✅ Todos tus clientes han realizado compras.'}` };
      }
      
      return { text: `👥 **Clientes Registrados:** ${clients.length}

${clients.length > 0 ? clients.slice(0, 5).map(c => `• ${c.name}${c.phone ? ` - ${c.phone}` : ''}`).join('\n') : 'No hay clientes registrados aún.'}

${clients.length > 5 ? '\n...y más.' : ''}

💡 **Consultas disponibles:**
• "¿Quién es mi mejor cliente?"
• "Estadísticas de clientes"
• "Top clientes"` };
    }

    // === PROVEEDORES ===
    if (/(proveedor|supplier)/i.test(lower)) {
      return { text: `🏭 **Proveedores Registrados:** ${providers.length}\n\n` +
        `${providers.length > 0 ? providers.slice(0, 5).map(p => `• ${p.name}${p.contact ? ` - ${p.contact}` : ''}`).join('\n') : 'No hay proveedores registrados aún.'}` };
    }

    // === CATEGORÍAS ===
    if (/(categoría|categoria|clasificación|clasificacion)/i.test(lower)) {
      if (categories.length === 0) {
        return { text: '📁 No tienes categorías creadas aún. Te recomiendo crear categorías para organizar mejor tus productos.' };
      }
      
      const categoryStats = categories.map(cat => {
        const catProducts = products.filter(p => p.categoryId === cat.id);
        const totalValue = catProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        return {
          name: cat.name,
          count: catProducts.length,
          value: totalValue,
        };
      }).sort((a, b) => b.value - a.value);

      return { text: `📁 **Categorías (${categories.length}):**\n\n` +
        categoryStats.map(cat => 
          `• ${cat.name}: ${cat.count} productos ($${cat.value.toFixed(2)})`
        ).join('\n') };
    }

    // === STOCK ===
    if (/(stock|inventario|disponible)/i.test(lower) && (lower.includes('bajo') || lower.includes('poco'))) {
      const lowStock = products.filter(p => p.quantity < 10 && p.quantity > 0);
      const outOfStock = products.filter(p => p.quantity === 0);
      
      let response = '';
      if (outOfStock.length > 0) {
        response += `🚨 **Sin stock (${outOfStock.length}):**\n${outOfStock.map(p => `  • ${p.name}`).join('\n')}\n\n`;
      }
      if (lowStock.length > 0) {
        response += `⚠️ **Stock bajo (${lowStock.length}):**\n${lowStock.map(p => `  • ${p.name}: ${p.quantity} unidades`).join('\n')}`;
      }
      
      return { text: response || '✅ No hay productos con stock bajo. ¡Todo está bien!' };
    }

    // === PRODUCTOS MÁS CAROS/BARATOS ===
    if (/(caro|costoso|barato|económico|economico)/i.test(lower)) {
      if (products.length === 0) {
        return { text: '📦 No hay productos registrados aún.' };
      }
      
      const isCaro = lower.includes('caro') || lower.includes('costoso');
      const sorted = [...products].sort((a, b) => isCaro ? b.price - a.price : a.price - b.price);
      const top = sorted.slice(0, 5);
      
      return { text: `${isCaro ? '💎' : '💵'} **Productos más ${isCaro ? 'caros' : 'económicos'}:**\n\n` +
        top.map((p, i) => `${i + 1}. ${p.name}: $${p.price.toFixed(2)} (${p.quantity} en stock)`).join('\n') };
    }

    // === MEJOR/PEOR PRODUCTO ===
    if (/(mejor|top|peor|menos)/i.test(lower) && /(producto|vendido)/i.test(lower)) {
      const productSales = new Map<string, { quantity: number; total: number; name: string }>();
      incomes.forEach(income => {
        const current = productSales.get(income.productId) || { quantity: 0, total: 0, name: income.productName };
        productSales.set(income.productId, {
          name: income.productName,
          quantity: current.quantity + income.quantity,
          total: current.total + income.total,
        });
      });

      if (productSales.size === 0) {
        return { text: '📊 Aún no hay ventas registradas para analizar.' };
      }

      const isBest = lower.includes('mejor') || lower.includes('top');
      const sorted = Array.from(productSales.values()).sort((a, b) => 
        isBest ? b.total - a.total : a.total - b.total
      );
      const top = sorted.slice(0, 5);

      return { text: `${isBest ? '🏆' : '📉'} **${isBest ? 'Mejores' : 'Productos con menos ventas'}:**\n\n` +
        top.map((p, i) => `${i + 1}. ${p.name}: ${p.quantity} unidades ($${p.total.toFixed(2)})`).join('\n') };
    }

    // === PRODUCTOS ===
    if (/(producto|artículo|articulo|item)/i.test(lower)) {
      if (lower.includes('cuántos') || lower.includes('cuantos') || lower.includes('total')) {
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
        return { text: `📦 **Productos:** ${products.length}\n\n` +
          `Total de unidades: ${totalUnits}\n` +
          `Valor total del inventario: $${totalValue.toFixed(2)}\n` +
          `Valor promedio por producto: $${products.length > 0 ? (totalValue / products.length).toFixed(2) : '0.00'}` };
      }
      
      if (products.length > 0) {
        return { text: `📦 Tienes ${products.length} productos registrados. Algunos son:\n\n` +
          products.slice(0, 5).map(p => `• ${p.name} - $${p.price.toFixed(2)} (${p.quantity} unidades)`).join('\n') +
          (products.length > 5 ? '\n\n...y más. ¿Quieres saber algo específico?' : '') };
      }
    }

    // === BALANCE/GANANCIAS ===
    if (/(balance|ganancia|utilidad|beneficio|pérdida|perdida|rentabilidad)/i.test(lower)) {
      const totalSales = incomes.reduce((sum, i) => sum + i.total, 0);
      const totalPurchases = expenses.reduce((sum, e) => sum + e.total, 0);
      const balance = totalSales - totalPurchases;
      const margin = totalSales > 0 ? ((balance / totalSales) * 100).toFixed(1) : '0';

      return { text: `💰 **Análisis Financiero**\n\n` +
        `Ingresos: $${totalSales.toFixed(2)}\n` +
        `Egresos: $${totalPurchases.toFixed(2)}\n` +
        `${balance >= 0 ? '✅' : '⚠️'} Balance: $${balance.toFixed(2)}\n` +
        `📊 Margen: ${margin}%\n\n` +
        `${balance > 0 ? '¡Excelente! Estás generando ganancias.' : balance === 0 ? 'Estás en punto de equilibrio.' : 'Considera optimizar tus costos y aumentar ventas.'}` };
    }

    // === RESPUESTA POR DEFECTO MÁS INTELIGENTE ===
    if (products.length === 0 && categories.length === 0) {
      return { text: '🎯 **Primeros pasos:**\n\nParece que estás empezando. Te recomiendo:\n\n1. Crear categorías para organizar tus productos\n2. Agregar productos con precios y stock\n3. Registrar tus clientes y proveedores\n4. Comenzar a registrar ventas y compras\n\n¡Estoy aquí para ayudarte en el proceso! 💙' };
    }

    // Respuesta contextual basada en la conversación
    return { text: `🤔 Entiendo que preguntas sobre "${userMessage}".\n\nPuedo ayudarte con:\n\n` +
      `• Ver productos, stock y precios\n` +
      `• Análisis de ventas y compras\n` +
      `• Estadísticas y tendencias\n` +
      `• Información de clientes y proveedores\n` +
      `• Recomendaciones personalizadas\n\n` +
      `¿Podrías ser más específico? Por ejemplo:\n` +
      `"¿Cuánto tengo en ventas?"\n` +
      `"Muéstrame productos con bajo stock"\n` +
      `"¿Cuál es mi mejor cliente?"` };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Recargar datos por si hubo cambios
    loadData();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simular tiempo de pensamiento para dar sensación de IA
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        chartType: response.chartType,
        chartData: response.chartData,
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Actualizar historial de conversación con la respuesta del asistente
      setContext(prev => ({
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory.slice(-10), // Mantener solo los últimos 10 mensajes
          { role: 'assistant', content: response.text, timestamp: new Date() }
        ],
      }));
      
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-[#35D7FF] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={stockyLogo} 
                alt="Stocky" 
                className="w-16 h-16 object-contain transform hover:scale-110 transition-transform"
              />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Stocky
                <span className="text-xs px-2 py-1 bg-white/20 rounded-full">IA Mejorada</span>
              </CardTitle>
              <p className="text-sm text-[#00FFFF]">Tu asistente inteligente, asesor de negocios y glosario empresarial</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-6" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`${message.chartType ? 'max-w-[95%]' : 'max-w-[85%]'} rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-[#0047AB] text-white'
                        : 'bg-gradient-to-br from-[#35D7FF]/20 to-[#00FFFF]/20 text-gray-800 border border-[#35D7FF]'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={stockyLogo} 
                          alt="Stocky" 
                          className="w-6 h-6 object-contain"
                        />
                        <span className="text-xs font-semibold text-[#0047AB]">Stocky</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{message.content}</p>
                    
                    {/* Renderizado de gráficas */}
                    {message.role === 'assistant' && message.chartType && message.chartData && (
                      <div className="mt-4 bg-white p-4 rounded-lg border-2 border-[#0047AB]">
                        {message.chartType === 'pie' && (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={message.chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: $${entry.value.toFixed(2)}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {message.chartData.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                        
                        {message.chartType === 'bar' && (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={message.chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="total" fill="#0047AB" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                        
                        {message.chartType === 'line' && (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={message.chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="ingresos" stroke="#00FFFF" strokeWidth={2} />
                              <Line type="monotone" dataKey="egresos" stroke="#0047AB" strokeWidth={2} />
                              <Line type="monotone" dataKey="balance" stroke="#35D7FF" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                        
                        {message.chartType === 'balance' && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-[#00FFFF]/20 to-[#35D7FF]/20 rounded-lg">
                              <p className="text-sm text-muted-foreground">Ingresos</p>
                              <p className="text-2xl text-[#00FFFF]">${message.chartData.totalSales.toFixed(2)}</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-[#0047AB]/20 to-[#35D7FF]/20 rounded-lg">
                              <p className="text-sm text-muted-foreground">Egresos</p>
                              <p className="text-2xl text-[#0047AB]">${message.chartData.totalPurchases.toFixed(2)}</p>
                            </div>
                            <div className={`text-center p-4 rounded-lg ${message.chartData.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                              <p className="text-sm text-muted-foreground">Balance</p>
                              <p className={`text-2xl ${message.chartData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${message.chartData.balance.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-br from-[#35D7FF]/20 to-[#00FFFF]/20 text-gray-800 border border-[#35D7FF] rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#0047AB] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#35D7FF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#00FFFF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">Analizando datos...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-[#35D7FF] p-4 bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Pregúntale a Stocky sobre tu negocio..."
                className="border-[#35D7FF] focus:border-[#0047AB]"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] transition-colors"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Stocky puede mostrar gráficas interactivas - Solo pide "muestra una gráfica"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}