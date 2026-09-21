import { Shipment, ShipmentStatusHistory } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { ShipmentStatus } from '../types/shipment.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors.js';

export interface CreateShipmentDTO {
  referenceNumber: string;
  origin: string;
  destination: string;
  currentStatus?: ShipmentStatus;
  expectedDeliveryDate: Date;
}

export interface UpdateStatusDTO {
  status: ShipmentStatus;
  notes?: string;
}

export interface ListShipmentsFilter {
  search?: string;
  status?: ShipmentStatus;
}

export interface StatusSummaryStats {
  total: number;
  BOOKED: number;
  IN_TRANSIT: number;
  CUSTOMS_HOLD: number;
  OUT_FOR_DELIVERY: number;
  DELIVERED: number;
}

export class ShipmentService {
  /**
   * Create a new shipment along with its initial status history entry inside a transaction.
   */
  static async createShipment(dto: CreateShipmentDTO): Promise<Shipment & { statusHistory: ShipmentStatusHistory[] }> {
    const formattedRef = dto.referenceNumber.trim().toUpperCase();

    // 1. Check for existing reference number
    const existing = await prisma.shipment.findUnique({
      where: { referenceNumber: formattedRef },
    });

    if (existing) {
      throw new ConflictError(`Shipment with reference number '${formattedRef}' already exists.`);
    }

    const initialStatus = dto.currentStatus || ShipmentStatus.BOOKED;

    // 2. Perform creation in a database transaction
    return await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          referenceNumber: formattedRef,
          origin: dto.origin.trim(),
          destination: dto.destination.trim(),
          currentStatus: initialStatus,
          expectedDeliveryDate: dto.expectedDeliveryDate,
          statusHistory: {
            create: {
              previousStatus: null,
              newStatus: initialStatus,
              notes: 'Shipment created',
            },
          },
        },
        include: {
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return shipment;
    });
  }

  /**
   * List shipments with search and status filtering options.
   */
  static async listShipments(filters: ListShipmentsFilter) {
    const { search, status } = filters;

    const where: any = {};

    if (search && search.trim().length > 0) {
      where.referenceNumber = {
        contains: search.trim(),
      };
    }

    if (status) {
      where.currentStatus = status;
    }

    const shipments = await prisma.shipment.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return shipments;
  }

  /**
   * Get a single shipment by ID including its chronological status history.
   */
  static async getShipmentById(id: string) {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundError(`Shipment with ID '${id}' was not found.`);
    }

    return shipment;
  }

  /**
   * Safely update shipment status in a transaction and append to history audit log.
   */
  static async updateStatus(id: string, dto: UpdateStatusDTO) {
    const { status: newStatus, notes } = dto;

    // Validate enum status
    if (!Object.values(ShipmentStatus).includes(newStatus)) {
      throw new BadRequestError(`Invalid status '${newStatus}'. Valid statuses are: ${Object.values(ShipmentStatus).join(', ')}`);
    }

    // Fetch existing shipment
    const shipment = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!shipment) {
      throw new NotFoundError(`Shipment with ID '${id}' was not found.`);
    }

    // If new status is identical to current status, return without creating duplicate history
    if (shipment.currentStatus === newStatus) {
      return await this.getShipmentById(id);
    }

    const previousStatus = shipment.currentStatus;

    // Perform transaction update
    return await prisma.$transaction(async (tx) => {
      // 1. Update shipment currentStatus
      await tx.shipment.update({
        where: { id },
        data: {
          currentStatus: newStatus,
        },
      });

      // 2. Add history entry
      await tx.shipmentStatusHistory.create({
        data: {
          shipmentId: id,
          previousStatus,
          newStatus,
          notes: notes ? notes.trim() : null,
        },
      });

      // 3. Return updated shipment with full history
      return await tx.shipment.findUnique({
        where: { id },
        include: {
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });
  }

  /**
   * Aggregate status counts summary for dashboard cards.
   */
  static async getSummaryStats(): Promise<StatusSummaryStats> {
    const total = await prisma.shipment.count();
    const grouped = await prisma.shipment.groupBy({
      by: ['currentStatus'],
      _count: {
        currentStatus: true,
      },
    });

    const stats: StatusSummaryStats = {
      total,
      BOOKED: 0,
      IN_TRANSIT: 0,
      CUSTOMS_HOLD: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
    };

    grouped.forEach((item) => {
      if (item.currentStatus in stats) {
        (stats as any)[item.currentStatus] = item._count.currentStatus;
      }
    });

    return stats;
  }
}
