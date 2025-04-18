import { Wallet, Contract, ethers } from 'ethers';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { configPath } from '../../config/index.js';
import axelarLocal from '@axelar-network/axelar-local-dev';
import { testnetInfo } from '@axelar-network/axelar-local-dev';
import { AxelarAssetTransfer, AxelarQueryAPI, CHAINS, Environment } from '@axelar-network/axelarjs-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the wallet from the environment variables. If the EVM_PRIVATE_KEY environment variable is set, use that. Otherwise, use the EVM_MNEMONIC environment variable.
 * @returns {Wallet} - The wallet.
 */
function getWallet() {
    checkWallet();
    const privateKey = process.env.EVM_PRIVATE_KEY;
    return new Wallet(privateKey);
}

function readChainConfig(filePath) {
    if (!fs.existsSync(filePath)) {
        return undefined;
    }

    return fs.readJsonSync(filePath);
}

/**
 * Get the chain objects from the chain-config file.
 * @param {*} env - The environment to get the chain objects for. Available options are 'local' and 'testnet'.
 * @param {*} chains - The list of chains to get the chain objects for. If this is empty, the default chains will be used.
 * @returns {Chain[]} - The chain objects.
 */
function getEVMChains(env, chains = []) {
    checkEnv(env);
    const selectedChains = chains.length > 0 ? chains : getDefaultChains(env);

    if (env === 'local') {
        return fs.readJsonSync(configPath.localEvmChains).filter((chain) => selectedChains.includes(chain.name));
    }

    const testnet = getTestnetChains(selectedChains);

    return testnet.map((chain) => ({
        ...chain,
        gateway: chain.contracts.AxelarGateway.address,
        gasService: chain.contracts.AxelarGasService.address,
    }));
}

function getChains() {
  const env = process.env.ENV;
  checkEnv(env);

  if (env === "local") {
    return fs.readJsonSync(configPath.localEvmChains);
  } else {
    return fs.readJsonSync(configPath.testnetChains);
  }
}

/**
 * Get chains config for testnet.
 * @param {*} chains - The list of chains to get the chain objects for. If this is empty, the default chains will be used.
 * @returns {Chain[]} - The chain objects.
 */
function getTestnetChains(chains = []) {
    // const _path = `./chain-info/${env}-evm.json`;
    // const _path = path.join(configPath.testnetChains);
    const _path = path.join(__dirname, '/chain-info/testnet-evm.json');
    let testnet = [];
    if (fs.existsSync(_path)) {
        testnet = fs
            .readJsonSync(path.join(_path))
            .filter((chain) => chains.includes(chain.name));
    }

    if (testnet.length < chains.length) {
        testnet = [];
        for (const chain of chains) {
            testnet.push(testnetInfo[chain.toLowerCase()]);
        }
    }

    // temporary fix for gas service contract address
    return testnet.map((chain) => ({
        ...chain,
        AxelarGasService: {
            address: '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6',
        },
    }));
}

/**
 * Get the balances of an address on a list of chains.
 * @param {*} chains - The list of chains to get the balances from.
 * @param {*} address - The address to get the balances for.
 * @returns {Object} - The balances of the address on each chain.
 */
async function getBalances(chains, address) {
    const balances = await Promise.all(
        chains.map((chain) => {
            const provider = new ethers.providers.JsonRpcProvider(chain.rpc);
            return provider.getBalance(address).then((b) => b.toString());
        }),
    );

    return balances.reduce((acc, balance, i) => {
        acc[chains[i].name] = balance;
        return acc;
    }, {});
}

/**
 * Get the deposit address for a token on a chain.
 * @param {*} env - The environment to get the deposit address for. Available options are 'local' and 'testnet'.
 * @param {*} source - The source chain object.
 * @param {*} destination - The destination chain object.
 * @param {*} destinationAddress - The destination address.
 * @param {*} symbol - The symbol of the token to get the deposit address for.
 * @returns {string} - The deposit address.
 */
function getDepositAddress(env, source, destination, destinationAddress, symbol) {
    if (env === 'testnet') {
        const listing = {
            aUSDC: env === 'local' ? 'uusdc' : 'uausdc',
        };
        const sdk = new AxelarAssetTransfer({
            environment: 'testnet',
            auth: 'local',
        });
        return sdk.getDepositAddress(source, destination, destinationAddress, listing[symbol]);
    }

    return axelarLocal.getDepositAddress(source, destination, destinationAddress, symbol, 8500);
}

/**
 * Calculate the gas amount for a transaction using axelarjs-sdk.
 * @param {*} source - The source chain object.
 * @param {*} destination - The destination chain object.
 * @param {*} options - The options to pass to the estimateGasFee function. Available options are gas token symbol, gasLimit and gasMultiplier.
 * @returns {number} - The gas amount.
 */
function calculateBridgeFee(source, destination, options = {}) {
    const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
    const { gasLimit } = options;

    const sourceChain = CHAINS.TESTNET[source.name.toUpperCase()] || CHAINS.TESTNET.AVALANCHE;
    const destChain = CHAINS.TESTNET[destination.name.toUpperCase()] || CHAINS.TESTNET.FANTOM;

    return api.estimateGasFee(sourceChain, destChain, gasLimit || 700000, 'auto');
}

/**
 * Calculate total gas to cover for a express transaction using axelarjs-sdk.
 * @param {*} source - The source chain object.
 * @param {*} destination - The destination chain object.
 * @param {*} options - The options to pass to the estimateGasFee function. Available options are gas token symbol, gasLimit and gasMultiplier.
 * @returns {number} - The gas amount.
 */
async function calculateBridgeExpressFee(source, destination, options = {}) {
    const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
    const { gasLimit, gasMultiplier, symbol } = options;

    const response = await api.estimateGasFee(
        CHAINS.TESTNET[source.name.toUpperCase()],
        CHAINS.TESTNET[destination.name.toUpperCase()],
        gasLimit || 700000,
        'auto',
        symbol || source.tokenSymbol,
        undefined,
        undefined,
        {
            showDetailedFees: true,
        },
    );

    const expressMultiplier = response.apiResponse.result.express_execute_gas_multiplier;

    // baseFee + executionFeeWithMultiplier + expressFee
    return ethers.BigNumber.from(response.executionFeeWithMultiplier)
        .mul(Math.ceil(expressMultiplier * 2)) // convert float to decimals
        .add(response.baseFee)
        .toString();
}

/**
 * Check if the wallet is set. If not, throw an error.
 */
function checkWallet() {
    if (process.env.EVM_PRIVATE_KEY == null && process.env.EVM_MNEMONIC == null) {
        throw new Error('Need to set EVM_PRIVATE_KEY or EVM_MNEMONIC environment variable.');
    }
}

/**
 * Check if the environment is set. If not, throw an error.
 * @param {*} env - The environment to check. Available options are 'local' and 'testnet'.
 */
function checkEnv(env) {
    if (env == null || (env !== 'testnet' && env !== 'local')) {
        throw new Error('Need to specify testnet or local as an argument to this script.');
    }
}

function getDefaultChains(env) {
    if (env === 'local') {
        return ['Avalanche', 'Fantom', 'Moonbeam', 'Polygon', 'Ethereum'];
    }

    return ['Avalanche', 'Fantom', 'Moonbeam', 'Polygon', 'Ethereum'];
}

/**
 * Get the path to an example.
 * @param {*} exampleName - The name of the example to get the path for.
 * @returns {string} - The path to the example.
 */
function getExamplePath(exampleName) {
    const destDir = path.resolve(__dirname, '..', `examples/${exampleName}/index.js`);
    return path.relative(__dirname, destDir);
}

/**
 * Sanitize the event arguments.
 * This is needed because ethers.js returns the event arguments as an object with the keys being the argument names and the values being the argument values.
 * @param {*} event - The event to sanitize.
 * @returns {Object} - The sanitized event arguments.
 */
function sanitizeEventArgs(event) {
    return Object.keys(event.args).reduce((acc, key) => {
        if (isNaN(parseInt(key))) {
            acc[key] = event.args[key];
        }

        return acc;
    }, {});
}

function deserializeContract(chain, wallet) {
  // Loop through every keys in the chain object.
  for (const key of Object.keys(chain)) {
    // If the object has an abi, it is a contract.

    if (chain[key].abi) {
      // Get the contract object.
      const contract = chain[key];

      // Deserialize the contract. Assign the contract to the chain object.
      chain[key] = new Contract(contract.address, contract.abi, wallet);
    }
  }

  return chain;
}

export {
    getWallet,
    getDepositAddress,
    getBalances,
    getEVMChains,
    checkEnv,
    calculateBridgeFee,
    calculateBridgeExpressFee,
    getExamplePath,
    readChainConfig,
    sanitizeEventArgs,
    getChains,
    deserializeContract,
    getTestnetChains,
};