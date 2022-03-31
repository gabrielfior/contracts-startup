import web3 from "./web3";

import ERC20artifact from "@openzeppelin/contracts/build/contracts/ERC20.json";

// Import address from deploy
const address = '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735'; //dai
const instance = new web3.eth.Contract(
    ERC20artifact.abi,
    address
);

export default instance;
