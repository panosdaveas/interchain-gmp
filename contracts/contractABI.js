const ContractABI = [
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "commandId",
          type: "bytes32",
        },
        {
          internalType: "string",
          name: "sourceChain",
          type: "string",
        },
        {
          internalType: "string",
          name: "sourceAddress",
          type: "string",
        },
        {
          internalType: "bytes",
          name: "payload",
          type: "bytes",
        },
      ],
      name: "execute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "gateway_",
          type: "address",
        },
        {
          internalType: "address",
          name: "gasService_",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "InvalidAddress",
      type: "error",
    },
    {
      inputs: [],
      name: "NotApprovedByGateway",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "sourceChain",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "content",
          type: "string",
        },
      ],
      name: "MessageReceived",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "destinationChain",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "content",
          type: "string",
        },
      ],
      name: "MessageSent",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "readMessage",
      outputs: [
        {
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          internalType: "string",
          name: "content",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "destinationChain",
          type: "string",
        },
        {
          internalType: "string",
          name: "destinationAddress",
          type: "string",
        },
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "string",
          name: "content",
          type: "string",
        },
      ],
      name: "sendMessage",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "gasService",
      outputs: [
        {
          internalType: "contract IAxelarGasService",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "gateway",
      outputs: [
        {
          internalType: "contract IAxelarGateway",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllMessages",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "sender",
              type: "address",
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              internalType: "string",
              name: "content",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isRead",
              type: "bool",
            },
          ],
          internalType: "struct CrossChainMessaging.Message[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "getMessageCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
];               

module.exports = ContractABI;