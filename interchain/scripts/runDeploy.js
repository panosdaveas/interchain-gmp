import path from 'path';
import fs from 'fs-extra';
import { getDefaultProvider, utils } from 'ethers';
import { fileURLToPath } from 'url';
import { utils as axelarUtils } from '@axelar-network/axelar-local-dev';
import { checkEnv, getEVMChains, getWallet } from './libs/index.js';
import { configPath } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the CallContract using dynamic import since it's being loaded with rootRequire
const CallContract = globalThis.rootRequire('./artifacts/contracts/tl_ic_gmp.sol/CrossChainMessaging.json');

const { setJSON, deployContract } = axelarUtils;

async function chainDeploy(chain, wallet) {
  console.log(`Deploying CallContract for ${chain.name}.`);
  chain.contract = await deployContract(wallet, CallContract, [
    chain.gateway,
    chain.gasService,
    chain.name,
  ]);
  chain.wallet = wallet;
  console.log(
    `Deployed CallContract for ${chain.name} at ${chain.contract.address}.`
  );
}

/**
 * Deploy a contract to a list of chains.
 * @param {string} env - The environment to deploy to.
 * @param {Chain[]} chains - The chain objects to deploy to.
 * @param {Wallet} wallet - The wallet to use for deployment.
 * @param {Object} example - The example to deploy.
 */
async function deploy(env, chains, wallet) {
  await deployOnEvmChain(chains, wallet);

  // Serialize the contracts by storing the human-readable abi with the address in the json file.
  for (const chain of chains) {
    for (const key of Object.keys(chain)) {
      if (isSerializableContract(chain[key])) {
        chain[key] = serializeContract(chain[key]);
      }
    }
    // Remove the wallet from the chain objects.
    delete chain.wallet;
  }

  // Path to the JSON file
  const filePath = `./interchain/chain-config/${env}-evm.json`;

  // Check if file exists and read it, otherwise initialize empty array
  let existingChains = [];
  if (fs.existsSync(filePath)) {
    existingChains = fs.readJsonSync(filePath);
  }

  // Merge chains - Add new chains or update existing ones
  for (const newChain of chains) {
    // Check if chain with same name already exists
    const existingIndex = existingChains.findIndex(
      (chain) => chain.name === newChain.name
    );

    if (existingIndex >= 0) {
      // Update existing chain
      existingChains[existingIndex] = newChain;
    } else {
      // Add new chain
      existingChains.push(newChain);
    }
  }

  // Write merged chains back to file
  setJSON(existingChains, filePath);
}

// Deploy the contracts.
function deployOnEvmChain(chains, wallet) {
  const key = new Date().getTime().toString();
  const deploys = chains.map((chain) => {
    const provider = getDefaultProvider(chain.rpc);
    return chainDeploy(chain, wallet.connect(provider), key);
  });

  return Promise.all(deploys);
}

function postDeploy(chains, wallet) {
  const deploys = chains.map((chain) => {
    const provider = getDefaultProvider(chain.rpc);
    return chainDeploy(chain, chains, wallet.connect(provider));
  });

  return Promise.all(deploys);
}

function serializeContract(contract) {
  return {
    abi: contract.interface.format(utils.FormatTypes.full),
    address: contract.address,
  };
}

function isSerializableContract(obj) {
  return obj && obj.interface;
}

// Main execution
const env = process.argv[2] || 'local';
const chainsToDeploy = process.argv.slice(3);

// Check the environment. If it is not valid, exit.
checkEnv(env);

// Get the chains for the environment.
const chains = getEVMChains(env, chainsToDeploy);

// Get the wallet.
const wallet = getWallet();

// This will execute an example script. The example script must have a `deploy` function.
deploy(env, chains, wallet);

export {
  deploy,
  checkEnv,
  getEVMChains,
  getWallet,
};