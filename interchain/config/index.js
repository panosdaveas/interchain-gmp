import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = {
    localEvmChains: path.resolve(__dirname, '..', 'chain-config', 'local-evm.json'),
    testnetChains: path.resolve(__dirname, '..', 'chain-config', 'testnet-evm.json'),
};

export { configPath };