require("@nomiclabs/hardhat-waffle");

const { alchemyApiKey, mnemonic } = require('./secrets.json');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  networks: {
    hardhat: {
      chainId: 31337
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: {mnemonic: mnemonic},
      gasPrice: 20000000000,
      gas: 6000000,
    }
  },
  paths: {
    sources: "./ethereum/contracts",
    tests: "./ethereum/test",
    cache: "./ethereum/cache",
    artifacts: "./ethereum/artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
