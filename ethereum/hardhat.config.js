require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");

const { alchemyApiKey, mnemonic } = require('./secrets.json');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"]
        }
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
      }
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: { mnemonic: mnemonic },
      gasPrice: 20000000000,
      gas: 6000000,
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
