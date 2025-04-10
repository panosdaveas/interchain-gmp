### interchain general mesage passing supporting timelocked messages

Install the dependencies:
```
npm install
```

Use environment variables to use your private key securely:
```
export ENV= [local|testnet]
export EVM_PRIVATE_KEY=0xYourPrivateKeyHere
```

Build the smart contracts:
```
npm run build
```

If in local env, run the devnet nodes:
```
npm run setup
```

## Open a new terminal window

Export your private key again.
```
export ENV= [local|testnet]
export EVM_PRIVATE_KEY=0xYourPrivateKeyHere
```

Deploy your contract on all local EVM chains:
```
npm run deploy local
```

Or, deploy your contract on testnet EVM chains, e.g.:
```
npm run deploy testnet "Avalanche" "Moonbeam"
```

Run the index.js file:
```
npm run start
```

Follow the instructions on terminal to send a message from chain A to chain B.