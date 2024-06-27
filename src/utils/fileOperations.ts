// fileOperations.ts
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readJsonFile(filePath: string): Promise<any> {
  const fullPath = path.join(__dirname, '..', filePath);
  try {
    const data = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file from path: ${fullPath}`, err);
    throw err;
  }
}

export { readJsonFile };