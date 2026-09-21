import axios from 'axios';
import {
  Shipment,
  CreateShipmentInput,
  UpdateShipmentStatusInput,
  ShipmentFilterParams,
  StatusSummaryStats,
  ApiResponse,
} from '../types/shipment';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const shipmentApi = {
  // 1. Get summary stats
  getStats: async (): Promise<StatusSummaryStats> => {
    const response = await api.get<ApiResponse<StatusSummaryStats>>('/shipments/stats/summary');
    return response.data.data;
  },

  // 2. List shipments with filter & search query parameters
  listShipments: async (params?: ShipmentFilterParams): Promise<Shipment[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<ApiResponse<Shipment[]>>(`/shipments${queryString}`);
    return response.data.data;
  },

  // 3. Get single shipment by ID
  getShipmentById: async (id: string): Promise<Shipment> => {
    const response = await api.get<ApiResponse<Shipment>>(`/shipments/${id}`);
    return response.data.data;
  },

  // 4. Create shipment
  createShipment: async (payload: CreateShipmentInput): Promise<Shipment> => {
    const response = await api.post<ApiResponse<Shipment>>('/shipments', payload);
    return response.data.data;
  },

  // 5. Update shipment status
  updateStatus: async (id: string, payload: UpdateShipmentStatusInput): Promise<Shipment> => {
    const response = await api.patch<ApiResponse<Shipment>>(`/shipments/${id}/status`, payload);
    return response.data.data;
  },
};

export default api;
