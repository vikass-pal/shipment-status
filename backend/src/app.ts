import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import shipmentRoutes from './routes/shipmentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app: Express = express();

// Middleware
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: [allowedOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/shipments', shipmentRoutes);

// Catch-all 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// Centralized error handling
app.use(errorHandler);

export default app;
