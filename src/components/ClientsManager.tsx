import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Plus, Pencil, Trash2, User, Phone, Mail, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

interface Income {
  id: string;
  clientName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
}

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadClients();
    loadIncomes();
  }, []);

  const loadClients = () => {
    const stored = localStorage.getItem('ministock_clients');
    if (stored) {
      setClients(JSON.parse(stored));
    }
  };

  const loadIncomes = () => {
    // Try new format first
    const storedSales = localStorage.getItem('ministock_sales');
    if (storedSales) {
      // Convert new multi-product sales to old format for compatibility
      const sales = JSON.parse(storedSales);
      const flattenedIncomes: Income[] = [];
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
      return;
    }
    
    // Fallback to old format
    const stored = localStorage.getItem('ministock_incomes');
    if (stored) {
      setIncomes(JSON.parse(stored));
    }
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();

    const newClient: Client = {
      id: isEditMode && editingClient ? editingClient.id : Date.now().toString(),
      name,
      phone,
      email,
      createdAt: isEditMode && editingClient ? editingClient.createdAt : new Date().toISOString(),
    };

    let updatedClients: Client[];
    if (isEditMode && editingClient) {
      updatedClients = clients.map(c => c.id === editingClient.id ? newClient : c);
      toast.success('Cliente actualizado');
    } else {
      updatedClients = [...clients, newClient];
      toast.success('Cliente agregado');
    }

    localStorage.setItem('ministock_clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
    resetForm();
  };

  const handleEditClient = (client: Client) => {
    setIsEditMode(true);
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone);
    setEmail(client.email);
    setIsDialogOpen(true);
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = clients.filter(c => c.id !== clientId);
    localStorage.setItem('ministock_clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
    setDeleteClientId(null);
    toast.success('Cliente eliminado');
  };

  const handleViewHistory = (client: Client) => {
    setSelectedClient(client);
    setIsHistoryDialogOpen(true);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingClient(null);
  };

  const getClientPurchases = (clientName: string) => {
    return incomes.filter(i => i.clientName === clientName);
  };

  const getClientTotalSpent = (clientName: string) => {
    return getClientPurchases(clientName).reduce((sum, i) => sum + i.total, 0);
  };

  return (
    <>
      <Card className="border-[#35D7FF]">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-3 sm:gap-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg w-full sm:w-auto">
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
              Gestión de Clientes
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Agregar Cliente</span>
                  <span className="xs:hidden">Nuevo</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Modifica los datos del cliente.' : 'Completa los datos para crear un nuevo cliente.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Nombre</Label>
                    <Input
                      id="client-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-[#35D7FF]"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Teléfono</Label>
                    <Input
                      id="client-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="border-[#35D7FF]"
                      placeholder="+52 123 456 7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Correo Electrónico</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-[#35D7FF]"
                      placeholder="cliente@ejemplo.com"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB]"
                  >
                    {isEditMode ? 'Actualizar Cliente' : 'Guardar Cliente'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 mx-auto text-[#35D7FF] mb-4" />
              <p className="text-muted-foreground">
                No hay clientes registrados. Agrega tu primer cliente.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead className="text-right">Total Comprado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#0047AB] to-[#35D7FF] rounded-full flex items-center justify-center text-white">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#0047AB]" />
                        {client.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#0047AB]" />
                        {client.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${getClientTotalSpent(client.name).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewHistory(client)}
                          className="text-[#00FFFF] hover:text-[#0047AB]"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                          className="text-[#0047AB] hover:text-[#35D7FF]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteClientId(client.id)}
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

      {/* Purchase History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Historial de Compras - {selectedClient?.name}
            </DialogTitle>
            <DialogDescription>
              Revisa todas las compras realizadas por este cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedClient && getClientPurchases(selectedClient.name).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Este cliente aún no ha realizado compras.
              </p>
            ) : (
              <>
                <div className="bg-gradient-to-r from-[#0047AB]/10 to-[#35D7FF]/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total gastado</p>
                  <p className="text-2xl text-[#0047AB]">
                    ${selectedClient && getClientTotalSpent(selectedClient.name).toFixed(2)}
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedClient && getClientPurchases(selectedClient.name).map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>
                          {new Date(income.date).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>{income.productName}</TableCell>
                        <TableCell className="text-right">{income.quantity}</TableCell>
                        <TableCell className="text-right">${income.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${income.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cliente será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClientId && handleDeleteClient(deleteClientId)}
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