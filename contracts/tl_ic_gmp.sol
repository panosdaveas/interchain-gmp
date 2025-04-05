// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import Axelar interfaces
import { AxelarExecutable } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol';
import { IAxelarGateway } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol';
import { IAxelarGasService } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol';
import { IERC20 } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol';

/**
 * @title CrossChainMessaging
 * @dev Enables users on different chains to exchange messages
 */
contract CrossChainMessaging is AxelarExecutable {
    IAxelarGasService public immutable gasService;
    
    // Message structure
    struct Message {
        address sender;
        address recipient;
        string content;
        uint256 timestamp;
        bool isRead;
    }
    
    // Mapping of recipient address to their messages
    mapping(address => Message[]) private userMessages;
    
    event MessageSent(address indexed sender, address indexed recipient, string destinationChain, string content);
    event MessageReceived(address indexed sender, address indexed recipient, string sourceChain, string content);
    
    constructor(
        address _gateway,
        address _gasService
    ) AxelarExecutable(_gateway) {
        gasService = IAxelarGasService(_gasService);
    }
    
    /**
     * @dev Send a message to a user on another chain
     * @param destinationChain The name of the destination chain (e.g., "Ethereum", "Avalanche")
     * @param destinationAddress The contract address on the destination chain
     * @param recipient The recipient's address on the destination chain
     * @param _content The message content
     */
    function sendMessage(
        string calldata destinationChain,
        string calldata destinationAddress,
        address recipient,
        string calldata _content
    ) external payable {
        require(msg.value > 0, 'Gas payment is required');
        // Prepare the payload with sender and recipient information
        bytes memory payload = abi.encode(msg.sender, recipient, _content);
        
        // Pay for gas on the destination chain
        gasService.payNativeGasForContractCall{value: msg.value}(
            address(this),
            destinationChain,
            destinationAddress,
            payload,
            msg.sender
        );
        
        // Send the message across chains
        gateway().callContract(destinationChain, destinationAddress, payload);
        
        emit MessageSent(msg.sender, recipient, destinationChain, _content);
    }
    
    /**
     * @dev Receive a message from another chain
     */
    function _execute(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        // Decode the payload
        (address sender, address recipient, string memory content) = abi.decode(payload, (address, address, string));
        
        // Store the message for the recipient
        userMessages[recipient].push(Message({
            sender: sender,
            recipient: recipient,
            content: content,
            timestamp: block.timestamp,
            isRead: false
        }));
        
        emit MessageReceived(sender, recipient, sourceChain, content);
    }
    
    /**
     * @dev Get the number of messages for a user
     */
    function getMessageCount(address user) external view returns (uint256) {
        return userMessages[user].length;
    }
    
    /**
     * @dev Read a message by index
     */
    function readMessage(uint256 index) external returns (address sender, string memory content, uint256 timestamp) {
        require(index < userMessages[msg.sender].length, "Message does not exist");
        
        Message storage message = userMessages[msg.sender][index];
        message.isRead = true;
        
        return (message.sender, message.content, message.timestamp);
    }
    
    /**
     * @dev Get all messages for the caller
     */
    function getAllMessages() external view returns (Message[] memory) {
        return userMessages[msg.sender];
    }
}

// 0x589B3Ce3A19a46fCeea817438fd601Db49DFc9F0 Sepolia Deployment
// 0x96122D7f5B596d0a11115f96284f6d10A4Ae59a8 Avalanche Deployment
// 1st tx: https://testnet.axelarscan.io/gmp/0x5e89e49050fc9670c6b7a607e80916763d9c9533070260bfe2caf0cb0054cec4-1

// Sucessfull tx sent
//https://testnet.axelarscan.io/gmp/0xee4deca7545c423fb34cb4383c384b09aedc71b893961cdd93025642c5ebb982