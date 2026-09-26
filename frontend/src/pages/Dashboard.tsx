import React, { useState, useEffect, useCallback } from 'react';
import { Shipment, ShipmentStatus, CreateShipmentInput, StatusSummaryStats } from '../types/shipment';
import { shipmentApi } from '../services/api';
import { Navbar } from '../components/Navbar';
import { StatsCards } from '../components/StatsCards';
import { ShipmentTable } from '../components/ShipmentTable';
import { CreateShipmentModal } from '../components/CreateShipmentModal';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { STATUS_CONFIG } from '../components/StatusBadge';
import { Search, Filter, X, RefreshCw, AlertCircle, Plus } from 'lucide-react';

export const Dashboard: React.FC = () => {
  // Data State
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<StatusSummaryStats | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updateModalShipment, setUpdateModalShipment] = useState<Shipment | null>(null);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Stats & Shipments
  const fetchData = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);

        setError(null);

        // Fetch stats and filtered shipments concurrently
        const [statsData, shipmentsData] = await Promise.all([
          shipmentApi.getStats(),
          shipmentApi.listShipments({
            search: debouncedSearch.trim() || undefined,
            status: statusFilter || undefined,
          }),
        ]);

        setStats(statsData);
        setShipments(shipmentsData);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load shipments');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [debouncedSearch, statusFilter]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create Shipment Handler
  const handleCreateShipment = async (data: CreateShipmentInput) => {
    const newShipment = await shipmentApi.createShipment(data);
    addToast('success', `Shipment #${newShipment.referenceNumber} created successfully!`);
    await fetchData(true);
  };

  // Update Status Handler
  const handleUpdateStatus = async (
    shipmentId: string,
    newStatus: ShipmentStatus,
    notes?: string
  ) => {
    const updated = await shipmentApi.updateStatus(shipmentId, { status: newStatus, notes });
    addToast('success', `Shipment #${updated.referenceNumber} status updated to ${newStatus}`);
    await fetchData(true);
  };

  const hasActiveFilters = Boolean(searchTerm || statusFilter);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Logistics Dashboard
              {stats && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  {stats.total} total
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time shipment tracking, status progression, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="sm:hidden flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Shipment</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <StatsCards
          stats={stats}
          activeStatusFilter={statusFilter}
          onSelectStatus={(st) => setStatusFilter(st)}
          isLoading={isLoading && !stats}
        />

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchData(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Reference Search Box */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference number..."
              className="w-full pl-10 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdown & Clear */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | '')}
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                {(Object.keys(STATUS_CONFIG) as ShipmentStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Shipment Table */}
        <ShipmentTable
          shipments={shipments}
          isLoading={isLoading}
          onQuickUpdateStatus={(s) => setUpdateModalShipment(s)}
          onClearFilters={clearFilters}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>LogiTrack • Shipment Status Tracker System</p>
      </footer>

      {/* Modals */}
      <CreateShipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateShipment}
      />

      <StatusUpdateModal
        isOpen={Boolean(updateModalShipment)}
        shipment={updateModalShipment}
        onClose={() => setUpdateModalShipment(null)}
        onSubmit={handleUpdateStatus}
      />

      {/* Toast Alerts Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
