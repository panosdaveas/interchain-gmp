const {
  readSenderNetwork, readSelection, readFromTerminal,
} = require('./src/readFromTerminal.js');

const { ethers, getDefaultProvider } = require("ethers");
const { tLock } = require("./src/timeLock.js");
const {
  userASendsMessage,
  userBReadsMessages,
} = require("./src/contractHandlers.js");

const {
  getEVMChains,
  getWallet,
  listLocalChains,
} = require("./interchain/scripts/libs");
const { configPath } = require("./interchain/config");

async function main() {
//   const wallet = getWallet();
//   const chain = chains.find((chain) => chain.name === "Avalanche");
//   const provider = getDefaultProvider(chain.rpc);
  const privateKey = process.env.EVM_PRIVATE_KEY;
  const chains = listLocalChains();
  const names = chains.map((chain) => chain.name);

  console.log(names);
  const targetChain = await readSenderNetwork();
  const chain = chains.find((chain) => chain.name === targetChain);

  // Create wallet instance with provider
  const provider = new ethers.providers.JsonRpcProvider(chain["rpc"]);
  const wallet = new ethers.Wallet(privateKey, provider);
  const networkInfo = await provider.getNetwork();

  console.log(
    `\n-> Connected to ${chain['name']} (Chain ID: ${chain['chainId']})`
  );

  // // Get wallet address and balance
  const address = await wallet.getAddress();
  const balance = await provider.getBalance(address);

  console.log(`💳 Wallet Address: ${address}`);
  console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  const tlock = tLock();
  const select = await readSelection();
  switch (select) {
      case 1:
      const rlData = await readFromTerminal(chain.name);
      const sendMessage = await userASendsMessage(
          wallet,
          chain.contract.address,
          rlData
      );
      break;
      case 2:
  //     // Get all messages
      const messages = await userBReadsMessages(
          wallet,
          chain.contract.address
      );
      console.log("\nYou have", messages.length, "messages:\n");
      const decryptedMessages = await tlock.parseMessagesAndDecrypt(messages);
      console.log(decryptedMessages);
      break;
      default:
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
});