import React, { useState } from 'react';
import { Shipment, ShipmentStatus } from '../types/shipment';
import { STATUS_CONFIG, StatusBadge } from './StatusBadge';
import { X, RefreshCw, AlertCircle, FileText, Loader2, ArrowRight } from 'lucide-react';

interface StatusUpdateModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  onClose: () => void;
  onSubmit: (shipmentId: string, status: ShipmentStatus, notes?: string) => Promise<void>;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  shipment,
  onClose,
  onSubmit,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus>(
    shipment?.currentStatus || 'IN_TRANSIT'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync selected status when shipment changes
  React.useEffect(() => {
    if (shipment) {
      setSelectedStatus(shipment.currentStatus);
      setNotes('');
      setError(null);
    }
  }, [shipment]);

  if (!isOpen || !shipment) return null;

  const isIdentical = selectedStatus === shipment.currentStatus;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isIdentical) {
      setError('Please select a different status to update history.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(shipment.id, selectedStatus, notes.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statuses: ShipmentStatus[] = [
    'BOOKED',
    'IN_TRANSIT',
    'CUSTOMS_HOLD',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Update Status</h2>
              <p className="text-xs text-slate-500 font-semibold">Reference #{shipment.referenceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs New Status preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Current</span>
              <div>
                <StatusBadge status={shipment.currentStatus} size="sm" />
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="space-y-1 text-right">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">New Stage</span>
              <div>
                <StatusBadge status={selectedStatus} size="sm" />
              </div>
            </div>
          </div>

          {/* Status Selection Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select New Status
            </label>
            <div className="space-y-2">
              {statuses.map((st) => {
                const isSelected = selectedStatus === st;
                const isCurrent = shipment.currentStatus === st;
                const config = STATUS_CONFIG[st];

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? `${config.bg} ${config.border} ring-2 ${config.text.replace('text-', 'ring-')}`
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <StatusBadge status={st} size="sm" />
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-sky-600">Selected</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Change Notes (Optional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Passed customs inspection, dispatched to local carrier..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all resize-none font-medium"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isIdentical}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Confirm Update</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
