import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { Toaster, toast } from 'sonner@2.0.3';
import { Package, Loader2 } from 'lucide-react';
import stockyLogo from 'figma:asset/869157f32535268e74eceaec6ea380f56a06fab5.png';

type AuthView = 'login' | 'signup' | 'dashboard';

export default function App() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    const currentUser = localStorage.getItem('ministock_current_user');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserName(user.name);
      setAuthView('dashboard');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('ministock_users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem('ministock_current_user', JSON.stringify(user));
        setUserName(user.name);
        setAuthView('dashboard');
        toast.success('¡Bienvenido!');
      } else {
        toast.error('Correo o contraseña incorrectos');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
      console.error('Exception during login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('ministock_users') || '[]');
      
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        toast.error('Este correo ya está registrado');
        setIsLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('ministock_users', JSON.stringify(users));

      toast.success('Cuenta creada exitosamente. Por favor inicia sesión.');
      setAuthView('login');
    } catch (error) {
      toast.error('Error al crear cuenta');
      console.error('Exception during signup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ministock_current_user');
    setUserName('');
    setAuthView('login');
    toast.success('Sesión cerrada');
  };

  const handleUpdateName = (newName: string) => {
    setUserName(newName);
    const currentUser = JSON.parse(localStorage.getItem('ministock_current_user') || '{}');
    currentUser.name = newName;
    localStorage.setItem('ministock_current_user', JSON.stringify(currentUser));
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      {authView === 'login' && (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthView('signup')}
          isLoading={isLoading}
        />
      )}
      {authView === 'signup' && (
        <SignupForm
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthView('login')}
          isLoading={isLoading}
        />
      )}
      {authView === 'dashboard' && (
        <Dashboard onLogout={handleLogout} userName={userName} onUpdateName={handleUpdateName} />
      )}
    </>
  );
}