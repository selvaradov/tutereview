import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

async function readPackageJson(filePath: string): Promise<PackageJson> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function writePackageJson(filePath: string, data: PackageJson): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function consolidateDependencies() {
  const rootPath = path.resolve(__dirname, '..', 'package.json');
  const clientPath = path.resolve(__dirname, '..', 'client', 'package.json');
  const serverPath = path.resolve(__dirname, '..', 'server', 'package.json');

  const [rootPackage, clientPackage, serverPackage] = await Promise.all([
    readPackageJson(rootPath),
    readPackageJson(clientPath),
    readPackageJson(serverPath),
  ]);

  const consolidatedDependencies: Record<string, string> = {
    ...(rootPackage.dependencies || {}),
    ...(clientPackage.dependencies || {}),
    ...(serverPackage.dependencies || {}),
  };

  const consolidatedDevDependencies: Record<string, string> = {
    ...(rootPackage.devDependencies || {}),
    ...(clientPackage.devDependencies || {}),
    ...(serverPackage.devDependencies || {}),
  };

  rootPackage.dependencies = consolidatedDependencies;
  rootPackage.devDependencies = consolidatedDevDependencies;

  await writePackageJson(rootPath, rootPackage);

  console.log('Dependencies consolidated successfully!');
}

consolidateDependencies().catch(console.error);