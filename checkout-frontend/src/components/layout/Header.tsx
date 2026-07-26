import { PawPrint } from 'lucide-react';

export function Header() {
  return (
    <header className="relative z-10 border-b border-gray-800/50 bg-gradient-to-r from-gray-950 via-purple-950/30 to-gray-950 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              Oso's Pet Boutique
            </h1>
            <p className="text-xs text-gray-500">Chaquetas con amor 🐾</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Pago seguro</span>
        </div>
      </div>
    </header>
  );
}