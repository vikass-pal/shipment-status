export type ShipmentStatus =
  | 'BOOKED'
  | 'IN_TRANSIT'
  | 'CUSTOMS_HOLD'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface ShipmentStatusHistory {
  id: string;
  shipmentId: string;
  previousStatus: ShipmentStatus | null;
  newStatus: ShipmentStatus;
  notes?: string | null;
  createdAt: string;
}

export interface Shipment {
  id: string;
  referenceNumber: string;
  origin: string;
  destination: string;
  currentStatus: ShipmentStatus;
  expectedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: ShipmentStatusHistory[];
}

export interface CreateShipmentInput {
  referenceNumber: string;
  origin: string;
  destination: string;
  currentStatus?: ShipmentStatus;
  expectedDeliveryDate: string;
}

export interface UpdateShipmentStatusInput {
  status: ShipmentStatus;
  notes?: string;
}

export interface ShipmentFilterParams {
  search?: string;
  status?: ShipmentStatus | '';
}

export interface StatusSummaryStats {
  total: number;
  BOOKED: number;
  IN_TRANSIT: number;
  CUSTOMS_HOLD: number;
  OUT_FOR_DELIVERY: number;
  DELIVERED: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string>;
}
