const readline = require("node:readline");
const { listLocalChains } = require("../interchain/scripts/libs");
const { tLock } = require("../timelock/timeLock.js");
const inquirer = require("inquirer");

const tlock = tLock();
const chains = listLocalChains();
const chainNames = chains.map((chain) => chain.name);

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

async function readPrompt(type, name, message, choices) {
  const answer = await inquirer.prompt([
    {
      type: type,
      name: name,
      message: message,
      choices: choices,
    },
  ]);

  console.log(`Selected: ${answer[name]}`);
  return answer[name];
}

async function readSendMessage(sourceChain) {
  console.log("\n");
  const destinationChain = await readPrompt("list", "destinationChain", "Select the destination chain:", chainNames);
  // rl.question("\nEnter your destination chain name: ", (destinationChain) => {
  const recipientAddress = await readPrompt('input', 'recipientAddress', 'Enter the recipient address:');
  const payload = await readPrompt('input', 'payload', 'Enter your message:');
  const decryptionTime = await readPrompt('input', 'decryptionTime', 'Enter age in minutes:');
  const data = {
    sourceChain: sourceChain,
    destinationChain,
    contractAddress: chains.find(
      (chain) => chain.name === destinationChain
    ).contract.address,
    recipientAddress,
    payload,
    decryptionTime,
  };
  // Handle the async function with promises
  const formattedResult = await formattedData(data);
  console.log(
    `\n-> Sending message from: ${formattedResult.sourceChain} \n` +
    `-> to: ${formattedResult.destinationChain} \n` +
    `-> on contract: ${formattedResult.contractAddress} \n` +
    `-> with recipient: ${formattedResult.recipientAddress} \n` +
    `-> and payload: "${formattedResult.payload}" \n` +
    `-> decryptable in: ${formattedResult.decryptionTime} minutes\n`
  );      
  return formattedResult;
  };

  async function readAction() {
    console.log("\n");
    const actions = ["[1] Send a message", "[2] Read all messages"];
    const choices = actions.map((action, index) => ({
      name: action, // What's displayed to the user
      value: { action, index }, // The actual value returned when selected
    }));
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: "Select your action:",
        choices: choices,
      },
    ]);
    const { action, index } = answer.selection;
    return index + 1;
  }

  module.exports = {
    readSendMessage,
    readAction,
    readPrompt,
  };
