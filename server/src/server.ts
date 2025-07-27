import app from './app';
import { PORT } from './config/config';
import logger from './utils/logger';

app.listen(PORT, () => {
  logger.info(`🚀 Server started`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});