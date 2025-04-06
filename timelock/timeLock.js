const { roundAt, timelockEncrypt, timelockDecrypt } = require("tlock-js");
const { quicknetClient } = require("drand-client");
const { MAINNET_CHAIN_INFO } = require("tlock-js/drand/defaults.js");
const { localisedDecryptionMessageOrDefault } = require("./utils");

function tLock() {
  const client = quicknetClient();

  const tlEncrypt = async (tlAge, payload) => {
    const decryptionTime = tlAge.getTime();
    try {
      const chainInfo = await client.chain().info();
      const roundNumber = await roundAt(decryptionTime, chainInfo);
      const ciphertext = await timelockEncrypt(
        roundNumber,
        Buffer.from(payload),
        client
      );
      return {
        ciphertext,
        client,
      };
    } catch (error) {
      console.error("Time-lock encryption error:", error);
      throw error;
    }
  };

  const tlDecrypt = async (ciphertext) => {
    let tlocked = false;
    try {
      const decrypted = await timelockDecrypt(ciphertext, client);
      const plaintext = decrypted.toString();
      return { plaintext, tlocked };
    } catch (error) {
      tlocked = true;
      const err = localisedDecryptionMessageOrDefault(
        error,
        MAINNET_CHAIN_INFO
      );
      const age = err.timeToDecryption;
      // console.error(err.messageStr);
      return { age, tlocked };
      // throw error;
    }
  };

  return {
    tlEncrypt,
    tlDecrypt,
  };
}

module.exports = {
  tLock,
};
