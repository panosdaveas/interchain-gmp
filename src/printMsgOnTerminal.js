import logUpdate from "log-update";
import cliSpinners from "cli-spinners";
import chalk from "chalk";
import { truncate } from "./utils.js";

async function displayMessages(messages, tlock) {
  // Create state for all spinners
  console.log("\n");
  const spinners = messages.map((msg, index) => ({
    text: `Message ${index + 1}: Unlocking...`,
    frames: cliSpinners.dots.frames,
    frameIndex: 0,
    isDone: false,
    result: "",
    decryptionTime: msg.age,
    payload: msg.content,
    isLocked: msg.tlocked,
    isUnlocking: false,
    isUnlocking: false,
    details: "details"
  }));

  // Animation interval
  const interval = setInterval(() => {
    const output = spinners
      .map((spinner, index) => {
        // Check if this spinner is ready to start decryption
        const diffInMs = Date.now() - spinner.decryptionTime;
        const diff = Math.floor((diffInMs-80) / 1000);
        if (
          Date.now() - spinner.decryptionTime > 0 &&
          !spinner.isDecrypting &&
          !spinner.isDone
        ) {
          spinner.isDecrypting = true; // Mark that decryption has started
          spinner.isUnlocking = true; // Mark that unlocking has started
          spinner.frames = cliSpinners.squareCorners.frames;
          spinner.text = "Decrypting...";
          spinner.result = "Decrypting...";

          // Start the decryption process
          tlock.tlDecrypt(spinner.payload).then((result) => {
            spinner.result = `${chalk.yellow(messages[index].sourceChain)} -> ${chalk.yellow(messages[index].destinationChain)} ${chalk.gray(truncate(messages[index].sender))}: ${result}`;
            spinner.isDone = true; // Only mark as done when decryption is complete
          });
        }

        // Advance frame for active spinners
        if (!spinner.isDone) {
          spinner.frameIndex = (spinner.frameIndex + 1) % spinner.frames.length;
          return `${spinner.frames[spinner.frameIndex]} ${spinner.text} ${spinner.isUnlocking ? "" : Math.abs(diff)}`;
          
        } else {
          return `✓ ${spinner.result}`;
        }
      })
      .join("\n");

    logUpdate(output);

    // Only clear the interval when all spinners are truly done (not just started decrypting)
    if (spinners.every((s) => s.isDone)) {
      clearInterval(interval);
    }
  }, 80);
}

export {
  displayMessages,
};