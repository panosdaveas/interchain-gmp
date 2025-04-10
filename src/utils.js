import fs from "fs-extra";
import { userASendsMessage } from "./contractHandlers.js";
import { encrypt } from "./readFromTerminal.js";

const dataArray = fs.readJSONSync("./src/transactions/dummyTx.json");

async function sendDummyTx(wallet, chains, sourceChain) {
    for (const data of dataArray) {
      data.decryptionTime = data.decryptionTime;
      data.payload = await encrypt(data);
      data.contractAddress = chains.find(
        (chain) => chain.name === data.destinationChain
      ).contract.address;
      await userASendsMessage(wallet, sourceChain.contract.address, data);
    }
}

function truncate(str) {
  return str.slice(0, 4) + "..." + str.slice(-4);
}

export { sendDummyTx, truncate };
export default sendDummyTx;