import { useEffect } from 'react';
import { Package, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0047AB] via-[#35D7FF] to-[#00FFFF] flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        {/* Logo animado */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform animate-bounce">
            <Package className="h-16 w-16 text-[#0047AB]" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
          </div>
        </div>

        {/* Nombre de la app */}
        <div className="space-y-2">
          <h1 className="text-6xl text-white tracking-wider animate-pulse">
            MiniStock
          </h1>
          <p className="text-xl text-white/90">
            Control de Inventario Inteligente
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
