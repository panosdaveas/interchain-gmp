const readline = require("node:readline");
const { listLocalChains } = require("../interchain/scripts/libs");
const { tLock } = require("../timelock/timeLock.js");

const tlock = tLock();
const chains = listLocalChains();

async function encrypt(data) {
  const now = Date.now();
  const age = new Date(now + data.decryptionTime * 60 * 1000);
  const tl = await tlock.tlEncrypt(age, data.payload);
  return tl.ciphertext;
}

async function formattedData(data) {
  return {
    sourceChain: data.sourceChain.trim(),
    destinationChain: data.destinationChain.trim(),
    contractAddress: data.contractAddress,
    recipientAddress: data.recipientAddress.trim(),
    payload: await encrypt(data),
    decryptionTime: Number(data.decryptionTime),
  };
}

function readFromTerminal(sourceChain) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("\nEnter your destination chain name: ", (destinationChain) => {
      rl.question("Enter the recipient address: ", (recipientAddress) => {
        rl.question("Enter the message: ", (payload) => {
          rl.question("Enter age in minutes: ", (decryptionTime) => {
            rl.close();
            const data = {
              sourceChain,
              destinationChain,
              contractAddress: chains.find(
                (chain) => chain.name === destinationChain
              ).contract.address,
              recipientAddress,
              payload,
              decryptionTime,
            };
            // Handle the async function with promises
            formattedData(data)
              .then((formattedResult) => {
                console.log(
                  `\n-> Sending message from: ${formattedResult.sourceChain} \n` +
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

function readSenderNetwork() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("\nEnter your source chain name: ", (sourceChain) => {
      rl.close();
      console.log(`Source chain selected: ${sourceChain}`);
      resolve(sourceChain.trim()); // Pass the result to the next function
    });
  });
}

function readSelection() {
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

module.exports = {
  readFromTerminal,
  readSenderNetwork,
  readSelection,
};
