import { toast } from 'sonner@2.0.3';

// Funciones CRUD para Products
export const createProduct = (name: string, description: string, price: number, quantity: number, categoryId: string) => {
  const products = JSON.parse(localStorage.getItem('ministock_products') || '[]');
  const newProduct = {
    id: Date.now().toString(),
    name,
    description,
    price,
    quantity,
    categoryId,
  };
  products.push(newProduct);
  localStorage.setItem('ministock_products', JSON.stringify(products));
  toast.success(`✅ Producto "${name}" creado exitosamente`);
  return newProduct;
};

export const updateProduct = (id: string, updates: any) => {
  const products = JSON.parse(localStorage.getItem('ministock_products') || '[]');
  const index = products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    localStorage.setItem('ministock_products', JSON.stringify(products));
    toast.success(`✅ Producto actualizado exitosamente`);
    return products[index];
  }
  toast.error('❌ Producto no encontrado');
  return null;
};

export const deleteProduct = (id: string) => {
  const products = JSON.parse(localStorage.getItem('ministock_products') || '[]');
  const filtered = products.filter((p: any) => p.id !== id);
  localStorage.setItem('ministock_products', JSON.stringify(filtered));
  toast.success(`✅ Producto eliminado exitosamente`);
};

// Funciones CRUD para Categories
export const createCategory = (name: string, description: string) => {
  const categories = JSON.parse(localStorage.getItem('ministock_categories') || '[]');
  const newCategory = {
    id: Date.now().toString(),
    name,
    description,
  };
  categories.push(newCategory);
  localStorage.setItem('ministock_categories', JSON.stringify(categories));
  toast.success(`✅ Categoría "${name}" creada exitosamente`);
  return newCategory;
};

export const updateCategory = (id: string, updates: any) => {
  const categories = JSON.parse(localStorage.getItem('ministock_categories') || '[]');
  const index = categories.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    localStorage.setItem('ministock_categories', JSON.stringify(categories));
    toast.success(`✅ Categoría actualizada exitosamente`);
    return categories[index];
  }
  toast.error('❌ Categoría no encontrada');
  return null;
};

export const deleteCategory = (id: string) => {
  const categories = JSON.parse(localStorage.getItem('ministock_categories') || '[]');
  const filtered = categories.filter((c: any) => c.id !== id);
  localStorage.setItem('ministock_categories', JSON.stringify(filtered));
  toast.success(`✅ Categoría eliminada exitosamente`);
};

// Funciones CRUD para Clients
export const createClient = (name: string, phone: string, email: string) => {
  const clients = JSON.parse(localStorage.getItem('ministock_clients') || '[]');
  const newClient = {
    id: Date.now().toString(),
    name,
    phone,
    email,
  };
  clients.push(newClient);
  localStorage.setItem('ministock_clients', JSON.stringify(clients));
  toast.success(`✅ Cliente "${name}" creado exitosamente`);
  return newClient;
};

export const updateClient = (id: string, updates: any) => {
  const clients = JSON.parse(localStorage.getItem('ministock_clients') || '[]');
  const index = clients.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updates };
    localStorage.setItem('ministock_clients', JSON.stringify(clients));
    toast.success(`✅ Cliente actualizado exitosamente`);
    return clients[index];
  }
  toast.error('❌ Cliente no encontrado');
  return null;
};

export const deleteClient = (id: string) => {
  const clients = JSON.parse(localStorage.getItem('ministock_clients') || '[]');
  const filtered = clients.filter((c: any) => c.id !== id);
  localStorage.setItem('ministock_clients', JSON.stringify(filtered));
  toast.success(`✅ Cliente eliminado exitosamente`);
};

// Funciones CRUD para Providers
export const createProvider = (name: string, contact: string, email: string) => {
  const providers = JSON.parse(localStorage.getItem('ministock_providers') || '[]');
  const newProvider = {
    id: Date.now().toString(),
    name,
    contact,
    email,
  };
  providers.push(newProvider);
  localStorage.setItem('ministock_providers', JSON.stringify(providers));
  toast.success(`✅ Proveedor "${name}" creado exitosamente`);
  return newProvider;
};

export const updateProvider = (id: string, updates: any) => {
  const providers = JSON.parse(localStorage.getItem('ministock_providers') || '[]');
  const index = providers.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    providers[index] = { ...providers[index], ...updates };
    localStorage.setItem('ministock_providers', JSON.stringify(providers));
    toast.success(`✅ Proveedor actualizado exitosamente`);
    return providers[index];
  }
  toast.error('❌ Proveedor no encontrado');
  return null;
};

export const deleteProvider = (id: string) => {
  const providers = JSON.parse(localStorage.getItem('ministock_providers') || '[]');
  const filtered = providers.filter((p: any) => p.id !== id);
  localStorage.setItem('ministock_providers', JSON.stringify(filtered));
  toast.success(`✅ Proveedor eliminado exitosamente`);
};

// Funciones CRUD para Sales (Incomes)
export const createSale = (productId: string, productName: string, clientId: string, clientName: string, quantity: number, unitPrice: number) => {
  const sales = JSON.parse(localStorage.getItem('ministock_sales') || '[]');
  const products = JSON.parse(localStorage.getItem('ministock_products') || '[]');
  
  // Actualizar stock del producto
  const productIndex = products.findIndex((p: any) => p.id === productId);
  if (productIndex === -1) {
    toast.error('❌ Producto no encontrado');
    return null;
  }
  
  if (products[productIndex].quantity < quantity) {
    toast.error('❌ Stock insuficiente');
    return null;
  }
  
  products[productIndex].quantity -= quantity;
  localStorage.setItem('ministock_products', JSON.stringify(products));
  
  const subtotal = quantity * unitPrice;
  
  const newSale = {
    id: Date.now().toString(),
    clientId,
    clientName,
    items: [{
      productId,
      productName,
      quantity,
      unitPrice,
      subtotal,
    }],
    total: subtotal,
    date: new Date().toISOString(),
  };
  
  sales.push(newSale);
  localStorage.setItem('ministock_sales', JSON.stringify(sales));
  toast.success(`✅ Venta registrada: ${quantity} x ${productName}`);
  return newSale;
};

export const deleteSale = (id: string) => {
  const sales = JSON.parse(localStorage.getItem('ministock_sales') || '[]');
  const sale = sales.find((s: any) => s.id === id);
  
  if (sale) {
    // Devolver stock de todos los productos
    const products = JSON.parse(localStorage.getItem('ministock_products') || '[]');
    sale.items.forEach((item: any) => {
      const productIndex = products.findIndex((p: any) => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].quantity += item.quantity;
      }
    });
    localStorage.setItem('ministock_products', JSON.stringify(products));
  }
  
  const filtered = sales.filter((s: any) => s.id !== id);
  localStorage.setItem('ministock_sales', JSON.stringify(filtered));
  toast.success(`✅ Venta eliminada`);
};

// Funciones CRUD para Purchases (Expenses)
export const createPurchase = (productId: string, productName: string, providerId: string, providerName: string, quantity: number, unitPrice: number) => {
  const purchases = JSON.parse(localStorage.getItem('ministock_purchases') || '[]');
  const products = JSON.parse(localStorage.getItem('ministock_products') || '[]');
  
  // Actualizar stock del producto
  const productIndex = products.findIndex((p: any) => p.id === productId);
  if (productIndex === -1) {
    toast.error('❌ Producto no encontrado');
    return null;
  }
  
  products[productIndex].quantity += quantity;
  localStorage.setItem('ministock_products', JSON.stringify(products));
  
  const subtotal = quantity * unitPrice;
  
  const newPurchase = {
    id: Date.now().toString(),
    providerId,
    providerName,
    items: [{
      productId,
      productName,
      quantity,
      unitPrice,
      subtotal,
    }],
    total: subtotal,
    date: new Date().toISOString(),
  };
  
  purchases.push(newPurchase);
  localStorage.setItem('ministock_purchases', JSON.stringify(purchases));
  toast.success(`✅ Compra registrada: ${quantity} x ${productName}`);
  return newPurchase;
};

export const deletePurchase = (id: string) => {
  const purchases = JSON.parse(localStorage.getItem('ministock_purchases') || '[]');
  const purchase = purchases.find((p: any) => p.id === id);
  
  if (purchase) {
    // Restar stock de todos los productos
    const products = JSON.parse(localStorage.getItem('ministock_products') || '[]');
    purchase.items.forEach((item: any) => {
      const productIndex = products.findIndex((p: any) => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].quantity -= item.quantity;
      }
    });
    localStorage.setItem('ministock_products', JSON.stringify(products));
  }
  
  const filtered = purchases.filter((p: any) => p.id !== id);
  localStorage.setItem('ministock_purchases', JSON.stringify(filtered));
  toast.success(`✅ Compra eliminada`);
};
