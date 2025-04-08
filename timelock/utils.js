const { roundTime } = require("tlock-js");
const { MAINNET_CHAIN_INFO } = require("tlock-js/drand/defaults.js");

const errorMessage = (err) => {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }

  return "Unknown error";
};

function getDifferenceInMinutes(age) {
  const now = new Date(); // Current time
  const ms = Math.abs(now - age); // Difference in milliseconds
  const min = Math.floor(ms / (1000 * 60)); // Difference in minutes
  min = Math.abs(now - age) + 1; // Round minutes
  return { ms, min };
}

function extractTlockDate(payload) {
  const lines = payload.split("\n");

  for (const line of lines) {
    try {
      const decoded = Buffer.from(line, "base64").toString("utf8");
      const match = decoded.match(/tlock (\d+)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const unlockDate = new Date(roundTime(MAINNET_CHAIN_INFO, minutes));
        return unlockDate;
      }
    } catch (err) {
      // not a base64 line, skip
    }
  }

  return null; // tlock not found
}

function appendAgeToPayload(messages) {
  messages.forEach((message) => {
    message.tlocked = false;
    const unlockDate = extractTlockDate(message.content);
    if (unlockDate) {
      message.age = unlockDate;
    }
    if (message.age > Date.now()) {
      message.tlocked = true;
    }
  });
  return messages;
}

module.exports = {
  errorMessage,
  getDifferenceInMinutes,
  appendAgeToPayload,
};
