### interchain general mesage passing supporting timelocked messages

Install the dependencies:
(Please note that in order to run in local net, you need a version of Node between 16-18)
```
npm install
```

Set environment variables to use your private key securely:
```
export ENV=[local|testnet]
export EVM_PRIVATE_KEY=0xYourPrivateKeyHere
```

Compile the smart contracts:
```
npm run build
```

If in local env, run the devnet nodes in a new terminal window (you will need to export the private key & environment variables again first):
```
npm run setup
```

Deploy your contract on all local EVM chains:
```
npm run deploy
```

Or, deploy your contract on selected testnet EVM chains, e.g.:
```
npm run deploy "Avalanche" "Moonbeam"
```

Run the index.js file:
```
npm run start
```

Follow the instructions on terminal to send a timelocked message from chain A to chain B.