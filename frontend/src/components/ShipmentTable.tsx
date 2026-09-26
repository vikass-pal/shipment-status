import React from 'react';
import { Shipment, ShipmentStatus } from '../types/shipment';
import { StatusBadge } from './StatusBadge';
import { formatDateOnly, getRelativeDeliveryInfo } from '../utils/formatters';
import { Link } from 'react-router-dom';
import {
  Eye,
  Calendar,
  ArrowRight,
  PackageOpen,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface ShipmentTableProps {
  shipments: Shipment[];
  isLoading: boolean;
  onQuickUpdateStatus: (shipment: Shipment) => void;
  onClearFilters?: () => void;
}

export const ShipmentTable: React.FC<ShipmentTableProps> = ({
  shipments,
  isLoading,
  onQuickUpdateStatus,
  onClearFilters,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedId(ref);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
          <div className="h-5 w-20 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-800/60">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
              <div className="space-y-2">
                <div className="h-5 w-28 bg-slate-800 rounded" />
                <div className="h-4 w-48 bg-slate-850 rounded" />
              </div>
              <div className="h-6 w-24 bg-slate-800 rounded-full" />
              <div className="h-8 w-24 bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (shipments.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Shipments Found</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          No shipments match your current search query or status filter. Try clearing your filters or creating a new shipment.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-sm font-semibold border border-slate-700 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 sm:px-6">Reference #</th>
              <th className="py-3.5 px-4">Route (Origin → Destination)</th>
              <th className="py-3.5 px-4">Current Status</th>
              <th className="py-3.5 px-4">Expected Delivery</th>
              <th className="py-3.5 px-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {shipments.map((s) => {
              const deliveryInfo = getRelativeDeliveryInfo(s.expectedDeliveryDate);

              return (
                <tr
                  key={s.id}
                  className="hover:bg-slate-850/50 transition-colors group"
                >
                  {/* Reference Number */}
                  <td className="py-4 px-4 sm:px-6 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/shipments/${s.id}`}
                        className="font-bold text-sky-400 hover:text-sky-300 hover:underline transition-colors"
                      >
                        {s.referenceNumber}
                      </Link>
                      <button
                        onClick={() => copyRef(s.referenceNumber)}
                        title="Copy reference number"
                        className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        {copiedId === s.referenceNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-4 px-4 text-slate-300">
                    <div className="flex items-center gap-2 max-w-xs">
                      <span className="truncate font-medium text-slate-200" title={s.origin}>
                        {s.origin}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate font-medium text-slate-200" title={s.destination}>
                        {s.destination}
                      </span>
                    </div>
                  </td>

                  {/* Current Status Badge */}
                  <td className="py-4 px-4">
                    <StatusBadge status={s.currentStatus as ShipmentStatus} size="md" />
                  </td>

                  {/* Expected Delivery Date */}
                  <td className="py-4 px-4 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-slate-200">
                          {formatDateOnly(s.expectedDeliveryDate)}
                        </div>
                        <div
                          className={`text-[11px] font-medium ${
                            deliveryInfo.isOverdue ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {deliveryInfo.label}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onQuickUpdateStatus(s)}
                        title="Update Status"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/shipments/${s.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
