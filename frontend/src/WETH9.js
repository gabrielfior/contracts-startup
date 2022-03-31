import web3 from "./web3";

import ERC20artifact from "@openzeppelin/contracts/build/contracts/ERC20.json";

// Import address from deploy
const address = '0xc778417E063141139Fce010982780140Aa0cD5Ab'; //weth9 rinkeby
const instance = new web3.eth.Contract(
    ERC20artifact.abi,
    address
);
export default instance;
