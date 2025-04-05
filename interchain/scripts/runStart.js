const { ethers } = require("ethers");
const { createAndExport, EvmRelayer } = require("@axelar-network/axelar-local-dev");
const { configPath } = require('../config');
const { getWallet } = require("./libs");

// Create an EVM relayer
const evmRelayer = new EvmRelayer();
const relayers = { evm: evmRelayer };

/**
 * Deploy aUSDC and fund the given addresses with 1e12 aUSDC.
 * @param {*} chain - chain to deploy aUSDC on
 * @param {*} toFund - addresses to fund with aUSDC
 */
async function deployAndFundUsdc(chain, toFund) {
  await chain.deployToken(
    "Axelar Wrapped aUSDC",
    "aUSDC",
    6,
    ethers.utils.parseEther("1000")
  );

  for (const address of toFund) {
    await chain.giveToken(address, "aUSDC", ethers.utils.parseEther("1"));
  }
}

/**
 * Start the local chains with Axelar contracts deployed.
 * aUSDC is deployed and funded to the given addresses.
 * @param {*} fundAddresses - addresses to fund with aUSDC
 * @param {*} chains - chains to start. All chains are started if not specified (Avalanche, Moonbeam, Polygon, Fantom, Ethereum).
 * @param {*} options - additional options
 */
async function start(fundAddresses = [], chains = [], options = {}) {
  // For testing purpose
  const dropConnections = [];

  await createAndExport({
    chainOutputPath: configPath.localEvmChains,
    accountsToFund: fundAddresses,
    callback: (chain, _info) => deployAndFundUsdc(chain, fundAddresses),
    chains: chains.length !== 0 ? chains : null,
    relayers,
    relayInterval: options.relayInterval,
  });

  return async () => {
    for (const dropConnection of dropConnections) {
      await dropConnection();
    }
  };
}

// Main execution
// Get the wallet from the environment variables.
const wallet = getWallet();
console.log(wallet.address);

// Fund the given addresses with aUSDC.
const fundAddresses = [wallet.address];

// Add additional addresses to fund here.
for (let j = 2; j < process.argv.length; j++) {
  fundAddresses.push(process.argv[j]);
}

// Insert the chains you want to start here. Available values are:
// 'Avalanche', 'Moonbeam', 'Polygon', 'Fantom', 'Ethereum'
const chains = [];

// Start the chains.
start(fundAddresses, chains);

module.exports = {
  start,
  evmRelayer,
  relayers,
  getWallet,
};
