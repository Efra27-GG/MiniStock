import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Pencil, Trash2, Truck, Package, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Users } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

interface Provider {
  id: string;
  name: string;
  contact: string;
  email: string;
  categoryId: string;
  products: string[];  // Changed from string to string[]
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  quantity: number;
}

export function ProvidersManager() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deleteProviderId, setDeleteProviderId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProviders();
    loadCategories();
    loadProducts();
  }, []);

  const loadProviders = () => {
    const stored = localStorage.getItem('ministock_providers');
    if (stored) {
      const loadedProviders = JSON.parse(stored);
      // Migrate old format (string) to new format (array)
      const migratedProviders = loadedProviders.map((p: any) => ({
        ...p,
        products: Array.isArray(p.products) ? p.products : (p.products ? [p.products] : [])
      }));
      setProviders(migratedProviders);
    }
  };

  const loadCategories = () => {
    const stored = localStorage.getItem('ministock_categories');
    if (stored) {
      setCategories(JSON.parse(stored));
    }
  };

  const loadProducts = () => {
    const stored = localStorage.getItem('ministock_products');
    if (stored) {
      setAllProducts(JSON.parse(stored));
    }
  };

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();

    const newProvider: Provider = {
      id: isEditMode && editingProvider ? editingProvider.id : Date.now().toString(),
      name,
      contact,
      email,
      categoryId,
      products: selectedProducts,
      createdAt: isEditMode && editingProvider ? editingProvider.createdAt : new Date().toISOString(),
    };

    let updatedProviders: Provider[];
    if (isEditMode && editingProvider) {
      updatedProviders = providers.map(p => p.id === editingProvider.id ? newProvider : p);
      toast.success('Proveedor actualizado');
    } else {
      updatedProviders = [...providers, newProvider];
      toast.success('Proveedor agregado');
    }

    localStorage.setItem('ministock_providers', JSON.stringify(updatedProviders));
    setProviders(updatedProviders);
    resetForm();
  };

  const handleEditProvider = (provider: Provider) => {
    setIsEditMode(true);
    setEditingProvider(provider);
    setName(provider.name);
    setContact(provider.contact);
    setEmail(provider.email);
    setCategoryId(provider.categoryId);
    setSelectedProducts(provider.products);
    setIsDialogOpen(true);
  };

  const handleDeleteProvider = (providerId: string) => {
    const updatedProviders = providers.filter(p => p.id !== providerId);
    localStorage.setItem('ministock_providers', JSON.stringify(updatedProviders));
    setProviders(updatedProviders);
    setDeleteProviderId(null);
    toast.success('Proveedor eliminado');
  };

  const resetForm = () => {
    setName('');
    setContact('');
    setEmail('');
    setCategoryId('');
    setSelectedProducts([]);
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingProvider(null);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getProductName = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    return product ? product.name : 'Producto desconocido';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  return (
    <>
      <Card className="border-[#35D7FF]">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-3 sm:gap-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg w-full sm:w-auto">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              Gestión de Proveedores
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Agregar Proveedor</span>
                  <span className="xs:hidden">Nuevo</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Modifica los datos del proveedor.' : 'Completa los datos para crear un nuevo proveedor.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveProvider} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-name">Nombre del Proveedor</Label>
                    <Input
                      id="provider-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-[#35D7FF]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-contact">Teléfono de Contacto</Label>
                    <Input
                      id="provider-contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="border-[#35D7FF]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-email">Email</Label>
                    <Input
                      id="provider-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-[#35D7FF]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-category">Categoría</Label>
                    <Select
                      id="provider-category"
                      value={categoryId}
                      onValueChange={(value) => setCategoryId(value)}
                      className="border-[#35D7FF]"
                    >
                      <SelectTrigger className="border-[#35D7FF]">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Productos que Ofrece</Label>
                    {allProducts.length === 0 ? (
                      <div className="py-6 text-center space-y-3 border-2 border-dashed border-[#35D7FF] rounded-lg bg-[#35D7FF]/5">
                        <AlertCircle className="h-12 w-12 mx-auto text-[#35D7FF]" />
                        <p className="text-black text-sm">
                          No hay productos registrados. Crea productos primero para asignarlos a este proveedor.
                        </p>
                        <Button
                          type="button"
                          onClick={() => {
                            setIsDialogOpen(false);
                            const productsButton = document.querySelector('[data-section="productos"]') as HTMLButtonElement;
                            if (productsButton) productsButton.click();
                          }}
                          className="bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB]"
                        >
                          Ir a Productos
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="border-2 border-[#35D7FF] rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                          {categories.map((category) => {
                            const categoryProducts = allProducts.filter(p => p.categoryId === category.id);
                            if (categoryProducts.length === 0) return null;
                            
                            return (
                              <div key={category.id} className="space-y-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-[#35D7FF]">
                                  <Package className="h-4 w-4 text-[#0047AB]" />
                                  <span className="font-semibold text-[#0047AB]">{category.name}</span>
                                </div>
                                {categoryProducts.map((product) => (
                                  <div key={product.id} className="flex items-center space-x-2 ml-6">
                                    <Checkbox
                                      id={`product-${product.id}`}
                                      checked={selectedProducts.includes(product.id)}
                                      onCheckedChange={() => toggleProduct(product.id)}
                                      className="border-[#0047AB]"
                                    />
                                    <label
                                      htmlFor={`product-${product.id}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {product.name} <span className="text-muted-foreground">(Stock: {product.quantity})</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                          {allProducts.filter(p => !p.categoryId).length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 pb-2 border-b border-[#35D7FF]">
                                <Package className="h-4 w-4 text-[#0047AB]" />
                                <span className="font-semibold text-[#0047AB]">Sin Categoría</span>
                              </div>
                              {allProducts.filter(p => !p.categoryId).map((product) => (
                                <div key={product.id} className="flex items-center space-x-2 ml-6">
                                  <Checkbox
                                    id={`product-${product.id}`}
                                    checked={selectedProducts.includes(product.id)}
                                    onCheckedChange={() => toggleProduct(product.id)}
                                    className="border-[#0047AB]"
                                  />
                                  <label
                                    htmlFor={`product-${product.id}`}
                                    className="text-sm cursor-pointer flex-1"
                                  >
                                    {product.name} <span className="text-muted-foreground">(Stock: {product.quantity})</span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedProducts.length > 0 && (
                          <div className="bg-[#35D7FF]/10 p-3 rounded-lg border-l-4 border-[#00FFFF]">
                            <p className="text-sm text-[#0047AB]">
                              <strong>✅ {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}</strong>
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedProducts.map(prodId => (
                                <span key={prodId} className="inline-flex items-center gap-1 bg-[#0047AB] text-white text-xs px-2 py-1 rounded">
                                  {getProductName(prodId)}
                                  <X 
                                    className="h-3 w-3 cursor-pointer hover:text-red-300" 
                                    onClick={() => toggleProduct(prodId)}
                                  />
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {providers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay proveedores registrados. Agrega tu primer proveedor.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>{provider.contact}</TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProvider(provider)}
                          className="text-[#0047AB] hover:text-[#35D7FF]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteProviderId(provider.id)}
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

      <AlertDialog open={!!deleteProviderId} onOpenChange={() => setDeleteProviderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El proveedor será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProviderId && handleDeleteProvider(deleteProviderId)}
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