import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Package } from 'lucide-react';
import stockyLogo from 'figma:asset/869157f32535268e74eceaec6ea380f56a06fab5.png';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
  isLoading: boolean;
}

export function LoginForm({ onLogin, onSwitchToSignup, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0047AB] via-[#35D7FF] to-[#00FFFF] p-4">
      <Card className="w-full max-w-md border-2 border-white shadow-2xl">
        <CardHeader className="text-center">
          <img 
            src={stockyLogo} 
            alt="MiniStock Logo" 
            className="mx-auto mb-4 w-24 h-24 object-contain"
          />
          <CardTitle className="text-3xl text-[#0047AB]">MiniStock</CardTitle>
          <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#35D7FF] focus:border-[#00FFFF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-[#35D7FF] focus:border-[#00FFFF]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#0047AB] hover:bg-[#35D7FF] hover:text-[#0047AB] text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#35D7FF] text-[#0047AB] hover:bg-[#35D7FF] hover:text-white font-semibold"
              onClick={onSwitchToSignup}
            >
              ¿No tienes cuenta? Regístrate
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}