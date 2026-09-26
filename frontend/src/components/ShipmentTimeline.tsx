import React from 'react';
import { ShipmentStatusHistory } from '../types/shipment';
import { StatusBadge, STATUS_CONFIG } from './StatusBadge';
import { formatDate } from '../utils/formatters';
import { Clock, ArrowRight, History } from 'lucide-react';

interface ShipmentTimelineProps {
  history: ShipmentStatusHistory[];
}

export const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
        <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-500">No status history available</p>
      </div>
    );
  }

  // Sort chronologically ascending (oldest first, latest last)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {sortedHistory.map((item, index) => {
        const isLatest = index === sortedHistory.length - 1;
        const config = STATUS_CONFIG[item.newStatus];
        const DotIcon = config?.icon;

        return (
          <div key={item.id || index} className="relative group">
            {/* Timeline Node Icon Circle */}
            <div
              className={`absolute -left-[31px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                isLatest
                  ? `${config.bg} ${config.border} ${config.text} ring-4 ring-sky-100 scale-110`
                  : 'bg-white border-slate-300 text-slate-400'
              }`}
            >
              {DotIcon ? <DotIcon className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
            </div>

            {/* Timeline Content Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isLatest
                  ? 'bg-white border-sky-300 shadow-sm shadow-sky-500/10'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                {/* Transition Header */}
                <div className="flex items-center gap-2">
                  {item.previousStatus ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <span>{STATUS_CONFIG[item.previousStatus]?.label || item.previousStatus}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <StatusBadge status={item.newStatus} size="sm" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.newStatus} size="sm" />
                      <span className="text-xs font-bold text-slate-500">(Initial Creation)</span>
                    </div>
                  )}

                  {isLatest && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">
                      Current Stage
                    </span>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>

              {/* Audit Notes */}
              {item.notes && (
                <div className="mt-2 text-xs font-medium text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  {item.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
