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
import { Plus, Pencil, Trash2, Package, FolderOpen, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  categoryId: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Product states
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isProductEditMode, setIsProductEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Category states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Quick category creation in product form
  const [showQuickCategoryForm, setShowQuickCategoryForm] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [quickCategoryDescription, setQuickCategoryDescription] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = () => {
    const stored = localStorage.getItem('ministock_products');
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  };

  const loadCategories = () => {
    const stored = localStorage.getItem('ministock_categories');
    if (stored) {
      setCategories(JSON.parse(stored));
    }
  };

  // Product handlers
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      toast.error('Debes seleccionar una categoría');
      return;
    }

    const newProduct: Product = {
      id: isProductEditMode && editingProduct ? editingProduct.id : Date.now().toString(),
      name: productName,
      description: productDescription,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      categoryId,
      createdAt: isProductEditMode && editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    let updatedProducts: Product[];
    if (isProductEditMode && editingProduct) {
      updatedProducts = products.map(p => p.id === editingProduct.id ? newProduct : p);
      toast.success('Producto actualizado');
    } else {
      updatedProducts = [...products, newProduct];
      toast.success('Producto agregado');
    }

    localStorage.setItem('ministock_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    resetProductForm();
  };

  const handleEditProduct = (product: Product) => {
    setIsProductEditMode(true);
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(product.description);
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setCategoryId(product.categoryId);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    localStorage.setItem('ministock_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    setDeleteProductId(null);
    toast.success('Producto eliminado');
  };

  const resetProductForm = () => {
    setProductName('');
    setProductDescription('');
    setPrice('');
    setQuantity('');
    setCategoryId('');
    setIsProductDialogOpen(false);
    setIsProductEditMode(false);
    setEditingProduct(null);
    setShowQuickCategoryForm(false);
    setQuickCategoryName('');
    setQuickCategoryDescription('');
  };

  // Category handlers
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    const newCategory: Category = {
      id: isCategoryEditMode && editingCategory ? editingCategory.id : Date.now().toString(),
      name: categoryName,
      description: categoryDescription,
      createdAt: isCategoryEditMode && editingCategory ? editingCategory.createdAt : new Date().toISOString(),
    };

    let updatedCategories: Category[];
    if (isCategoryEditMode && editingCategory) {
      updatedCategories = categories.map(c => c.id === editingCategory.id ? newCategory : c);
      toast.success('Categoría actualizada');
    } else {
      updatedCategories = [...categories, newCategory];
      toast.success('Categoría agregada');
    }

    localStorage.setItem('ministock_categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    resetCategoryForm();
  };

  const handleEditCategory = (category: Category) => {
    setIsCategoryEditMode(true);
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Check if category has products
    const hasProducts = products.some((p: any) => p.categoryId === categoryId);
    
    if (hasProducts) {
      toast.error('No puedes eliminar una categoría con productos');
      setDeleteCategoryId(null);
      return;
    }

    const updatedCategories = categories.filter(c => c.id !== categoryId);
    localStorage.setItem('ministock_categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    setDeleteCategoryId(null);
    toast.success('Categoría eliminada');
  };

  const resetCategoryForm = () => {
    setCategoryName('');
    setCategoryDescription('');
    setIsCategoryDialogOpen(false);
    setIsCategoryEditMode(false);
    setEditingCategory(null);
  };

  const getTotalInventoryValue = () => {
    return products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  };

  const getProductCountByCategory = (catId: string) => {
    return products.filter(p => p.categoryId === catId).length;
  };

  return (
    <>
      <Card className="border-[#35D7FF]">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              <CardTitle className="flex items-center gap-2 mb-2 text-base sm:text-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                Gestión de Productos y Categorías
              </CardTitle>
              <p className="text-xs sm:text-sm text-[#00FFFF]">
                Valor total del inventario: ${getTotalInventoryValue().toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
                setIsCategoryDialogOpen(open);
                if (!open) resetCategoryForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9">
                    <FolderOpen className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Categorías</span>
                    <span className="xs:hidden">Cat.</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Gestión de Categorías</DialogTitle>
                    <DialogDescription>
                      Crea, edita o elimina categorías para organizar tus productos.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Category Form */}
                  <form onSubmit={handleSaveCategory} className="space-y-4 p-4 bg-[#0047AB]/5 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Nombre de la Categoría</Label>
                      <Input
                        id="category-name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                        className="border-[#35D7FF]"
                        placeholder="ej: Electrónica"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category-description">Descripción</Label>
                      <Textarea
                        id="category-description"
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        className="border-[#35D7FF]"
                        placeholder="Descripción de la categoría"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] font-semibold text-white"
                      >
                        {isCategoryEditMode ? 'Actualizar Categoría' : 'Agregar Categoría'}
                      </Button>
                      {isCategoryEditMode && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetCategoryForm}
                          className="border-[#35D7FF] text-[#0047AB]"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>

                  {/* Categories List */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#0047AB]">Categorías Existentes ({categories.length})</h3>
                    {categories.length === 0 ? (
                      <div className="text-center py-8">
                        <FolderOpen className="h-12 w-12 mx-auto text-[#35D7FF] mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No hay categorías. Crea tu primera categoría arriba.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                        {categories.map((category) => (
                          <Card key={category.id} className="border-[#35D7FF]">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FolderOpen className="h-4 w-4 text-[#0047AB]" />
                                    <h4 className="font-semibold text-[#0047AB]">{category.name}</h4>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {category.description || 'Sin descripción'}
                                  </p>
                                  <p className="text-xs text-[#35D7FF]">
                                    {getProductCountByCategory(category.id)} producto(s)
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCategory(category)}
                                    className="text-[#0047AB] hover:text-[#35D7FF] h-8 w-8 p-0"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteCategoryId(category.id)}
                                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                setIsProductDialogOpen(open);
                if (!open) resetProductForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9">
                    <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Producto</span>
                    <span className="xs:hidden">Prod.</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isProductEditMode ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
                    <DialogDescription>
                      {isProductEditMode ? 'Modifica los datos del producto.' : 'Completa los datos para crear un nuevo producto.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Nombre del Producto</Label>
                      <Input
                        id="product-name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        className="border-[#35D7FF]"
                        placeholder="ej: Laptop HP"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-description">Descripción</Label>
                      <Textarea
                        id="product-description"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="border-[#35D7FF]"
                        placeholder="Descripción del producto"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-category">Categoría</Label>
                      {categories.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-2 bg-yellow-50 rounded border border-yellow-200">
                          No hay categorías. Usa el botón "Gestionar Categorías" para crear una.
                        </div>
                      ) : (
                        <>
                          <Select
                            value={categoryId}
                            onValueChange={(value) => setCategoryId(value)}
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
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowQuickCategoryForm(true);
                              setQuickCategoryName('');
                              setQuickCategoryDescription('');
                            }}
                            className="w-full mt-2 border-[#35D7FF] text-[#0047AB] hover:bg-[#35D7FF]/10"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Categoría
                          </Button>
                        </>
                      )}
                    </div>
                    {showQuickCategoryForm && (
                      <div className="space-y-2">
                        <Label htmlFor="quick-category-name">Nombre de la Categoría</Label>
                        <Input
                          id="quick-category-name"
                          value={quickCategoryName}
                          onChange={(e) => setQuickCategoryName(e.target.value)}
                          required
                          className="border-[#35D7FF]"
                          placeholder="ej: Electrónica"
                        />
                      </div>
                    )}
                    {showQuickCategoryForm && (
                      <div className="space-y-2">
                        <Label htmlFor="quick-category-description">Descripción</Label>
                        <Textarea
                          id="quick-category-description"
                          value={quickCategoryDescription}
                          onChange={(e) => setQuickCategoryDescription(e.target.value)}
                          className="border-[#35D7FF]"
                          placeholder="Descripción de la categoría"
                          rows={3}
                        />
                      </div>
                    )}
                    {showQuickCategoryForm && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            if (!quickCategoryName.trim()) {
                              toast.error('El nombre de la categoría es requerido');
                              return;
                            }
                            const newCategory: Category = {
                              id: Date.now().toString(),
                              name: quickCategoryName,
                              description: quickCategoryDescription,
                              createdAt: new Date().toISOString(),
                            };
                            const updatedCategories = [...categories, newCategory];
                            localStorage.setItem('ministock_categories', JSON.stringify(updatedCategories));
                            setCategories(updatedCategories);
                            setCategoryId(newCategory.id);
                            setShowQuickCategoryForm(false);
                            setQuickCategoryName('');
                            setQuickCategoryDescription('');
                            toast.success('Categoría creada y seleccionada');
                          }}
                          className="flex-1 bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] font-semibold text-white"
                        >
                          Agregar Categoría
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowQuickCategoryForm(false);
                            setQuickCategoryName('');
                            setQuickCategoryDescription('');
                          }}
                          className="border-[#35D7FF] text-[#0047AB]"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                    {!showQuickCategoryForm && categories.length === 0 && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => setShowQuickCategoryForm(true)}
                          className="flex-1 bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] font-semibold text-white"
                        >
                          Crear Categoría
                        </Button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-price">Precio Unitario</Label>
                        <Input
                          id="product-price"
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          className="border-[#35D7FF]"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-quantity">Cantidad</Label>
                        <Input
                          id="product-quantity"
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                          className="border-[#35D7FF]"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] font-semibold text-white"
                      disabled={categories.length === 0 && !showQuickCategoryForm}
                    >
                      {isProductEditMode ? 'Actualizar Producto' : 'Guardar Producto'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 mx-auto text-[#35D7FF] mb-4" />
              <p className="text-muted-foreground mb-2">
                No hay categorías creadas.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Primero crea una categoría usando el botón "Gestionar Categorías".
              </p>
              <Button
                onClick={() => setIsCategoryDialogOpen(true)}
                className="bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] font-semibold text-white"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Crear Primera Categoría
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-[#35D7FF] mb-4" />
              <p className="text-muted-foreground">
                No hay productos registrados. Agrega tu primer producto.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#35D7FF]/20 text-[#0047AB]">
                          {category?.name || 'Sin categoría'}
                        </span>
                      </TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="text-[#0047AB] hover:text-[#35D7FF]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteProductId(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Product Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDeleteProduct(deleteProductId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
              No puedes eliminar categorías que tengan productos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategoryId && handleDeleteCategory(deleteCategoryId)}
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