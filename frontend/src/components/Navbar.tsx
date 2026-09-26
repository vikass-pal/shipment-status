import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Boxes, LayoutDashboard, PlusCircle, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onRefresh,
  isRefreshing = false,
}) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
                <Boxes className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-sky-400 transition-colors">
                  LogiTrack
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 ml-2 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  Tracker API
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation & Action Controls */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh shipment data"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              </button>
            )}

            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-sm font-semibold shadow-md shadow-sky-500/20 active:scale-95 transition-all duration-150"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Shipment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
