import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { verifyEmailConfig } from './src/utils/mailer.js';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
try {
  mkdirSync(join(__dirname, 'uploads'), { recursive: true });
} catch {}

const PORT = process.env.PORT || 5002;

connectDB().then(() => {
  // Check email configuration on startup
  verifyEmailConfig();

  app.listen(PORT, () => {
    console.log(`🚀 Zorovex API running on http://localhost:${PORT}`);
  });
});

