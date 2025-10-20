import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from '#routes/auth.routes.js';
const app = express();

// For Security
app.use(helmet());
app.use(cors());
app.use(cookieParser());

// Monitoring
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', { stream: { write: message => logger.info(message) } })
);

app.get('/', (req, res) => {
  logger.info('Hello');
  res.status(200).send('Hello From Acquisition');
});

// APIs
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.get('/api', (req, res) => {
  res.status(200).send({ message: 'Acquisitions API running!' });
});

export default app;
