const {
  readSendMessage,
  readAction,
  readPrompt,
} = require("./src/readFromTerminal.js");


const { ethers, getDefaultProvider } = require("ethers");
const { tLock } = require("./timelock/timeLock.js");
const {
  userASendsMessage,
  userBReadsMessages,
} = require("./src/contractHandlers.js");

const { parseMessagesAndDecrypt } = require("./timelock/utils");

const {
  getEVMChains,
  getWallet,
  listLocalChains,
} = require("./interchain/scripts/libs");
const { configPath } = require("./interchain/config");
const { sleep } = require("@axelar-network/axelarjs-sdk");


async function main() {
  //   const wallet = getWallet();
  //   const chain = chains.find((chain) => chain.name === "Avalanche");
  //   const provider = getDefaultProvider(chain.rpc);
  const privateKey = process.env.EVM_PRIVATE_KEY;
  
  // select chain prompt
  const chains = listLocalChains();
  const chainNames = chains.map((chain) => chain.name);
  const selectedChain = await readPrompt("list", "sourceChain", "Select your source chain:", chainNames);
  // get the source chain object
  const chain = chains.find((chain) => chain.name === selectedChain);

  // Create wallet instance with provider
  const provider = new ethers.providers.JsonRpcProvider(chain["rpc"]);
  const wallet = new ethers.Wallet(privateKey, provider);
  const networkInfo = await provider.getNetwork();

  console.log(
    `\n✅ Connected to ${chain["name"]} (Chain ID: ${chain["chainId"]})`
  );

  // // Get wallet address and balance
  const address = await wallet.getAddress();
  const balance = await provider.getBalance(address);

  console.log(`💳 Wallet Address: ${address}`);
  console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`);

  const tlock = tLock();
  // const select = await readSelection();
  const select = await readAction();
  switch (select) {
    // Send a message
    case 1:
      const data = await readSendMessage(chain.name);
      await userASendsMessage(
        wallet,
        chain.contract.address,
        data
      );
      break;
    case 2:
      // Get all messages
      const messages = await userBReadsMessages(wallet, chain.contract.address);
      console.log("\nYou have", messages.length, "messages:\n");
      const decryptedMessages = await parseMessagesAndDecrypt(messages, tlock);
      console.log(decryptedMessages);
      break;
    default:
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
});
