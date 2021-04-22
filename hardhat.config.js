require('dotenv').config();
require("babel-polyfill");
require("babel-register")({
  "presets": [ "es2015" ],
  "plugins": [ "syntax-async-functions", "transform-regenerator" ]
});
require('@nomiclabs/hardhat-truffle5');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");


const INFURA_PROJECT_ID = process.env.KEY_INFURA_API_KEY;
const MNEMONIC = process.env.KEY_MNEMONIC;
const ETHERSCAN_API_KEY = process.env.KEY_ETHERSCAN;

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.5.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },{
        version: '0.6.8',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },{
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ],
    overrides: {
      "contracts/omen/OMNToken.sol": { version: "0.7.6" },
      "contracts/omen/OMNGuild.sol": {
        version: "0.7.6",
        settings: { optimizer: { enabled: true, runs: 100 } }
      },
      "contracts/dxdao/DXDGuild.sol": {
        version: "0.7.6",
        settings: { optimizer: { enabled: true, runs: 100 } }
      },
      "contracts/erc20guild/ERC20Guild.sol": {
        version: "0.7.6",
        settings: { optimizer: { enabled: true, runs: 100 } }
      },
      "contracts/erc20guild/IERC20Guild.sol": { version: "0.7.6" },
    }
  },
  gasReporter: {
    currency: 'USD',
    enabled: process.env.ENABLE_GAS_REPORTER === 'true'
  },
  networks: {
    hardhat: {
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      gasLimit: 9000000,
      gasPrice: 10000000000, // 10 gwei
      timeout: 60000
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      gasPrice: 100000000000, // 100 gwei
      timeout: 60000
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      gasPrice: 10,
      timeout: 60000
    },
    coverage: {
      url: 'http://localhost:8555',
      accounts: { 
        mnemonic: MNEMONIC, 
        accountsBalance: "10000000000000000000000000000000"
      },
      gasPrice: 1,
      timeout: 60000
    }
  },
  etherscan: { apiKey: ETHERSCAN_API_KEY }

};
