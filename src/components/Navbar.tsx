import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Users, BarChart3, Settings, Clock, Store, ShieldCheck } from 'lucide-react';
import { CashierShift, KopmaSettings } from '../types';

interface NavbarProps {
  activeTab: 'pos' | 'products' | 'members' | 'reports' | 'settings';
  setActiveTab: (tab: 'pos' | 'products' | 'members' | 'reports' | 'settings') => void;
  cartCount: number;
  currentShift: CashierShift;
  settings: KopmaSettings;
  onOpenShiftModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  currentShift,
  settings,
  onOpenShiftModal
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        new Intl.DateTimeFormat('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(now)
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-30 select-none">
      {/* Top Banner with Brand and System Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('pos')}>
            <div className="w-10 h-10 rounded-lg bg-emerald-600 border border-emerald-400/40 flex items-center justify-center shadow-inner">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">KASIR KOPMA</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  POS v1.0
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-medium">
                {settings.storeName} &bull; {settings.universityName}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'pos'
                  ? 'bg-emerald-950 text-white shadow-sm ring-1 ring-emerald-500/50'
                  : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kasir (POS)</span>
              {cartCount > 0 && (
                <span className="ml-1 bg-amber-400 text-emerald-950 text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-emerald-950 text-white shadow-sm ring-1 ring-emerald-500/50'
                  : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Katalog & Stok</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'members'
                  ? 'bg-emerald-950 text-white shadow-sm ring-1 ring-emerald-500/50'
                  : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Anggota Kopma</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-emerald-950 text-white shadow-sm ring-1 ring-emerald-500/50'
                  : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Laporan</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-emerald-950 text-white shadow-sm ring-1 ring-emerald-500/50'
                  : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
          </nav>

          {/* Right Meta: Shift & Live Clock */}
          <div className="flex items-center space-x-3">
            {/* Shift Badge */}
            <button
              onClick={onOpenShiftModal}
              title="Klik untuk melihat / tutup shift kasir"
              className="hidden lg:flex items-center space-x-2 bg-emerald-700/70 hover:bg-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-600 transition text-left"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
              <div className="text-xs">
                <div className="font-semibold text-white flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{currentShift.cashierName}</span>
                </div>
                <div className="text-emerald-200 text-[10px]">Shift Buka &bull; Kelola</div>
              </div>
            </button>

            {/* Clock */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-700/50 text-xs font-mono text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>{currentTime || '00:00:00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sub-navigation bar */}
      <div className="md:hidden flex items-center justify-around bg-emerald-900 border-t border-emerald-700/60 px-2 py-1.5 text-xs">
        <button
          onClick={() => setActiveTab('pos')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            activeTab === 'pos' ? 'text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Kasir {cartCount > 0 ? `(${cartCount})` : ''}</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            activeTab === 'products' ? 'text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Stok</span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            activeTab === 'members' ? 'text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Anggota</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            activeTab === 'reports' ? 'text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Laporan</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            activeTab === 'settings' ? 'text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Atur</span>
        </button>
      </div>
    </header>
  );
};
