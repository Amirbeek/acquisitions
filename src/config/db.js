import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Configure Neon based on environment
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  // Development: Configure for Neon Local HTTP endpoint
  // Neon Local supports the serverless driver through HTTP
  neonConfig.fetchEndpoint = 'http://localhost:5442/sql'
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

// Create connection - works for both development (Neon Local) and production (Neon Cloud)
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
