### interchain general mesage passing supporting timelocked messages

Install the dependencies:
```
npm install
```

Set environment variables to use your private key securely:
```
export ENV= [local|testnet]
export EVM_PRIVATE_KEY=0xYourPrivateKeyHere
```

Build the smart contracts:
```
npm run build
```

If in local env, run the devnet nodes in a new terminal window (first you will need to export the private key & environment variables again):
```
npm run setup
```

Deploy your contract on all local EVM chains, :
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

Follow the instructions on terminal to send a timelocked message from chain A to chain B.