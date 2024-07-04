import { vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const MNEMONIC = vars.get("MNEMONIC");
const FRAXTAL_API_KEY = vars.get("FRAXTAL_API_KEY");

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true
    },
  },
  networks: {
    fraxtal: {
      url: 'https://rpc.frax.com',
      chainId: 252,
      accounts: {
        mnemonic: MNEMONIC,
        initialIndex: 0,
      },
    },
  }, etherscan: {
    apiKey: {
      fraxtal: FRAXTAL_API_KEY,
    },
    customChains: [
      {
        network: 'fraxtal',
        chainId: 252,
        urls: {
          apiURL: 'https://api.fraxscan.com/api',
          browserURL: 'https://fraxscan.com/',
        },
      },
    ],
  },
};