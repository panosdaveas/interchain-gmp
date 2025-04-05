"use strict";

const path = require("path");
const { getDefaultProvider, utils } = require("ethers");
const {
  utils: { setJSON, deployContract },
} = require("@axelar-network/axelar-local-dev");
const {
  checkEnv,
  getEVMChains,
  getWallet,
} = require("./libs");
const { configPath } = require("../config");
const CallContract = rootRequire("./artifacts/contracts/tl_ic_gmp.sol/CrossChainMessaging.json");

// Returns the path of the example file
function getExamplePath() {
  return path.resolve(__dirname, "../../app.js");
}

async function chainDeploy(chain, wallet) {
  console.log(`Deploying CallContract for ${chain.name}.`);
  chain.contract = await deployContract(wallet, CallContract, [
    chain.gateway,
    chain.gasService,
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
  // await deployOnAltChain(example);
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

  // Write the chain objects to the json file.
  setJSON(chains, configPath.localEvmChains);
  // setJSON(chains, `./chain-config/${env}-evm.json`);
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
const env = process.argv[2];
const chainsToDeploy = process.argv.slice(3);

// Check the environment. If it is not valid, exit.
checkEnv(env);

// Get the chains for the environment.
const chains = getEVMChains(env, chainsToDeploy);

// Get the wallet.
const wallet = getWallet();

// This will execute an example script. The example script must have a `deploy` function.
deploy(env, chains, wallet);

module.exports = {
  deploy,
  checkEnv,
  getEVMChains,
  getExamplePath,
  getWallet,
};
