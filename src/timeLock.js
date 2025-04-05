const { roundAt, roundTime, timelockEncrypt, timelockDecrypt } = require("tlock-js");
const { quicknetClient } = require("drand-client");
const { MAINNET_CHAIN_INFO } = require("tlock-js/drand/defaults.js");

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
      return {plaintext, tlocked};
    } catch (error) {
      tlocked = true
      const err = localisedDecryptionMessageOrDefault(error);
      const age = err.timeToDecryption;
      // console.error(err.messageStr);
      return {age, tlocked};
      // throw error;
    }
  };

  const errorMessage = (err) => {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === "string") {
      return err;
    }

    return "Unknown error";
  };

  const localisedDecryptionMessageOrDefault = (err) => {
    const message = errorMessage(err);
    const tooEarlyToDecryptErrorMessage =
      "It's too early to decrypt the ciphertext - decryptable at round ";

    if (!message.startsWith(tooEarlyToDecryptErrorMessage)) {
      return "There was an error during decryption! Is your ciphertext valid?";
    }

    const roundNumber = Number.parseInt(
      message.split(tooEarlyToDecryptErrorMessage)[1]
    );
    const timeToDecryption = new Date(
      roundTime(MAINNET_CHAIN_INFO, roundNumber)
    );
    const messageStr = `This message cannot be decrypted until ${timeToDecryption.toLocaleDateString()} at ${timeToDecryption.toLocaleTimeString()}`;
    return {messageStr, timeToDecryption};
  };

  const getDifferenceInMinutes = (age) => {
    const now = new Date(); // Current time
    const diffMin = Math.abs(now - age); // Difference in milliseconds
    return Math.floor(diffMin / (1000 * 60) + 1); // Convert to minutes
  };

  const parseMessagesAndDecrypt = async (messages) => {
    const decryptedMessages = [];
    for (const message of messages) {
      const result = await tlDecrypt(message.content);
      if (result.tlocked) {
        const time = getDifferenceInMinutes(result.age);
        // console.log(time);
        decryptedMessages.push({
          ...message,
          ...{age: time},
        });
      } else {
        // console.log(result.plaintext);
        decryptedMessages.push({
          ...message,
          ...{plaintext:result.plaintext},
        });
      }
    }
    return decryptedMessages;
  };

  return {
    tlEncrypt,
    tlDecrypt,
    localisedDecryptionMessageOrDefault,
    getDifferenceInMinutes,
    parseMessagesAndDecrypt,
  };
}

module.exports = {
  tLock,
};
