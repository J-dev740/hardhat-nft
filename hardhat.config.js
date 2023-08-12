require("@nomicfoundation/hardhat-toolbox");
// require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("chai")
// require("@nomicfoundation/hardhat-network-helpers")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const RPC_URL=process.env.RPC_URL
const PRIVATE_KEY=process.env.PRIVATE_KEY
const MAINNET_RPC_URL=process.env.MAINNET_RPC_URL

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork:"hardhat",
  networks:{
    hardhat:{
      chainId:31337,
      forking:{
        // url:MAINNET_RPC_URL,
        url:"https://eth-mainnet.g.alchemy.com/v2/bUv0Ec-2sgK-i_kLmA1KJGZQuNvSYnqb"
      },
    },
    sepolia:{
      url:RPC_URL,
      chainId:11155111,
      accounts:[PRIVATE_KEY,],
      BlockConfirmations:2,
    },
    localhost:{
      // url:"http://127.0.0.1:8545/",
      chainId:31337,
      // forking:{
      //   // url:MAINNET_RPC_URL,
      //   url:"https://eth-mainnet.g.alchemy.com/v2/bUv0Ec-2sgK-i_kLmA1KJGZQuNvSYnqb"
      // },
      //accounts:[] is not  req as hardhat automatically locates its private key from the node that we are running locally


    },


  },
  namedAccounts:{
    deployer:{
      default:0,
      1:0,
    },
  },
    solidity:{
    compilers:[
      {version: "0.8.7",},
      {version:'0.8.8'},
      {version:'0.4.19',},
      {version:'0.6.12'},
      {version:'0.6.6'},
      {version:'0.6.0'}

    ]
    },
  mocha:{
    timeout:400000,
  },
};
