import readline from "node:readline";
import { networksList } from "./networks.js";
import { tLock } from "./timeLock.js";

const tlock = await tLock();

async function encrypt(data) {
  const now = Date.now();
  const age = new Date(now + data.decryptionTime * 60 * 1000);
  const tl = await tlock.tlEncrypt(age, data.payload);
  return tl.ciphertext;
}

export async function formattedData(data) {
  return {
    networkName: data.networkName.trim(),
    destinationChain: networksList[data.destinationChain].icName,
    contractAddress: data.contractAddress.trim(),
    recipientAddress: data.recipientAddress.trim(),
    decryptionTime: Number(data.decryptionTime.trim()),
    payload: await encrypt(data),
  };
}

export function readFromTerminal(networkName) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("\nAvailable networks:");
    let i = 1;
    for (const net in networksList) {
      console.log(`${i}: ${networksList[net].inputName}`);
      i++;
    }

    rl.question("\nEnter your destination chain name: ", (destinationChain) => {
      rl.question("Enter the recipient address: ", (recipientAddress) => {
        rl.question("Enter the message: ", (payload) => {
          rl.question("Enter age in minutes: ", (decryptionTime) => {
            rl.close();
            const data = {
              networkName,
              destinationChain,
              contractAddress:
                networksList[destinationChain].contractDeployment,
              recipientAddress,
              payload,
              decryptionTime,
            };
            // Handle the async function with promises
            formattedData(data)
              .then((formattedResult) => {
                console.log(
                  `\n-> Sending message from: ${formattedResult.networkName} \n` +
                    `-> to: ${formattedResult.destinationChain} \n` +
                    `-> on contract: ${formattedResult.contractAddress} \n` +
                    `-> with recipient: ${formattedResult.recipientAddress} \n` +
                    `-> and payload: "${formattedResult.payload}" \n` +
                    `-> decryptable in: ${formattedResult.decryptionTime} minutes\n`
                );
                resolve(formattedResult);
              })
              .catch((error) => {
                console.error("Error formatting data:", error);
              });
          });
        });
      });
    });
  });
}

export function readSenderNetwork() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("Available networks:");
    let i = 1;
    for (const net in networksList) {
      console.log(`${i}: ${networksList[net].inputName}`);
      i++;
    }

    rl.question("\nEnter your source chain name: ", (sourceChain) => {
      rl.close();
      console.log(`Source chain selected: ${sourceChain}`);
      resolve(sourceChain.trim()); // Pass the result to the next function
    });
  });
}

export function readSelection() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("Available options:");
    let i = 1;
    console.log(`[${i}] Send a message`);
    i++;
    console.log(`[${i}] Read all messages`);
    i++;

    rl.question("\nEnter your selection: ", (selection) => {
      rl.close();
      resolve(Number(selection.trim())); // Pass the result to the next function
    });
  });
}