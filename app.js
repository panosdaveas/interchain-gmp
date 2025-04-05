import { ethers } from "ethers";
import { networksList } from "./src/networks.js";
import { readFromTerminal, readSenderNetwork, readSelection } from "./src/readFromTerminal.js";
import { userASendsMessage, userBReadsMessages } from "./src/contractHandlers.js";
import { tLock } from "./src/timeLock.js";

// Load the private key from an environment variable (NEVER hardcode it!)
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("Error: PRIVATE_KEY is not set in environment variables.");
  process.exit(1);
}

const tlock = tLock();

// read network from user
const network = networksList[await readSenderNetwork()];

// Create wallet instance with provider
const provider = new ethers.JsonRpcProvider(network.rpcUrls);
const wallet = new ethers.Wallet(privateKey, provider);

async function main() {
  // Get network details
  const networkInfo = await provider.getNetwork();
  const networkName = network.icName || "Unknown Network";
  console.log(
    `\n-> Connected to ${networkName} (Chain ID: ${networkInfo.chainId})`
  );

  // Get wallet address and balance
  const address = await wallet.getAddress();
  const balance = await provider.getBalance(address);

  console.log(`💳 Wallet Address: ${address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

  // case 1: user A sends a message to user B, case 2: user B reads all messages
  // Read from terminal
  const select = await readSelection();
  switch (select) {
    case 1:
      const rlData = await readFromTerminal(networkName);
      const sendMessage = await userASendsMessage(
        wallet, 
        network.contractDeployment, 
        rlData,
      );
      // const result = await tlock.tlDecrypt(rlData.payload);
      // if (result.tlocked) {
      //   const time = tlock.getDifferenceInMinutes(result.age);
      //   console.log(time);
      // } else {
      //   console.log(result.plaintext);
      // }
      break;
    case 2:
      // Get all messages
      const messages = await userBReadsMessages(
        wallet,
        network.contractDeployment,
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