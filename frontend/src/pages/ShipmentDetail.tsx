import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shipment, ShipmentStatus } from '../types/shipment';
import { shipmentApi } from '../services/api';
import { Navbar } from '../components/Navbar';
import { StatusBadge } from '../components/StatusBadge';
import { ShipmentTimeline } from '../components/ShipmentTimeline';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { formatDate, formatDateOnly, getRelativeDeliveryInfo } from '../utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  RefreshCw,
  AlertCircle,
  History,
  Copy,
  Check,
} from 'lucide-react';

export const ShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Toast state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [copied, setCopied] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const toastId = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id: toastId, type, message }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const fetchShipment = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await shipmentApi.getShipmentById(id);
      setShipment(data);
    } catch (err: any) {
      console.error('Error fetching shipment detail:', err);
      setError(err.response?.data?.message || err.message || 'Shipment not found');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

  const handleUpdateStatus = async (
    shipmentId: string,
    newStatus: ShipmentStatus,
    notes?: string
  ) => {
    await shipmentApi.updateStatus(shipmentId, { status: newStatus, notes });
    addToast('success', `Status updated to ${newStatus}`);
    await fetchShipment();
  };

  const copyRef = () => {
    if (shipment?.referenceNumber) {
      navigator.clipboard.writeText(shipment.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-white border border-slate-200 rounded-2xl shadow-xs" />
            <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">Error Loading Shipment</h2>
            <p className="text-sm font-medium text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sky-700 text-sm font-bold border border-slate-300 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Shipment Details View */}
        {shipment && !isLoading && (
          <div className="space-y-6">
            {/* Header Information Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                      #{shipment.referenceNumber}
                    </h1>
                    <button
                      onClick={copyRef}
                      title="Copy Reference Number"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <StatusBadge status={shipment.currentStatus} size="lg" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    Created on {formatDate(shipment.createdAt)} • Last updated {formatDate(shipment.updatedAt)}
                  </p>
                </div>

                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Update Status</span>
                </button>
              </div>

              {/* Route & Expected Delivery Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                {/* Origin */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Origin</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{shipment.origin}</div>
                </div>

                {/* Destination */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Destination</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{shipment.destination}</div>
                </div>

                {/* Expected Delivery */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>Expected Delivery</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {formatDateOnly(shipment.expectedDeliveryDate)}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {getRelativeDeliveryInfo(shipment.expectedDeliveryDate).label}
                  </div>
                </div>
              </div>
            </div>

            {/* Status History & Audit Timeline Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Status Progression Timeline</h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Complete chronological audit record of status events
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  {shipment.statusHistory?.length || 0} Event{shipment.statusHistory?.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Timeline Renderer */}
              <ShipmentTimeline history={shipment.statusHistory || []} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs font-semibold text-slate-500">
        <p>LogiTrack • Shipment Status Tracker System</p>
      </footer>

      {/* Status Update Modal */}
      {shipment && (
        <StatusUpdateModal
          isOpen={isUpdateModalOpen}
          shipment={shipment}
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateStatus}
        />
      )}

      {/* Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
