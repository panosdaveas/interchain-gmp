// Required imports
import { ethers } from "ethers";
import ContractABI from "../contracts/contractABI.js";
import axios from "axios"; // For gas estimation API calls
import { AxelarQueryAPI, Environment, CHAINS } from "@axelar-network/axelarjs-sdk";

// Contract ABI - this is a simplified version, you'll need the full ABI from your contract
const contractABI = ContractABI;


// Class to handle cross-chain messaging
class CrossChainMessenger {
  constructor(provider, signer, contractAddress) {
    this.provider = provider;
    this.signer = signer;
    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(
      this.contractAddress,
      contractABI,
      this.signer
    );
  }

  /**
   * Send a message to a user on another chain
   * @param {string} destinationChain - The destination chain name (e.g., "Ethereum", "Avalanche")
   * @param {string} destinationContractAddress - The contract address on destination chain
   * @param {string} recipientAddress - The recipient's address on destination chain
   * @param {string} message - The message content
   */
  async sendMessage(
    sourceChain,
    destinationChain,
    destinationContractAddress,
    recipientAddress,
    message
  ) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      // Get gas estimate for cross-chain transaction
      const gasAmount = await this.estimateGasForDestinationChain(
        sourceChain,
        destinationChain,
        message,
      );

      // Send the transaction with gas payment
      const tx = await this.contract.sendMessage(
        destinationChain,
        destinationContractAddress,
        recipientAddress,
        message,
        { value: gasAmount }
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Message sent!", receipt);
      return receipt;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Get all messages for the connected user
   */
  async getAllMessages() {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      const messages = await this.contract.getAllMessages();

      // Format the messages for easier consumption
      return messages.map((msg) => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: new Date(parseInt(msg.timestamp.toString())*1000).toLocaleString(),
        isRead: msg.isRead,
      }));
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  }

  /**
   * Read a specific message by index
   * @param {number} index - The index of the message to read
   */
  async readMessage(index) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      const [sender, content, timestamp] = await this.contract.readMessage(
        index
      );

      return {
        sender,
        content,
        timestamp: new Date(timestamp.toNumber() * 1000),
      };
    } catch (error) {
      console.error("Error reading message:", error);
      throw error;
    }
  }

  /**
   * Estimate gas required for the destination chain execution
   * You might need to call Axelar's API or use a different method depending on setup
   */
  async estimateGasForDestinationChain(sourceChain, destinationChain, payload) {
    const API = new AxelarQueryAPI({ environment: Environment.TESTNET });
    const response = API.estimateGasFee(
      sourceChain, // source chain\
      destinationChain, // destination chain
      700000, // gas limit
      1.1, // gas multiplier
      undefined, // memo
      undefined, // token
      payload // payload
    );
    
   response
     .then((res) => {
       console.log("Result:", res);
     })
     .catch((error) => {
       console.error("An error occurred:", error);
     });

    return response;
  }
}

// Example usage functions modified for Node.js:
// ============================================================

// 1. For User A on Chain A sending a message to User B on Chain B
export async function userASendsMessage(wallet, contractAddress, data) {
  try {
    // Create messenger with the provided wallet and contract address
    const messenger = new CrossChainMessenger(
      wallet.provider,
      wallet,
      contractAddress
    );

    // User A sends a message to User B
    const receipt = await messenger.sendMessage(
      data.networkName, // Source chain name
      data.destinationChain, // Destination chain name
      data.contractAddress, // Contract address on Chain B
      data.recipientAddress, // User B's address
      data.payload // Message content
    );

    return receipt;
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}

// 2. For User B on Chain B retrieving messages
export async function userBReadsMessages(wallet, contractAddress) {
  try {
    // Create messenger with the provided wallet and contract address
    const messenger = new CrossChainMessenger(
      wallet.provider,
      wallet,
      contractAddress
    );
    // User B reads all their messages
    const allMessages = await messenger.getAllMessages();
    return allMessages;
  } catch (error) {
    console.error("Failed to read messages:", error);
    throw error;
  }
}