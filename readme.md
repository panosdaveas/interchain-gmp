### timelocked interchain general mesage passing

Install the dependencies:
```
npm install
```

Use environment variables to use your private key securely:
```
export EVM_PRIVATE_KEY=0xYourPrivateKeyHere
```

Build the smart contracts:
```
npm run build
```

Run the local devnet nodes:
```
npm run setup
```

## Open a new terminal window

Export your private key again.


Deploy your contract on all local EVM chains:
```
npm run deploy local
```

Deploy your contract on testnet EVM chains:
```
npm run deploy testnet "Avalanche" "Moonbeam"
```

Run the index.js file:
```
npm run start [local|testnet]
```

Follow the instructions on terminal to send a message from chain A to chain B.