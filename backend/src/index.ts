import Fastify from 'fastify';
import mongoose from 'mongoose';
import pino from 'pino';
import dotenv from 'dotenv';
import multipart from '@fastify/multipart';

import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import genRoutes from './routes/generate.js';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-ai-studio';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

const app = Fastify({ logger: { instance: logger } });

/*app.register(fastifySwagger, {
  mode: 'dynamic',
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Mini AI Studio API',
      version: '0.1.0'
    }
  },
  exposeRoute: true,
  routePrefix: '/api/docs'
});*/

//app.register(fastifySwaggerUi, { routePrefix: '/api/docs' });
app.register(multipart, { attachFieldsToBody: true });
app.register(authRoutes, { prefix: '/auth' });
app.register(genRoutes, { prefix: '/api' });

async function start() {
  try {
    await mongoose.connect(MONGO);
    logger.info('✅ Connected to MongoDB');

    const address = await app.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🚀 Server running at ${address}`);
   
  } catch (err) {
    //logger.error(err);
    process.exit(1);
  }
}

start();
