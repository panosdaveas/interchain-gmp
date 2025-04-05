pragma solidity ^0.8.0;

// Import Axelar interfaces
import { AxelarExecutable } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol';
import { IAxelarGateway } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol';
import { IAxelarGasService } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol';

/**
 * @title CrossChainMessaging
 * @dev Enables users on different chains to exchange messages
 */
contract CrossChainMessaging is AxelarExecutable {
    IAxelarGasService public immutable gasService;
    string public currentChain; // Store the current chain name
    
    // Message structure with both sourceChain and destinationChain fields
    struct Message {
        address sender;
        address recipient;
        string content;
        uint256 timestamp;
        bool isRead;
        string sourceChain;     // Where the message came from
        string destinationChain; // Where the message was sent to (this chain)
    }
    
    // Mapping of recipient address to their messages
    mapping(address => Message[]) private userMessages;
    
    event MessageSent(address indexed sender, address indexed recipient, string destinationChain, string content);
    event MessageReceived(address indexed sender, address indexed recipient, string sourceChain, string content);
    
    constructor(
        address gateway_,
        address gasService_,
        string memory chainName_  // Add current chain name parameter
    ) AxelarExecutable(gateway_) {
        gasService = IAxelarGasService(gasService_);
        currentChain = chainName_;
    }
    
    /**
     * @dev Send a message to a user on another chain
     * @param destinationChain The name of the destination chain (e.g., "Ethereum", "Avalanche")
     * @param destinationAddress The contract address on the destination chain
     * @param recipient The recipient's address on the destination chain
     * @param content The message content
     */
    function sendMessage(
        string calldata destinationChain,
        string calldata destinationAddress,
        address recipient,
        string calldata content
    ) external payable {
        // Prepare the payload with sender, recipient, source chain information
        bytes memory payload = abi.encode(msg.sender, recipient, content, currentChain);
        
        // Pay for gas on the destination chain
        if (msg.value > 0) {
            gasService.payNativeGasForContractCall{value: msg.value}(
                address(this),
                destinationChain,
                destinationAddress,
                payload,
                msg.sender
            );
        }
        
        // Send the message across chains
        gateway().callContract(destinationChain, destinationAddress, payload);
        
        emit MessageSent(msg.sender, recipient, destinationChain, content);
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
        // Decode the payload, now including the original source chain
        (address sender, address recipient, string memory content, string memory originalSourceChain) = 
            abi.decode(payload, (address, address, string, string));
        
        // Store the message for the recipient with both chain information
        userMessages[recipient].push(Message({
            sender: sender,
            recipient: recipient,
            content: content,
            timestamp: block.timestamp,
            isRead: false,
            sourceChain: originalSourceChain,  // Use the original source chain identifier
            destinationChain: currentChain     // This is the destination chain
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
    function readMessage(uint256 index) external returns (
        address sender, 
        string memory content, 
        uint256 timestamp, 
        string memory sourceChain,
        string memory destinationChain
    ) {
        require(index < userMessages[msg.sender].length, "Message does not exist");
        
        Message storage message = userMessages[msg.sender][index];
        message.isRead = true;
        
        return (
            message.sender, 
            message.content, 
            message.timestamp, 
            message.sourceChain,
            message.destinationChain
        );
    }
    
    /**
     * @dev Get all messages for the caller
     */
    function getAllMessages() external view returns (Message[] memory) {
        return userMessages[msg.sender];
    }
    
    /**
     * @dev Get the name of the current chain
     */
    function getChainName() external view returns (string memory) {
        return currentChain;
    }
}