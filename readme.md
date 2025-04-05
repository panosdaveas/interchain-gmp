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

Run the devnet node in a separate terminal:
```
npm run start
```

Deplay our contract on devnet:
```
npm run deploy local
```

Run the app.js file:
```
node app.js
```

Follow the instructions on terminal to send a message from chain A to chain B.