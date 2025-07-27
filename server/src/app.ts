import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import { securityHeaders } from './middleware/securityHeaders';
import verificationRoutes from './routes/verificationRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import morgan from 'morgan';
import { httpLogStream } from './utils/logger';
import logger from './utils/logger';

const app = express();

// Middleware
app.use(cookieParser());
app.use(securityHeaders);

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Your Vite frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(morgan('combined', { stream: httpLogStream }));

// Mount routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', verificationRoutes);
app.use('/api', passwordResetRoutes);

logger.info('Routes initialized', {
  routes: ['/api/tasks', '/api/auth', '/api/verification', '/api/password-reset']
});

// Basic root route
app.get('/', (req, res) => {
  res.send('Task Utility Pro API Root. Visit /api for more.');
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;