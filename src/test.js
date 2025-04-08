const logUpdate = require("log-update");
const cliSpinners = require("cli-spinners");

async function displayMessages(messages, tlock) {
  // Create state for all spinners
  console.log("\n");
  const spinners = messages.map((msg, index) => ({
    text: `Transaction ${index + 1}: Decrypting message...`,
    frames: cliSpinners.dots.frames,
    frameIndex: 0,
    isDone: false,
    result: "",
    decryptionTime: msg.age,
    payload: msg.content,
    isLocked: msg.tlocked,
  }));

  // Animation interval
  const interval = setInterval(() => {
    const output = spinners
      .map((spinner, index) => {
        // Check if this spinner is done
        const diff = Date.now() - spinner.decryptionTime;
        if (
          Date.now() - spinner.decryptionTime > 0 
          && !spinner.isDone
        ) {
          spinner.isDone = true;
          if (spinner.isLocked) {
            spinner.result = "Unlocking...";
            const interval = setInterval(async () => {
              const result = await tlock.tlDecrypt(spinner.payload);
              spinner.result = `Transaction ${index + 1}: ${result}`;
              clearInterval(interval);
            }, 80);
          } else {
            spinner.result = `Transaction ${index + 1}: ${spinner.payload}`; 
          }
        }

        // Advance frame for active spinners
        if (!spinner.isDone) {
          spinner.frameIndex = (spinner.frameIndex + 1) % spinner.frames.length;
          return `${spinner.frames[spinner.frameIndex]} ${spinner.text} in ${Math.abs(diff)}`;
        } else {
          return `✓ ${spinner.result}`;
        }
      })
      .join("\n");

    logUpdate(output);

    // If all spinners are done, clear the interval
    if (spinners.every((s) => s.isDone)) {
      clearInterval(interval);
    }
  }, 80);
}

function truncate(str) {
  return str.slice(0, 4) + "..." + str.slice(-4);
}

module.exports = {
  displayMessages,
};