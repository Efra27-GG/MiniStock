import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ProductsManager } from './ProductsManager';
import { ProvidersManager } from './ProvidersManager';
import { IncomesManager } from './IncomesManager';
import { ExpensesManager } from './ExpensesManager';
import { ClientsManager } from './ClientsManager';
import { ProfileSettings } from './ProfileSettings';
import { Stocky } from './Stocky';
import { Package, Users, TrendingUp, TrendingDown, LogOut, User as UserIcon, UserCircle } from 'lucide-react';
import stockyLogo from 'figma:asset/869157f32535268e74eceaec6ea380f56a06fab5.png';
import { MINISTOCK_VERSION } from '../constants/version';

interface DashboardProps {
  onLogout: () => void;
  userName: string;
  onUpdateName: (name: string) => void;
}

type View = 'products' | 'clients' | 'providers' | 'incomes' | 'expenses' | 'stocky';

export function Dashboard({ onLogout, userName, onUpdateName }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('products');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'products':
        return <ProductsManager />;
      case 'clients':
        return <ClientsManager />;
      case 'providers':
        return <ProvidersManager />;
      case 'incomes':
        return <IncomesManager />;
      case 'expenses':
        return <ExpensesManager />;
      case 'stocky':
        return <Stocky />;
      default:
        return <ProductsManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F7FE] to-white">
      {/* Header */}
      <header className="bg-[#0047AB] text-white shadow-lg">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <img 
              src={stockyLogo} 
              alt="MiniStock Logo" 
              className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
            />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">MiniStock</h1>
              <p className="text-xs sm:text-sm text-[#35D7FF] truncate max-w-[120px] sm:max-w-none">
                Bienvenido, {userName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white border-white text-[#0047AB] hover:bg-[#00FFFF] hover:text-[#0047AB] font-semibold text-xs sm:text-base px-2 sm:px-4 h-8 sm:h-10"
                >
                  <UserCircle className="sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Mi Perfil</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Mi Perfil</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    Versión {MINISTOCK_VERSION} - Actualiza tu información de perfil.
                  </DialogDescription>
                </DialogHeader>
                <ProfileSettings onUpdateName={onUpdateName} />
              </DialogContent>
            </Dialog>
            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-white border-white text-[#0047AB] hover:bg-[#00FFFF] hover:text-[#0047AB] font-semibold text-xs sm:text-base px-2 sm:px-4 h-8 sm:h-10"
            >
              <LogOut className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              currentView === 'products' ? 'border-2 border-[#0047AB] bg-[#35D7FF]/10' : ''
            }`}
            onClick={() => setCurrentView('products')}
            data-section="productos"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-center">
                <Package className="mx-auto mb-2 h-8 w-8 text-[#0047AB]" />
                <span className="text-sm">Productos</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              currentView === 'clients' ? 'border-2 border-[#0047AB] bg-[#35D7FF]/10' : ''
            }`}
            onClick={() => setCurrentView('clients')}
            data-section="clientes"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-center">
                <UserIcon className="mx-auto mb-2 h-8 w-8 text-[#0047AB]" />
                <span className="text-sm">Clientes</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              currentView === 'providers' ? 'border-2 border-[#0047AB] bg-[#35D7FF]/10' : ''
            }`}
            onClick={() => setCurrentView('providers')}
            data-section="proveedores"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-[#0047AB]" />
                <span className="text-sm">Proveedores</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              currentView === 'incomes' ? 'border-2 border-[#0047AB] bg-[#35D7FF]/10' : ''
            }`}
            onClick={() => setCurrentView('incomes')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-center">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-[#0047AB]" />
                <span className="text-sm">Ingresos</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              currentView === 'expenses' ? 'border-2 border-[#0047AB] bg-[#35D7FF]/10' : ''
            }`}
            onClick={() => setCurrentView('expenses')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-center">
                <TrendingDown className="mx-auto mb-2 h-8 w-8 text-[#0047AB]" />
                <span className="text-sm">Egresos</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              currentView === 'stocky' ? 'border-2 border-[#0047AB] bg-[#35D7FF]/10' : ''
            }`}
            onClick={() => setCurrentView('stocky')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-center">
                <img 
                  src={stockyLogo} 
                  alt="Stocky" 
                  className="mx-auto mb-2 h-8 w-8 object-contain"
                />
                <span className="text-sm">Stocky</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Content Area */}
        <div>{renderView()}</div>
      </div>
    </div>
  );
}