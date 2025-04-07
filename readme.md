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
npm build
```

Run the local devnet nodes:
```
npm run start
```
## Open a new terminal window

Export your private key again.

Deploy your contract on devnet:
```
npm run deploy local
```

Run the index.js file:
```
npm run test
```

Follow the instructions on terminal to send a message from chain A to chain B.