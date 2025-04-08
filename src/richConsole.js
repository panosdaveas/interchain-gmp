const blessed = require("blessed");
const contrib = require("blessed-contrib");

function getDifferenceInMinutes(age) {
  const now = new Date(); // Current time
  const diffMin = Math.abs(now - age); // Difference in milliseconds
  return Math.floor(diffMin / (1000 * 60) + 1); // Convert to minutes
}

function createMessagesUI(messages, tlock) {
  // Create a screen
  const screen = blessed.screen({
    smartCSR: true,
    title: "Encrypted Messages Viewer",
  });

  const list = blessed.list({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: "50%",
    tags: true,
    border: { type: "line" },
    style: {
      fg: "white",
      selected: { bg: "blue", fg: "white" },
    },
    items: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
  });


  list.on("select", (item) => {
    screen.remove(list); // Optionally remove the list after selection
    screen.render();
    term.green(`You selected: ${item.getContent()}`); // Display the selection
  });
  screen.append(list);

  // Focus the list so it's ready to interact
  list.focus();

  // Render the screen
  screen.render();

  // Create a scrollable list for messages
  const messageList = blessed.list({
    top: "50%",
    left: 0,
    width: "100%",
    height: "50%",
    // padding: 1,
    border: {
      type: "bg",
    },
    style: {
      // border: {
      //   fg: "blue",
      // },
      selected: {
        bg: "white",
        fg: "black",
      },
      item: {
        fg: "white", // Default item color
      },
    },
    keys: true,
    vi: true,
    scrollable: true,
    scrollbar: {
      ch: " ",
      track: {
        bg: "gray",
      },
      style: {
        inverse: true,
      },
    },
  });

  // Add the list to the screen
  screen.append(messageList);
  
  // Set key bindings
  screen.key(["escape", "q", "C-c"], () => process.exit(0));
  screen.key(["up", "k"], () => messageList.up());
  screen.key(["down", "j"], () => messageList.down());

  // Store active spinners
  const spinners = {};
  // Store message items
  const messageItems = [];

  // Initialize the list with placeholders for all messages
  messages.forEach((_, index) => {
    messageList.addItem(`Message ${index + 1}: Loading...`);
    messageItems[index] = `Message ${index + 1}: Loading...`;
  });

  // Initial render
  screen.render();

  // Process messages and add them to the UI
  messages.forEach((message, index) => {
    processMessage(message, index);
  });

  // Process a single message
  async function processMessage(message, index) {
    const result = await tlock.tlDecrypt(message.content);
    message.id = index;

    if (result.tlocked) {
      // Message is encrypted
      const time = getDifferenceInMinutes(result.age);
      const spinnerChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
      let spinnerIndex = 0;

      // Update placeholder for encrypted message
      const itemText = `Message ${index + 1}: ${
        message.id
      } [Decrypting...in ${time} min]`;
      messageList.setItem(index, itemText);
      messageItems[index] = itemText;
      screen.render();

      // Create spinner animation
      spinners[message.id] = setInterval(() => {
        spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
        const spinnerChar = spinnerChars[spinnerIndex];

        // Update message text with spinner animation
        messageItems[index] = `Message ${index + 1}: ${
          message.id
        } [${spinnerChar} Decrypting...in ${time} min]`;
        messageList.setItem(index, messageItems[index]);
        screen.render();
      }, 100);

      // Set up decryption timeout
      setTimeout(async () => {
        // Stop spinner animation
        clearInterval(spinners[message.id]);

        // Update UI to show decryption in progress
        messageItems[index] = `Message ${index + 1}: ${
          message.id
        } [Decrypting...]`;
        messageList.setItem(index, messageItems[index]);
        screen.render();

        try {
          // Decrypt the message
          const decryptedResult = await tlock.tlDecrypt(message.content);

          if (!decryptedResult.tlocked || message.decryptionTime === 0) {
            // Successfully decrypted
            messageItems[index] = `Message ${index + 1}: ${message.sourceChain} -> ${message.destinationChain}: "${
              decryptedResult.plaintext
            }"`;
            messageList.setItem(index, messageItems[index]);

            // We need to update the specific item's style
            const item = messageList.items[index];
            if (item) {
              item.style.fg = "green";
            }
          } else {
            // Failed to decrypt
            messageItems[index] = `Message ${index + 1}: ${
              message.id
            } [Decryption failed]`;
            messageList.setItem(index, messageItems[index]);

            // Update item style to red
            const item = messageList.items[index];
            if (item) {
              item.style.fg = "red";
            }
          }
        } catch (error) {
          // Error during decryption
          messageItems[index] = `Message ${index + 1}: ${message.id} [Error: ${
            error.message
          }]`;
          messageList.setItem(index, messageItems[index]);

          // Update item style to red
          const item = messageList.items[index];
          if (item) {
            item.style.fg = "red";
          }
        }

        screen.render();
      }, time * 60 * 1000); // Convert minutes to milliseconds
    } else {
      // Message is already decrypted
      messageItems[index] = `Message ${index + 1}: ${message.id} "${
        result.plaintext
      }"`;
      messageList.setItem(index, messageItems[index]);

      // Set item style to green
      const item = messageList.items[index];
      if (item) {
        item.style.fg = "green";
      }

      screen.render();
    }
  }

  // Return the screen and cleanup function
  return {
    screen,
    cleanup: () => {
      // Clear all spinners
      Object.values(spinners).forEach((interval) => clearInterval(interval));
    },
  };
}

module.exports = {
  createMessagesUI,
};
