import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ShipmentStatus } from '../types/shipment.js';
import { ShipmentService } from '../services/shipmentService.js';
import { sendSuccess } from '../utils/response.js';

export const createShipmentSchema = z.object({
  referenceNumber: z
    .string({ required_error: 'Reference number is required' })
    .min(2, 'Reference number must be at least 2 characters')
    .max(50, 'Reference number cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Reference number can only contain letters, numbers, hyphens, and underscores'),
  origin: z
    .string({ required_error: 'Origin is required' })
    .min(2, 'Origin must be at least 2 characters')
    .max(100, 'Origin cannot exceed 100 characters'),
  destination: z
    .string({ required_error: 'Destination is required' })
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination cannot exceed 100 characters'),
  currentStatus: z.nativeEnum(ShipmentStatus).optional(),
  expectedDeliveryDate: z
    .string({ required_error: 'Expected delivery date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Expected delivery date must be a valid ISO date string',
    }),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(ShipmentStatus, {
    errorMap: () => ({ message: 'Invalid shipment status provided' }),
  }),
  notes: z.string().max(255, 'Notes cannot exceed 255 characters').optional(),
});

export class ShipmentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { referenceNumber, origin, destination, currentStatus, expectedDeliveryDate } = req.body;
      const shipment = await ShipmentService.createShipment({
        referenceNumber,
        origin,
        destination,
        currentStatus,
        expectedDeliveryDate: new Date(expectedDeliveryDate),
      });

      return sendSuccess(res, shipment, 'Shipment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status } = req.query;

      const filterStatus =
        status && Object.values(ShipmentStatus).includes(status as ShipmentStatus)
          ? (status as ShipmentStatus)
          : undefined;

      const shipments = await ShipmentService.listShipments({
        search: typeof search === 'string' ? search : undefined,
        status: filterStatus,
      });

      return sendSuccess(res, shipments);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const shipment = await ShipmentService.getShipmentById(id);
      return sendSuccess(res, shipment);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const updatedShipment = await ShipmentService.updateStatus(id, { status, notes });
      return sendSuccess(res, updatedShipment, 'Shipment status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ShipmentService.getSummaryStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
