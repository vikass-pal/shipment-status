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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
              <div className="space-y-2">
                <div className="h-5 w-28 bg-slate-200 rounded" />
                <div className="h-4 w-48 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
              <div className="h-8 w-24 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (shipments.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No Shipments Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          No shipments match your current search query or status filter. Try clearing your filters or creating a new shipment.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold border border-slate-300 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-xs uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4 sm:px-6">Reference #</th>
              <th className="py-3.5 px-4">Route (Origin → Destination)</th>
              <th className="py-3.5 px-4">Current Status</th>
              <th className="py-3.5 px-4">Expected Delivery</th>
              <th className="py-3.5 px-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {shipments.map((s) => {
              const deliveryInfo = getRelativeDeliveryInfo(s.expectedDeliveryDate);

              return (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Reference Number */}
                  <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/shipments/${s.id}`}
                        className="font-bold text-sky-600 hover:text-sky-800 hover:underline transition-colors"
                      >
                        {s.referenceNumber}
                      </Link>
                      <button
                        onClick={() => copyRef(s.referenceNumber)}
                        title="Copy reference number"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {copiedId === s.referenceNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-4 px-4 text-slate-700">
                    <div className="flex items-center gap-2 max-w-xs">
                      <span className="truncate font-semibold text-slate-800" title={s.origin}>
                        {s.origin}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-semibold text-slate-800" title={s.destination}>
                        {s.destination}
                      </span>
                    </div>
                  </td>

                  {/* Current Status Badge */}
                  <td className="py-4 px-4">
                    <StatusBadge status={s.currentStatus as ShipmentStatus} size="md" />
                  </td>

                  {/* Expected Delivery Date */}
                  <td className="py-4 px-4 text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {formatDateOnly(s.expectedDeliveryDate)}
                        </div>
                        <div
                          className={`text-[11px] font-semibold ${
                            deliveryInfo.isOverdue ? 'text-rose-600' : 'text-slate-500'
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
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/shipments/${s.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-colors"
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
