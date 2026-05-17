import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Load .env from project root, server/, and Render secret files. */
export function loadEnv() {
  const root = path.join(__dirname, '../..');
  dotenv.config({ path: path.join(root, '.env') });
  dotenv.config({ path: path.join(__dirname, '../.env') });

  const renderSecret = '/etc/secrets/.env';
  if (fs.existsSync(renderSecret)) {
    dotenv.config({ path: renderSecret });
  }
}
