const networksList = {
  // avalanche: {
  //   inputName: "avalanche",
  //   displayName: "Avalanche",
  //   icName: "Avalanche",
  //   chainId: 43113,
  //   chainName: "Avalanche",
  //   rpcUrls: "https://api.avax-test.network/ext/bc/C/rpc",
  //   nativeCurrency: {
  //     name: "Avalanche",
  //     symbol: "AVAX",
  //     decimals: 18,
  //   },
  //   blockExplorerUrls: ["https://snowtrace.io/"],
  //   contractDeployment: "0x96122D7f5B596d0a11115f96284f6d10A4Ae59a8",
  // },
  sepolia: {
    inputName: "sepolia",
    displayName: "Ethereum Sepolia",
    icName: "ethereum-sepolia",
    chainId: 11155111,
    chainName: "Ethereum Sepolia",
    rpcUrls: "https://ethereum-sepolia.publicnode.com",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
    contractDeployment: "0x589B3Ce3A19a46fCeea817438fd601Db49DFc9F0",
  },
  moonbeam: {
    inputName: "moonbeam",
    displayName: "Moonbase",
    icName: "Moonbeam",
    chainId: 1284,
    chainName: "Moonbeam",
    rpcUrls: "https://rpc.testnet.moonbeam.network",
    nativeCurrency: {
      name: "DEV",
      symbol: "DEV",
      decimals: 18,
    },
    blockExplorerUrls: ["https://moonbase.moonscan.io/"],
    contractDeployment: "0xBA8A5c7EbE020085e40D382A2Dcb68a4324BF503",
  },
  avalanche: {
    inputName: "avalanche",
    displayName: "Avalanche",
    icName: "Avalanche",
    name: "Avalanche",
    chainId: 2501,
    rpc: "http://localhost:8500/1",
    gateway: "0x411fB36E488f22bBE872C345e652e45ff0EB319f",
    gasReceiver: "0xc17a3E5357146d7b9CC3fB025356f25dd450554F",
    constAddressDeployer: "0x69aeB7Dc4f2A86873Dae8D753DE89326Cf90a77a",
    tokenName: "Avax",
    tokenSymbol: "AVAX",
  }
};

module.exports = {
  networksList,
};