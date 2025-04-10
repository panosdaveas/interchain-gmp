import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../../');

// Create a require function for the root path
const rootRequire = createRequire(rootPath + '/');

// Make rootRequire available globally
globalThis.rootRequire = (name) => rootRequire(`${name}`);

export { rootRequire };