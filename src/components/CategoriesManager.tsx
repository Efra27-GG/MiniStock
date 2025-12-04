import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const stored = localStorage.getItem('ministock_categories');
    if (stored) {
      setCategories(JSON.parse(stored));
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    const newCategory: Category = {
      id: isEditMode && editingCategory ? editingCategory.id : Date.now().toString(),
      name,
      description,
      createdAt: isEditMode && editingCategory ? editingCategory.createdAt : new Date().toISOString(),
    };

    let updatedCategories: Category[];
    if (isEditMode && editingCategory) {
      updatedCategories = categories.map(c => c.id === editingCategory.id ? newCategory : c);
      toast.success('Categoría actualizada');
    } else {
      updatedCategories = [...categories, newCategory];
      toast.success('Categoría agregada');
    }

    localStorage.setItem('ministock_categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    resetForm();
  };

  const handleEditCategory = (category: Category) => {
    setIsEditMode(true);
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Check if category has products
    const products = JSON.parse(localStorage.getItem('ministock_products') || '[]');
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

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingCategory(null);
  };

  return (
    <>
      <Card className="border-[#35D7FF]">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              Gestión de Categorías
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Categoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Modifica los datos de la categoría.' : 'Completa los datos para crear una nueva categoría.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Nombre de la Categoría</Label>
                    <Input
                      id="category-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-[#35D7FF]"
                      placeholder="ej: Electrónica"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description">Descripción</Label>
                    <Textarea
                      id="category-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-[#35D7FF]"
                      placeholder="Descripción de la categoría"
                      rows={4}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB]"
                  >
                    {isEditMode ? 'Actualizar Categoría' : 'Guardar Categoría'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 mx-auto text-[#35D7FF] mb-4" />
              <p className="text-muted-foreground">
                No hay categorías. Agrega tu primera categoría.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="border-[#35D7FF] hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-br from-[#0047AB]/5 to-[#35D7FF]/10">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-[#0047AB]" />
                        {category.name}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="text-[#0047AB] hover:text-[#35D7FF] h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCategoryId(category.id)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      {category.description || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Creada: {new Date(category.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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