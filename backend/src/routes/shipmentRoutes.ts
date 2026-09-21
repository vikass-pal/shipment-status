import { Router } from 'express';
import {
  ShipmentController,
  createShipmentSchema,
  updateStatusSchema,
} from '../controllers/shipmentController.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

// Stats summary route (must come before /:id)
router.get('/stats/summary', ShipmentController.getStats);

// List shipments (supports ?search= and ?status=)
router.get('/', ShipmentController.list);

// Create shipment
router.post('/', validateRequest(createShipmentSchema), ShipmentController.create);

// Get single shipment by ID with history
router.get('/:id', ShipmentController.getById);

// Update status of a shipment (creates history log)
router.patch('/:id/status', validateRequest(updateStatusSchema), ShipmentController.updateStatus);

export default router;
