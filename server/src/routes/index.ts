import { Router } from 'express';
import { lightRateLimiter } from '../middleware/rateLimiter';

const { version, repository } = require('../../package.json');

const router = Router();

// Basic rate limiting (100 requests/15min)
router.get('/', 
  lightRateLimiter, 
  (req, res) => {
    try {
      // Simple health check
      const healthStatus = {
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
      
      res.json({
        // Core identification
        message: 'Welcome to Task Utility Pro API',
        version: version,
        environment: process.env.NODE_ENV || 'development',
        
        // System status
        status: healthStatus.status,
        uptime: healthStatus.uptime,
        timestamp: healthStatus.timestamp,
        
        // API discovery
        endpoints: {
          auth: {
            login: '/api/auth/login',
            register: '/api/auth/register',
            currentUser: '/api/auth/me'
          },
          tasks: {
            base: '/api/tasks',
            completed: '/api/tasks/completed',
            overdue: '/api/tasks/overdue'
          },
          docs: '/api-docs'
        },
        
        // Security information
        authentication_required: {
          tasks: true,
          docs: false
        },
        
        // Metadata
        repository: repository?.url || null,
        support: 'taskutilitypro@gmail.com'
      });

    } catch (error) {
      console.error('Root route error:', error);
      res.status(500).json({
        message: 'Service available with degraded performance',
        status: 'degraded',
        error: 'Internal server error'
      });
    }
  }
);

export default router;