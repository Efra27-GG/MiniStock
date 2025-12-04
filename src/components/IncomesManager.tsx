import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Pencil, Trash2, TrendingUp, AlertCircle, UserPlus, Eye, X, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  items: SaleItem[];
  total: number;
  date: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryId: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export function IncomesManager() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailSale, setDetailSale] = useState<Sale | null>(null);
  
  // Form fields
  const [clientId, setClientId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currentItems, setCurrentItems] = useState<SaleItem[]>([]);
  
  // New client form
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Sale mode: 'simple' or 'multiple'
  const [saleMode, setSaleMode] = useState<'simple' | 'multiple'>('simple');

  useEffect(() => {
    loadSales();
    loadProducts();
    loadClients();
  }, []);

  const loadSales = () => {
    // Try to load new format
    const stored = localStorage.getItem('ministock_sales');
    if (stored) {
      setSales(JSON.parse(stored));
      return;
    }

    // Migrate old format if exists
    const oldIncomes = localStorage.getItem('ministock_incomes');
    if (oldIncomes) {
      const oldData = JSON.parse(oldIncomes);
      // Convert old single-product sales to new multi-product format
      const migratedSales: Sale[] = oldData.map((income: any) => ({
        id: income.id,
        clientId: income.clientId,
        clientName: income.clientName,
        items: [{
          productId: income.productId,
          productName: income.productName,
          quantity: income.quantity,
          unitPrice: income.unitPrice,
          subtotal: income.total,
        }],
        total: income.total,
        date: income.date,
      }));
      localStorage.setItem('ministock_sales', JSON.stringify(migratedSales));
      setSales(migratedSales);
      toast.success('Datos migrados al nuevo formato');
    }
  };

  const loadProducts = () => {
    const stored = localStorage.getItem('ministock_products');
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  };

  const loadClients = () => {
    const stored = localStorage.getItem('ministock_clients');
    if (stored) {
      setClients(JSON.parse(stored));
    }
  };

  const handleAddNewClient = () => {
    if (!newClientName.trim()) {
      toast.error('El nombre del cliente es requerido');
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: newClientName,
      phone: newClientPhone,
      email: newClientEmail,
      createdAt: new Date().toISOString(),
    };

    const updatedClients = [...clients, newClient];
    localStorage.setItem('ministock_clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
    setClientId(newClient.id);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setShowNewClientForm(false);
    toast.success('Cliente agregado exitosamente');
  };

  const handleAddItem = () => {
    if (!productId) {
      toast.error('Selecciona un producto');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      toast.error('Ingresa una cantidad válida');
      return;
    }

    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    const qty = parseInt(quantity);
    
    // Check if product already in list
    const existingItem = currentItems.find(item => item.productId === productId);
    const totalQty = existingItem ? existingItem.quantity + qty : qty;
    
    if (totalQty > product.quantity) {
      toast.error(`Stock insuficiente. Disponible: ${product.quantity}`);
      return;
    }

    const price = parseFloat(unitPrice);
    const subtotal = qty * price;

    const newItem: SaleItem = {
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: price,
      subtotal,
    };

    // Update or add item
    if (existingItem) {
      setCurrentItems(currentItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: totalQty, subtotal: totalQty * item.unitPrice }
          : item
      ));
      toast.success('Cantidad actualizada');
    } else {
      setCurrentItems([...currentItems, newItem]);
      toast.success('Producto agregado');
    }

    // Reset item fields
    setProductId('');
    setQuantity('');
    setUnitPrice('');
  };

  const handleRemoveItem = (productId: string) => {
    setCurrentItems(currentItems.filter(item => item.productId !== productId));
    toast.success('Producto eliminado');
  };

  const calculateTotal = () => {
    return currentItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSaveSale = () => {
    if (!clientId) {
      toast.error('Selecciona un cliente');
      return;
    }

    let itemsToSave: SaleItem[] = [];

    // Simple mode: create item from form fields
    if (saleMode === 'simple') {
      if (!productId || !quantity || !unitPrice) {
        toast.error('Completa todos los campos del producto');
        return;
      }

      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error('Producto no encontrado');
        return;
      }

      const qty = parseInt(quantity);
      const price = parseFloat(unitPrice);

      if (qty > product.quantity) {
        toast.error(`Stock insuficiente. Disponible: ${product.quantity}`);
        return;
      }

      itemsToSave = [{
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice: price,
        subtotal: qty * price,
      }];
    } else {
      // Multiple mode: use currentItems
      if (currentItems.length === 0) {
        toast.error('Agrega al menos un producto a la venta');
        return;
      }
      itemsToSave = currentItems;
    }

    const client = clients.find(c => c.id === clientId);
    if (!client) {
      toast.error('Cliente no encontrado');
      return;
    }

    const total = itemsToSave.reduce((sum, item) => sum + item.subtotal, 0);

    const newSale: Sale = {
      id: Date.now().toString(),
      clientId: client.id,
      clientName: client.name,
      items: itemsToSave,
      total,
      date: new Date().toISOString(),
    };

    // Update product stock
    const updatedProducts = products.map(product => {
      const item = itemsToSave.find(i => i.productId === product.id);
      if (item) {
        return { ...product, quantity: product.quantity - item.quantity };
      }
      return product;
    });

    const updatedSales = [...sales, newSale];
    localStorage.setItem('ministock_sales', JSON.stringify(updatedSales));
    localStorage.setItem('ministock_products', JSON.stringify(updatedProducts));
    setSales(updatedSales);
    setProducts(updatedProducts);
    
    toast.success('Venta registrada exitosamente');
    resetForm();
  };

  const handleDeleteSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    // Restore stock
    const updatedProducts = products.map(product => {
      const item = sale.items.find(i => i.productId === product.id);
      if (item) {
        return { ...product, quantity: product.quantity + item.quantity };
      }
      return product;
    });

    const updatedSales = sales.filter(s => s.id !== saleId);
    localStorage.setItem('ministock_sales', JSON.stringify(updatedSales));
    localStorage.setItem('ministock_products', JSON.stringify(updatedProducts));
    setSales(updatedSales);
    setProducts(updatedProducts);
    setDeleteId(null);
    toast.success('Venta eliminada y stock restaurado');
  };

  const resetForm = () => {
    setClientId('');
    setProductId('');
    setQuantity('');
    setUnitPrice('');
    setCurrentItems([]);
    setIsDialogOpen(false);
  };

  const getTotalSales = () => {
    return sales.reduce((sum, s) => sum + s.total, 0);
  };

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <>
      <Card className="border-[#35D7FF]">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              <CardTitle className="flex items-center gap-2 mb-2 text-base sm:text-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                Gestión de Ventas
              </CardTitle>
              <p className="text-xs sm:text-sm text-[#00FFFF]">
                Total de ventas: ${getTotalSales().toFixed(2)}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Registrar Venta</span>
                  <span className="xs:hidden">Venta</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-[#0047AB]" />
                    Nueva Venta - Carrito de Compras
                  </DialogTitle>
                  <DialogDescription>
                    Selecciona un cliente y agrega todos los productos que desees a la venta
                  </DialogDescription>
                </DialogHeader>
                {products.length === 0 ? (
                  <div className="py-8 text-center space-y-4">
                    <AlertCircle className="h-16 w-16 mx-auto text-[#35D7FF]" />
                    <p className="text-black">
                      No hay productos disponibles. Crea una categoría y productos para registrar ventas.
                    </p>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="py-8 text-center space-y-4">
                    <AlertCircle className="h-16 w-16 mx-auto text-[#35D7FF]" />
                    <p className="text-black mb-4">
                      No hay clientes registrados. Necesitas registrar al menos un cliente para realizar ventas.
                    </p>
                    <Button
                      onClick={() => {
                        setIsDialogOpen(false);
                        // Trigger navigation to Clientes section
                        const clientsButton = document.querySelector('[data-section="clientes"]') as HTMLButtonElement;
                        if (clientsButton) clientsButton.click();
                      }}
                      className="bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB]"
                    >
                      Ir a Clientes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Client Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="sale-client">Cliente</Label>
                      <Select value={clientId} onValueChange={(value) => setClientId(value)}>
                        <SelectTrigger className="border-[#35D7FF]">
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} - {client.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {showNewClientForm && (
                        <div className="space-y-2 mt-2 p-3 border rounded-lg border-[#35D7FF]">
                          <Label htmlFor="new-client-name">Nombre del Cliente</Label>
                          <Input
                            id="new-client-name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            required
                            className="border-[#35D7FF]"
                            placeholder="Juan Pérez"
                          />
                          <Label htmlFor="new-client-phone">Teléfono</Label>
                          <Input
                            id="new-client-phone"
                            value={newClientPhone}
                            onChange={(e) => setNewClientPhone(e.target.value)}
                            required
                            className="border-[#35D7FF]"
                            placeholder="123-456-7890"
                          />
                          <Label htmlFor="new-client-email">Email</Label>
                          <Input
                            id="new-client-email"
                            value={newClientEmail}
                            onChange={(e) => setNewClientEmail(e.target.value)}
                            className="border-[#35D7FF]"
                            placeholder="juan@example.com"
                          />
                          <Button
                            type="button"
                            onClick={handleAddNewClient}
                            className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB]"
                          >
                            Agregar Cliente
                          </Button>
                        </div>
                      )}
                      {!showNewClientForm && (
                        <Button
                          type="button"
                          onClick={() => setShowNewClientForm(true)}
                          variant="outline"
                          className="w-full border-[#0047AB] text-[#0047AB] hover:bg-[#0047AB] hover:text-white"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Agregar Nuevo Cliente
                        </Button>
                      )}
                    </div>

                    {/* Sale Mode Selector */}
                    <div className="space-y-3 p-4 border-2 rounded-lg border-[#0047AB] bg-gradient-to-r from-[#0047AB]/5 to-[#35D7FF]/5">
                      <Label className="text-base font-semibold text-[#0047AB]">Tipo de Venta</Label>
                      <RadioGroup value={saleMode} onValueChange={(value: 'simple' | 'multiple') => {
                        setSaleMode(value);
                        // Clear items when switching modes
                        setCurrentItems([]);
                        setProductId('');
                        setQuantity('');
                        setUnitPrice('');
                      }} className="gap-3">
                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-[#35D7FF] bg-white cursor-pointer hover:bg-[#35D7FF]/10 transition">
                          <RadioGroupItem value="simple" id="simple" className="border-[#0047AB]" />
                          <Label htmlFor="simple" className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <p className="font-semibold text-[#0047AB]">🛒 Venta Rápida (Un Producto)</p>
                              <p className="text-xs text-muted-foreground">Registra una venta con un solo producto de forma directa</p>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-[#35D7FF] bg-white cursor-pointer hover:bg-[#35D7FF]/10 transition">
                          <RadioGroupItem value="multiple" id="multiple" className="border-[#0047AB]" />
                          <Label htmlFor="multiple" className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <p className="font-semibold text-[#0047AB]">🛍️ Carrito (Múltiples Productos)</p>
                              <p className="text-xs text-muted-foreground">Agrega varios productos antes de completar la venta</p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Simple Mode Form */}
                    {saleMode === 'simple' && (
                      <div className="space-y-4 p-4 border rounded-lg border-[#35D7FF] bg-[#35D7FF]/5">
                        <h3 className="font-semibold text-[#0047AB]">Datos del Producto</h3>
                        <div className="space-y-2">
                          <Label htmlFor="sale-product">Producto</Label>
                          <Select
                            value={productId}
                            onValueChange={(value) => {
                              setProductId(value);
                              const selectedProduct = products.find(p => p.id === value);
                              if (selectedProduct) {
                                setUnitPrice(selectedProduct.price.toString());
                              }
                            }}
                          >
                            <SelectTrigger className="border-[#35D7FF]">
                              <SelectValue placeholder="Selecciona un producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ${product.price} (Stock: {product.quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedProduct && (
                          <div className="bg-[#35D7FF]/10 p-3 rounded-lg space-y-1 border-l-4 border-[#00FFFF]">
                            <p className="text-sm"><strong>✅ Precio autocompletado:</strong> ${selectedProduct.price.toFixed(2)}</p>
                            <p className="text-sm"><strong>📦 Stock disponible:</strong> {selectedProduct.quantity} unidades</p>
                            <p className="text-xs text-[#0047AB]">💡 Puedes modificar el precio para aplicar descuentos o promociones.</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sale-quantity">Cantidad</Label>
                            <Input
                              id="sale-quantity"
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              className="border-[#35D7FF]"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sale-price">Precio Unitario</Label>
                            <Input
                              id="sale-price"
                              type="number"
                              step="0.01"
                              min="0"
                              value={unitPrice}
                              onChange={(e) => setUnitPrice(e.target.value)}
                              className="border-[#35D7FF]"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {productId && quantity && unitPrice && (
                          <div className="bg-gradient-to-r from-[#0047AB]/10 to-[#35D7FF]/10 p-4 rounded-lg border-2 border-[#0047AB]">
                            <div className="flex justify-between items-center">
                              <span className="text-lg">Total de la Venta:</span>
                              <span className="text-3xl text-[#0047AB]">
                                ${(parseInt(quantity) * parseFloat(unitPrice)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Multiple Mode Form */}
                    {saleMode === 'multiple' && (
                      <>
                        {/* Product Selection */}
                        <div className="space-y-4 p-4 border rounded-lg border-[#35D7FF] bg-[#35D7FF]/5">
                          <h3 className="font-semibold text-[#0047AB]">Agregar Producto</h3>
                          <div className="space-y-2">
                            <Label htmlFor="sale-product">Producto</Label>
                            <Select
                              value={productId}
                              onValueChange={(value) => {
                                setProductId(value);
                                const selectedProduct = products.find(p => p.id === value);
                                if (selectedProduct) {
                                  setUnitPrice(selectedProduct.price.toString());
                                }
                              }}
                            >
                              <SelectTrigger className="border-[#35D7FF]">
                                <SelectValue placeholder="Selecciona un producto" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} - ${product.price} (Stock: {product.quantity})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedProduct && (
                            <div className="bg-[#35D7FF]/10 p-3 rounded-lg space-y-1 border-l-4 border-[#00FFFF]">
                              <p className="text-sm"><strong>✅ Precio autocompletado:</strong> ${selectedProduct.price.toFixed(2)}</p>
                              <p className="text-sm"><strong>📦 Stock disponible:</strong> {selectedProduct.quantity} unidades</p>
                              <p className="text-xs text-[#0047AB]">💡 Puedes modificar el precio para aplicar descuentos o promociones.</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="sale-quantity">Cantidad</Label>
                              <Input
                                id="sale-quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="border-[#35D7FF]"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sale-price">Precio Unitario</Label>
                              <Input
                                id="sale-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                className="border-[#35D7FF]"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={handleAddItem}
                            className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB]"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Producto
                          </Button>
                        </div>

                        {/* Items List */}
                        {currentItems.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-5 w-5 text-[#0047AB]" />
                              <h3 className="font-semibold text-[#0047AB]">Productos en la Venta ({currentItems.length})</h3>
                            </div>
                            <div className="border rounded-lg border-[#35D7FF]">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Cant.</TableHead>
                                    <TableHead className="text-right">Precio Unit.</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                    <TableHead className="text-right w-20">Acción</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {currentItems.map((item) => (
                                    <TableRow key={item.productId}>
                                      <TableCell>{item.productName}</TableCell>
                                      <TableCell className="text-right">{item.quantity}</TableCell>
                                      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                      <TableCell className="text-right font-semibold">${item.subtotal.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveItem(item.productId)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            
                            <div className="bg-gradient-to-r from-[#0047AB]/10 to-[#35D7FF]/10 p-4 rounded-lg border-2 border-[#0047AB]">
                              <div className="flex justify-between items-center">
                                <span className="text-lg">Total de la Venta:</span>
                                <span className="text-3xl text-[#0047AB]">
                                  ${calculateTotal().toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-[#35D7FF]/5 rounded-lg border-2 border-dashed border-[#35D7FF]">
                            <ShoppingCart className="h-12 w-12 mx-auto text-[#35D7FF] mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Tu carrito está vacío. Agrega productos para comenzar la venta.
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Save Button */}
                    <Button
                      type="button"
                      onClick={handleSaveSale}
                      disabled={
                        !clientId || 
                        (saleMode === 'simple' && (!productId || !quantity || !unitPrice)) ||
                        (saleMode === 'multiple' && currentItems.length === 0)
                      }
                      className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] disabled:opacity-50"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Guardar Venta
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto text-[#35D7FF] mb-4" />
              <p className="text-black">
                No hay ventas registradas. Registra tu primera venta.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {new Date(sale.date).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>{sale.clientName}</TableCell>
                    <TableCell className="text-right">{sale.items.length}</TableCell>
                    <TableCell className="text-right font-semibold text-[#0047AB]">${sale.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailSale(sale)}
                          className="text-[#0047AB] hover:text-[#35D7FF]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(sale.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailSale} onOpenChange={() => setDetailSale(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Venta</DialogTitle>
            <DialogDescription>
              Información completa de la venta
            </DialogDescription>
          </DialogHeader>
          {detailSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#35D7FF]/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{detailSale.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-semibold">{new Date(detailSale.date).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              <div className="border rounded-lg border-[#35D7FF]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailSale.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">${item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-gradient-to-r from-[#0047AB]/10 to-[#35D7FF]/10 p-4 rounded-lg border-2 border-[#0047AB]">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Total:</span>
                  <span className="text-3xl text-[#0047AB]">
                    ${detailSale.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La venta será eliminada y el stock será restaurado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteSale(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}