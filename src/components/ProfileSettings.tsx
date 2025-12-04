import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Mail, Lock, Save, Info, Bot } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MINISTOCK_VERSION, STOCKY_VERSION } from '../constants/version';

interface UserProfile {
  name: string;
  email: string;
}

interface ProfileSettingsProps {
  onUpdateName: (name: string) => void;
}

export function ProfileSettings({ onUpdateName }: ProfileSettingsProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('ministock_current_user') || '{}');
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('ministock_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.name === name);

    if (userIndex !== -1) {
      users[userIndex].name = name;
      users[userIndex].email = email;
      localStorage.setItem('ministock_users', JSON.stringify(users));
      onUpdateName(name);
      toast.success('Perfil actualizado correctamente');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const users = JSON.parse(localStorage.getItem('ministock_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.name === name);

    if (userIndex !== -1) {
      if (users[userIndex].password !== currentPassword) {
        toast.error('La contraseña actual es incorrecta');
        return;
      }

      users[userIndex].password = newPassword;
      localStorage.setItem('ministock_users', JSON.stringify(users));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Contraseña actualizada correctamente');
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Information */}
      <Card className="border-[#35D7FF]">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5" />
            Información del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nombre</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-[#35D7FF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Correo Electrónico</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#35D7FF]"
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] font-semibold text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-[#35D7FF]">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="border-[#35D7FF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="border-[#35D7FF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-[#35D7FF]"
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] font-semibold text-white"
            >
              <Lock className="mr-2 h-4 w-4" />
              Actualizar Contraseña
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card className="border-[#35D7FF]">
        <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5" />
            Acerca de MiniStock
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Versión</p>
                <p className="font-semibold text-[#0047AB] text-lg">{MINISTOCK_VERSION}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última actualización</p>
                <p className="text-sm">{new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Descripción</p>
              <p className="text-sm leading-relaxed">
                MiniStock es una aplicación completa de gestión de inventario, ventas y compras
                con control automático de stock.
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Características</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 sm:px-3 py-1 bg-[#0047AB]/10 text-[#0047AB] rounded-full text-xs">
                  📦 Control de Inventario
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[#35D7FF]/10 text-[#0047AB] rounded-full text-xs">
                  💰 Gestión de Ventas
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[#00FFFF]/10 text-[#0047AB] rounded-full text-xs">
                  🛒 Gestión de Compras
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[#0047AB]/10 text-[#0047AB] rounded-full text-xs">
                  📊 Reportes y Gráficas
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[#35D7FF]/10 text-[#0047AB] rounded-full text-xs">
                  👥 Clientes y Proveedores
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stocky Information */}
      <Card className="border-[#35D7FF] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#00FFFF] to-[#35D7FF] text-[#0047AB] py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5" />
            Stocky - Asistente Virtual
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0047AB] to-[#35D7FF] rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-[#0047AB] text-base sm:text-lg">Stocky</h3>
                <p className="text-sm text-muted-foreground">
                  Tu asistente inteligente para consultas rápidas de inventario
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-[#35D7FF]/10 rounded-lg border border-[#35D7FF]">
                <p className="text-xs text-muted-foreground mb-1">Versión de Stocky</p>
                <p className="font-semibold text-[#0047AB] text-lg">{STOCKY_VERSION}</p>
              </div>
              <div className="p-3 bg-[#0047AB]/10 rounded-lg border border-[#0047AB]">
                <p className="text-xs text-muted-foreground mb-1">Estado</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="font-semibold text-[#0047AB]">Activo</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#0047AB]/5 to-[#35D7FF]/5 p-3 sm:p-4 rounded-lg border-l-4 border-[#00FFFF]">
              <p className="text-xs sm:text-sm text-[#0047AB]">
                💬 <strong>¿Cómo puedo ayudarte?</strong>
              </p>
              <p className="text-xs mt-2 text-muted-foreground">
                Pregúntame sobre tu inventario, productos con bajo stock, totales de ventas y más.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Capacidades</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-[#0047AB]">✓</span>
                  <span>Consultas de inventario</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#0047AB]">✓</span>
                  <span>Alertas de stock bajo</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#0047AB]">✓</span>
                  <span>Resumen de ventas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#0047AB]">✓</span>
                  <span>Estadísticas rápidas</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}