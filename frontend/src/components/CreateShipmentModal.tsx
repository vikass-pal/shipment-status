import React, { useState } from 'react';
import { ShipmentStatus, CreateShipmentInput } from '../types/shipment';
import { STATUS_CONFIG } from './StatusBadge';
import { X, Plus, AlertCircle, Calendar, MapPin, Hash, Loader2 } from 'lucide-react';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShipmentInput) => Promise<void>;
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 5);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState<CreateShipmentInput>({
    referenceNumber: '',
    origin: '',
    destination: '',
    currentStatus: 'BOOKED',
    expectedDeliveryDate: defaultDateStr,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.referenceNumber.trim()) {
      newErrors.referenceNumber = 'Reference number is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.referenceNumber.trim())) {
      newErrors.referenceNumber = 'Only letters, numbers, hyphens & underscores allowed';
    } else if (formData.referenceNumber.trim().length < 2) {
      newErrors.referenceNumber = 'Must be at least 2 characters';
    }

    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin location is required';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination location is required';
    }

    if (!formData.expectedDeliveryDate) {
      newErrors.expectedDeliveryDate = 'Expected delivery date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        referenceNumber: formData.referenceNumber.trim().toUpperCase(),
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
      });
      onClose();
      // Reset form
      setFormData({
        referenceNumber: '',
        origin: '',
        destination: '',
        currentStatus: 'BOOKED',
        expectedDeliveryDate: defaultDateStr,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create shipment';
      setApiError(msg);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Shipment</h2>
              <p className="text-xs text-slate-400">Enter logistics tracking details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Reference Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Reference Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, referenceNumber: e.target.value.toUpperCase() })
                }
                placeholder="e.g. TRK-9082"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                  errors.referenceNumber
                    ? 'border-rose-500/50 focus:ring-rose-500/20'
                    : 'border-slate-800 focus:border-sky-500 focus:ring-sky-500/20'
                }`}
              />
            </div>
            {errors.referenceNumber && (
              <p className="mt-1 text-xs text-rose-400">{errors.referenceNumber}</p>
            )}
          </div>

          {/* Origin & Destination Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Origin *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <MapPin className="w-4 h-4 text-amber-500" />
                </div>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="e.g. Hamburg, Germany"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                    errors.origin
                      ? 'border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:border-sky-500 focus:ring-sky-500/20'
                  }`}
                />
              </div>
              {errors.origin && <p className="mt-1 text-xs text-rose-400">{errors.origin}</p>}
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Destination *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                </div>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g. New York, USA"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                    errors.destination
                      ? 'border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:border-sky-500 focus:ring-sky-500/20'
                  }`}
                />
              </div>
              {errors.destination && (
                <p className="mt-1 text-xs text-rose-400">{errors.destination}</p>
              )}
            </div>
          </div>

          {/* Current Status & Expected Delivery Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={formData.currentStatus}
                onChange={(e) =>
                  setFormData({ ...formData, currentStatus: e.target.value as ShipmentStatus })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              >
                {(Object.keys(STATUS_CONFIG) as ShipmentStatus[]).map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Expected Delivery *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedDeliveryDate: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.expectedDeliveryDate
                      ? 'border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:border-sky-500 focus:ring-sky-500/20'
                  }`}
                />
              </div>
              {errors.expectedDeliveryDate && (
                <p className="mt-1 text-xs text-rose-400">{errors.expectedDeliveryDate}</p>
              )}
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-sm font-semibold shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Shipment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
