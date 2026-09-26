import React from 'react';
import { StatusSummaryStats, ShipmentStatus } from '../types/shipment';
import { STATUS_CONFIG } from './StatusBadge';
import { Layers } from 'lucide-react';

interface StatsCardsProps {
  stats: StatusSummaryStats | null;
  activeStatusFilter: ShipmentStatus | '';
  onSelectStatus: (status: ShipmentStatus | '') => void;
  isLoading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  activeStatusFilter,
  onSelectStatus,
  isLoading = false,
}) => {
  const statuses: ShipmentStatus[] = [
    'BOOKED',
    'IN_TRANSIT',
    'CUSTOMS_HOLD',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse p-4 shadow-xs">
            <div className="h-4 w-16 bg-slate-100 rounded mb-2" />
            <div className="h-7 w-12 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Card */}
      <button
        onClick={() => onSelectStatus('')}
        className={`p-4 rounded-2xl text-left border transition-all duration-200 ${
          activeStatusFilter === ''
            ? 'bg-sky-50/70 border-sky-500 shadow-sm ring-1 ring-sky-500'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">Total</span>
          <Layers className="w-4 h-4 text-sky-600" />
        </div>
        <div className="text-2xl font-black text-slate-900">
          {stats?.total ?? 0}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 font-medium">All shipments</div>
      </button>

      {/* Status Specific Cards */}
      {statuses.map((st) => {
        const config = STATUS_CONFIG[st];
        const count = stats ? stats[st] ?? 0 : 0;
        const isActive = activeStatusFilter === st;
        const Icon = config.icon;

        return (
          <button
            key={st}
            onClick={() => onSelectStatus(isActive ? '' : st)}
            className={`p-4 rounded-2xl text-left border transition-all duration-200 ${
              isActive
                ? `${config.bg} ${config.border} shadow-sm ring-2 ${config.text.replace('text-', 'ring-')}`
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
            }`}
          >
            <div className={`flex items-center justify-between mb-1 ${config.text}`}>
              <span className="text-xs font-bold uppercase tracking-wider truncate">
                {config.label}
              </span>
              <Icon className="w-4 h-4 shrink-0 ml-1" />
            </div>
            <div className={`text-2xl font-black ${isActive ? config.text : 'text-slate-900'}`}>
              {count}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium capitalize">
              {st.toLowerCase().replace(/_/g, ' ')}
            </div>
          </button>
        );
      })}
    </div>
  );
};
