const { roundTime } = require("tlock-js");

const errorMessage = (err) => {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }

  return "Unknown error";
};

const localisedDecryptionMessageOrDefault = (err, CHAIN_INFO) => {
  const message = errorMessage(err);
  const tooEarlyToDecryptErrorMessage =
    "It's too early to decrypt the ciphertext - decryptable at round ";

  if (!message.startsWith(tooEarlyToDecryptErrorMessage)) {
    return "There was an error during decryption! Is your ciphertext valid?";
  }

  const roundNumber = Number.parseInt(
    message.split(tooEarlyToDecryptErrorMessage)[1]
  );
  const timeToDecryption = new Date(roundTime(CHAIN_INFO, roundNumber));
  const messageStr = `This message cannot be decrypted until ${timeToDecryption.toLocaleDateString()} at ${timeToDecryption.toLocaleTimeString()}`;
  return { messageStr, timeToDecryption };
};

const getDifferenceInMinutes = (age) => {
  const now = new Date(); // Current time
  const diffMin = Math.abs(now - age); // Difference in milliseconds
  return Math.floor(diffMin / (1000 * 60) + 1); // Convert to minutes
};

const parseMessagesAndDecrypt = async (messages, tlock) => {
  const decryptedMessages = [];
  for (const message of messages) {
    const result = await tlock.tlDecrypt(message.content);
    if (result.tlocked) {
      const time = getDifferenceInMinutes(result.age);
      // console.log(time);
      decryptedMessages.push({
        ...message,
        ...{ age: time },
      });
    } else {
      // console.log(result.plaintext);
      decryptedMessages.push({
        ...message,
        ...{ content: result.plaintext },
      });
    }
  }
  return decryptedMessages;
};

module.exports = {
  errorMessage,
  localisedDecryptionMessageOrDefault,
  getDifferenceInMinutes,
  parseMessagesAndDecrypt,
};
