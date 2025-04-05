import { createNetwork, createAndExport, relay } from "@axelar-network/axelar-local-dev";

async function main() {
  const port = 8500

    await createAndExport({
      chainOutputPath: outputPath,
      accountsToFund: fundAddresses,
      callback: (chain, _info) => deployAndFundUsdc(chain, fundAddresses),
      chains: chains.length !== 0 ? chains : null,
      relayInterval: options.relayInterval,
      relayers,
      port,
    });
  // Initialize an Ethereum network
  const eth = await createNetwork({
    name: "Ethereum",
  });

  // Deploy USDC token on the Ethereum network
  await eth.deployToken("USDC", "aUSDC", 6, BigInt(100_000e6));

  // Initialize an Avalanche network
  const avalanche = await createNetwork({
    name: "Avalanche",
  });

  // Deploy USDC token on the Avalanche network
  await avalanche.deployToken("USDC", "aUSDC", 6, BigInt(100_000e6));

  // Extract user wallets for both Ethereum and Avalanche networks
  const [ethUserWallet] = eth.userWallets;
  const [avalancheUserWallet] = avalanche.userWallets;

  // Mint tokens on the source chain (Ethereum)
  await eth.giveToken(ethUserWallet.address, "aUSDC", BigInt(100e6));

  // Get the token contracts for both Ethereum and Avalanche networks
  const usdcEthContract = await eth.getTokenContract("aUSDC");
  const usdcAvalancheContract = await avalanche.getTokenContract("aUSDC");

  // Approve the gateway to use tokens on the source chain (Ethereum)
  const ethApproveTx = await usdcEthContract
    .connect(ethUserWallet)
    .approve(eth.gateway.address, 100e6);
  await ethApproveTx.wait();

  // Request the Ethereum gateway to send tokens to the Avalanche network
  const ethGatewayTx = await eth.gateway
    .connect(ethUserWallet)
    .sendToken(avalanche.name, avalancheUserWallet.address, "aUSDC", 100e6);
  await ethGatewayTx.wait();

  // Relay the transactions
  await relay();

  // Log the token balances
  console.log(
    (await usdcEthContract.balanceOf(ethUserWallet.address)) / 1e6,
    "aUSDC in Ethereum wallet"
  );
  console.log(
    (await usdcAvalancheContract.balanceOf(avalancheUserWallet.address)) / 1e6,
    "aUSDC in Avalanche wallet"
  );
    // const chain = new ChainCloneData(eth.name, eth.gateway, eth.rpc, eth.chainId, eth.constAddressDeployer, eth.create3Deployer, eth.tokenName, eth.tokenSymbol, eth.gasService, eth.AxelarGasService, eth.AxelarDepositService, eth.tokens);
    // const logger = eth.cha 
    console.log(eth.rpc);
}

main();
