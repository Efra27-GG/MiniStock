import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, TrendingDown, AlertCircle, UserPlus, Eye, X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Purchase {
  id: string;
  providerId: string;
  providerName: string;
  items: PurchaseItem[];
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

interface Provider {
  id: string;
  name: string;
  contact: string;
  email: string;
  categoryId: string;
  products: string[];  // Changed from string to string[]
}

export function ExpensesManager() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailPurchase, setDetailPurchase] = useState<Purchase | null>(null);
  
  // Form fields
  const [providerId, setProviderId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currentItems, setCurrentItems] = useState<PurchaseItem[]>([]);
  
  // New provider form
  const [showNewProviderForm, setShowNewProviderForm] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderContact, setNewProviderContact] = useState('');
  const [newProviderEmail, setNewProviderEmail] = useState('');

  // Purchase mode: 'simple' or 'multiple'
  const [purchaseMode, setPurchaseMode] = useState<'simple' | 'multiple'>('simple');

  useEffect(() => {
    loadPurchases();
    loadProducts();
    loadProviders();
  }, []);

  const loadPurchases = () => {
    // Try to load new format
    const stored = localStorage.getItem('ministock_purchases');
    if (stored) {
      setPurchases(JSON.parse(stored));
      return;
    }

    // Migrate old format if exists
    const oldExpenses = localStorage.getItem('ministock_expenses');
    if (oldExpenses) {
      const oldData = JSON.parse(oldExpenses);
      // Convert old single-product purchases to new multi-product format
      const migratedPurchases: Purchase[] = oldData.map((expense: any) => ({
        id: expense.id,
        providerId: expense.providerId,
        providerName: expense.providerName,
        items: [{
          productId: expense.productId,
          productName: expense.productName,
          quantity: expense.quantity,
          unitPrice: expense.unitPrice,
          subtotal: expense.total,
        }],
        total: expense.total,
        date: expense.date,
      }));
      localStorage.setItem('ministock_purchases', JSON.stringify(migratedPurchases));
      setPurchases(migratedPurchases);
      toast.success('Datos migrados al nuevo formato');
    }
  };

  const loadProducts = () => {
    const stored = localStorage.getItem('ministock_products');
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  };

  const loadProviders = () => {
    const stored = localStorage.getItem('ministock_providers');
    if (stored) {
      setProviders(JSON.parse(stored));
    }
  };

  const handleAddNewProvider = () => {
    if (!newProviderName.trim()) {
      toast.error('El nombre del proveedor es requerido');
      return;
    }

    const newProvider: Provider = {
      id: Date.now().toString(),
      name: newProviderName,
      contact: newProviderContact,
      email: newProviderEmail,
      categoryId: '',
      products: [],
    };

    const updatedProviders = [...providers, newProvider];
    localStorage.setItem('ministock_providers', JSON.stringify(updatedProviders));
    setProviders(updatedProviders);
    setProviderId(newProvider.id);
    setNewProviderName('');
    setNewProviderContact('');
    setNewProviderEmail('');
    setShowNewProviderForm(false);
    toast.success('Proveedor agregado exitosamente');
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
    const price = parseFloat(unitPrice);
    const subtotal = qty * price;

    // Check if product already in list
    const existingItem = currentItems.find(item => item.productId === productId);

    const newItem: PurchaseItem = {
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: price,
      subtotal,
    };

    // Update or add item
    if (existingItem) {
      const totalQty = existingItem.quantity + qty;
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

  const handleSavePurchase = () => {
    if (!providerId) {
      toast.error('Selecciona un proveedor');
      return;
    }

    let itemsToSave: PurchaseItem[] = [];

    // Simple mode: create item from form fields
    if (purchaseMode === 'simple') {
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
        toast.error('Agrega al menos un producto a la compra');
        return;
      }
      itemsToSave = currentItems;
    }

    const provider = providers.find(p => p.id === providerId);
    if (!provider) {
      toast.error('Proveedor no encontrado');
      return;
    }

    const total = itemsToSave.reduce((sum, item) => sum + item.subtotal, 0);

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      providerId: provider.id,
      providerName: provider.name,
      items: itemsToSave,
      total,
      date: new Date().toISOString(),
    };

    // Update product stock (add purchased quantities)
    const updatedProducts = products.map(product => {
      const item = itemsToSave.find(i => i.productId === product.id);
      if (item) {
        return { ...product, quantity: product.quantity + item.quantity };
      }
      return product;
    });

    const updatedPurchases = [...purchases, newPurchase];
    localStorage.setItem('ministock_purchases', JSON.stringify(updatedPurchases));
    localStorage.setItem('ministock_products', JSON.stringify(updatedProducts));
    setPurchases(updatedPurchases);
    setProducts(updatedProducts);
    
    toast.success('Compra registrada exitosamente');
    resetForm();
  };

  const handleDeletePurchase = (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    // Subtract stock (reverse the purchase)
    const updatedProducts = products.map(product => {
      const item = purchase.items.find(i => i.productId === product.id);
      if (item) {
        return { ...product, quantity: product.quantity - item.quantity };
      }
      return product;
    });

    const updatedPurchases = purchases.filter(p => p.id !== purchaseId);
    localStorage.setItem('ministock_purchases', JSON.stringify(updatedPurchases));
    localStorage.setItem('ministock_products', JSON.stringify(updatedProducts));
    setPurchases(updatedPurchases);
    setProducts(updatedProducts);
    setDeleteId(null);
    toast.success('Compra eliminada y stock ajustado');
  };

  const resetForm = () => {
    setProviderId('');
    setProductId('');
    setQuantity('');
    setUnitPrice('');
    setCurrentItems([]);
    setIsDialogOpen(false);
  };

  const getTotalPurchases = () => {
    return purchases.reduce((sum, p) => sum + p.total, 0);
  };

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <>
      <Card className="border-[#35D7FF]">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              <CardTitle className="flex items-center gap-2 mb-2 text-base sm:text-lg">
                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
                Gestión de Compras
              </CardTitle>
              <p className="text-xs sm:text-sm text-[#00FFFF]">
                Total de compras: ${getTotalPurchases().toFixed(2)}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Registrar Compra</span>
                  <span className="xs:hidden">Compra</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nueva Compra</DialogTitle>
                  <DialogDescription>
                    Agrega múltiples productos a la compra
                  </DialogDescription>
                </DialogHeader>
                {products.length === 0 ? (
                  <div className="py-8 text-center space-y-4">
                    <AlertCircle className="h-16 w-16 mx-auto text-[#35D7FF]" />
                    <p className="text-black">
                      No hay productos disponibles. Crea una categoría y productos para registrar compras.
                    </p>
                  </div>
                ) : providers.length === 0 ? (
                  <div className="py-8 text-center space-y-4">
                    <AlertCircle className="h-16 w-16 mx-auto text-[#35D7FF]" />
                    <p className="text-black mb-4">
                      No hay proveedores registrados. Necesitas registrar al menos un proveedor para realizar compras.
                    </p>
                    <Button
                      onClick={() => {
                        setIsDialogOpen(false);
                        // Trigger navigation to Proveedores section
                        const providersButton = document.querySelector('[data-section="proveedores"]') as HTMLButtonElement;
                        if (providersButton) providersButton.click();
                      }}
                      className="bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB]"
                    >
                      Ir a Proveedores
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Provider Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="purchase-provider">Proveedor</Label>
                      <Select value={providerId} onValueChange={(value) => setProviderId(value)}>
                        <SelectTrigger className="border-[#35D7FF]">
                          <SelectValue placeholder="Selecciona un proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name} - {provider.contact}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {showNewProviderForm && (
                        <div className="space-y-2 mt-2 p-3 border rounded-lg border-[#35D7FF]">
                          <Label htmlFor="new-provider-name">Nombre del Proveedor</Label>
                          <Input
                            id="new-provider-name"
                            value={newProviderName}
                            onChange={(e) => setNewProviderName(e.target.value)}
                            required
                            className="border-[#35D7FF]"
                            placeholder="Proveedor SA"
                          />
                          <Label htmlFor="new-provider-contact">Contacto</Label>
                          <Input
                            id="new-provider-contact"
                            value={newProviderContact}
                            onChange={(e) => setNewProviderContact(e.target.value)}
                            required
                            className="border-[#35D7FF]"
                            placeholder="123-456-7890"
                          />
                          <Label htmlFor="new-provider-email">Email</Label>
                          <Input
                            id="new-provider-email"
                            value={newProviderEmail}
                            onChange={(e) => setNewProviderEmail(e.target.value)}
                            className="border-[#35D7FF]"
                            placeholder="proveedor@example.com"
                          />
                          <Button
                            type="button"
                            onClick={handleAddNewProvider}
                            className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB]"
                          >
                            Agregar Proveedor
                          </Button>
                        </div>
                      )}
                      {!showNewProviderForm && (
                        <Button
                          type="button"
                          onClick={() => setShowNewProviderForm(true)}
                          variant="outline"
                          className="w-full border-[#0047AB] text-[#0047AB] hover:bg-[#0047AB] hover:text-white"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Agregar Nuevo Proveedor
                        </Button>
                      )}
                    </div>

                    {/* Purchase Mode Selector */}
                    <div className="space-y-3 p-4 border-2 rounded-lg border-[#0047AB] bg-gradient-to-r from-[#0047AB]/5 to-[#35D7FF]/5">
                      <Label className="text-base font-semibold text-[#0047AB]">Tipo de Compra</Label>
                      <RadioGroup value={purchaseMode} onValueChange={(value: 'simple' | 'multiple') => {
                        setPurchaseMode(value);
                        // Clear items when switching modes
                        setCurrentItems([]);
                        setProductId('');
                        setQuantity('');
                        setUnitPrice('');
                      }} className="gap-3">
                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-[#35D7FF] bg-white cursor-pointer hover:bg-[#35D7FF]/10 transition">
                          <RadioGroupItem value="simple" id="simple-purchase" className="border-[#0047AB]" />
                          <Label htmlFor="simple-purchase" className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <p className="font-semibold text-[#0047AB]">📦 Compra Rápida (Un Producto)</p>
                              <p className="text-xs text-muted-foreground">Registra una compra con un solo producto de forma directa</p>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-[#35D7FF] bg-white cursor-pointer hover:bg-[#35D7FF]/10 transition">
                          <RadioGroupItem value="multiple" id="multiple-purchase" className="border-[#0047AB]" />
                          <Label htmlFor="multiple-purchase" className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <p className="font-semibold text-[#0047AB]">🛒 Orden de Compra (Múltiples Productos)</p>
                              <p className="text-xs text-muted-foreground">Agrega varios productos antes de completar la compra</p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Simple Mode Form */}
                    {purchaseMode === 'simple' && (
                      <div className="space-y-4 p-4 border rounded-lg border-[#35D7FF] bg-[#35D7FF]/5">
                        <h3 className="font-semibold text-[#0047AB]">Datos del Producto</h3>
                        <div className="space-y-2">
                          <Label htmlFor="purchase-product">Producto</Label>
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
                                  {product.name} (Stock actual: {product.quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedProduct && (
                          <div className="bg-[#35D7FF]/10 p-3 rounded-lg space-y-1 border-l-4 border-[#00FFFF]">
                            <p className="text-sm"><strong>✅ Precio autocompletado:</strong> ${selectedProduct.price.toFixed(2)}</p>
                            <p className="text-sm"><strong>📦 Stock actual:</strong> {selectedProduct.quantity} unidades</p>
                            <p className="text-xs text-[#0047AB]">💡 Puedes modificar el precio si lo compraste a otro costo.</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="purchase-quantity">Cantidad</Label>
                            <Input
                              id="purchase-quantity"
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              className="border-[#35D7FF]"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="purchase-price">Precio Unitario</Label>
                            <Input
                              id="purchase-price"
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
                              <span className="text-lg">Total de la Compra:</span>
                              <span className="text-3xl text-[#0047AB]">
                                ${(parseInt(quantity) * parseFloat(unitPrice)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Multiple Mode Form */}
                    {purchaseMode === 'multiple' && (
                      <>
                        {/* Product Selection */}
                        <div className="space-y-4 p-4 border rounded-lg border-[#35D7FF] bg-[#35D7FF]/5">
                          <h3 className="font-semibold text-[#0047AB]">Agregar Producto</h3>
                          <div className="space-y-2">
                            <Label htmlFor="purchase-product">Producto</Label>
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
                                    {product.name} (Stock actual: {product.quantity})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedProduct && (
                            <div className="bg-[#35D7FF]/10 p-3 rounded-lg space-y-1 border-l-4 border-[#00FFFF]">
                              <p className="text-sm"><strong>✅ Precio autocompletado:</strong> ${selectedProduct.price.toFixed(2)}</p>
                              <p className="text-sm"><strong>📦 Stock actual:</strong> {selectedProduct.quantity} unidades</p>
                              <p className="text-xs text-[#0047AB]">💡 Puedes modificar el precio si lo compraste a otro costo.</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="purchase-quantity">Cantidad</Label>
                              <Input
                                id="purchase-quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="border-[#35D7FF]"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="purchase-price">Precio Unitario</Label>
                              <Input
                                id="purchase-price"
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
                        {currentItems.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-[#0047AB]">Productos en la Compra</h3>
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
                                <span className="text-lg">Total de la Compra:</span>
                                <span className="text-3xl text-[#0047AB]">
                                  ${calculateTotal().toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Save Button */}
                    <Button
                      type="button"
                      onClick={handleSavePurchase}
                      disabled={
                        !providerId || 
                        (purchaseMode === 'simple' && (!productId || !quantity || !unitPrice)) ||
                        (purchaseMode === 'multiple' && currentItems.length === 0)
                      }
                      className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] disabled:opacity-50"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Guardar Compra
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <TrendingDown className="h-16 w-16 mx-auto text-[#35D7FF] mb-4" />
              <p className="text-black">
                No hay compras registradas. Registra tu primera compra.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      {new Date(purchase.date).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>{purchase.providerName}</TableCell>
                    <TableCell className="text-right">{purchase.items.length}</TableCell>
                    <TableCell className="text-right font-semibold text-[#0047AB]">${purchase.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailPurchase(purchase)}
                          className="text-[#0047AB] hover:text-[#35D7FF]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(purchase.id)}
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
      <Dialog open={!!detailPurchase} onOpenChange={() => setDetailPurchase(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Compra</DialogTitle>
            <DialogDescription>
              Información completa de la compra
            </DialogDescription>
          </DialogHeader>
          {detailPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#35D7FF]/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Proveedor</p>
                  <p className="font-semibold">{detailPurchase.providerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-semibold">{new Date(detailPurchase.date).toLocaleDateString('es-ES')}</p>
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
                    {detailPurchase.items.map((item, index) => (
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
                    ${detailPurchase.total.toFixed(2)}
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
              Esta acción no se puede deshacer. La compra será eliminada y el stock será ajustado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeletePurchase(deleteId)}
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