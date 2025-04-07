const path = require('path');

const configPath = {
    localEvmChains: path.resolve(__dirname, '..', 'chain-config', 'local-evm.json'),
    testnetChains: path.resolve(__dirname, '..', 'chain-config', 'testnet-evm.json'),
};

module.exports = {
    configPath,
};
