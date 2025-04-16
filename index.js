/* eslint-disable no-unused-vars */
import { displayMessages } from "./src/printMsgOnTerminal.js";
import {
  readSendMessage,
  readAction,
  readPrompt,
} from "./src/readFromTerminal.js";
import sendDummyTx from "./src/utils.js";
import chalk from "chalk";
import { appendAgeToPayload } from "./timelock/utils.js";
import clear from "console-clear";

import { ethers } from "ethers";
import { tLock } from "./timelock/timeLock.js";
import {
  userASendsMessage,
  userBReadsMessages,
} from "./src/contractHandlers.js";

import { getChains, checkEnv } from "./interchain/scripts/libs/index.js";

async function main() {
  clear();
  const privateKey = process.env.EVM_PRIVATE_KEY;
  const env = process.env.ENV;
  checkEnv(env);

  // select chain prompt
  console.log("\nEnvironment:", chalk.bold.italic(env.toUpperCase()));
  const chains = getChains();
  const chainNames = chains.map((chain) => chain.name);
  const selectedChain = await readPrompt(
    "list",
    "sourceChain",
    "Select your source chain:",
    chainNames
  );
  // get the source chain object
  const chain = chains.find((chain) => chain.name === selectedChain);

  // Create wallet instance with provider
  const provider = new ethers.providers.JsonRpcProvider(chain["rpc"]);
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`\n✅ Connected to "name" (Chain ID: ${chain["chainId"]})`);

  // // Get wallet address and balance
  const address = await wallet.getAddress();
  const balance = await provider.getBalance(address);

  console.log(`💳 Wallet Address: ${address}`);
  console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`);

  const tlock = new tLock();
  const select = await readAction();
  switch (select) {
    // Send a message
    case 1:
      sendDummyTx(wallet, chains, chain);

      // **Uncomment for manual input**
      // const data = await readSendMessage(chain.name);
      // await userASendsMessage(
      //   wallet,
      //   chain.contract.address,
      //   data
      // );

      break;
    case 2:
      // Get all messages from contract for the logged address
      const messages = await userBReadsMessages(wallet, chain.contract.address);
      console.log("\nYou have", messages.length, "messages:\n");
      const formattedMessages = await appendAgeToPayload(messages);
      await displayMessages(formattedMessages, tlock);
      break;
    default:
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
});
