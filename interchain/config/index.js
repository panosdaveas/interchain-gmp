const path = require('path');

const configPath = {
    localEvmChains: path.resolve(__dirname, '..', 'chain-config', 'local-evm.json'),
};

module.exports = {
    configPath,
};
