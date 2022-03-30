import web3 from "./web3";

import ERC20artifact from "@openzeppelin\contracts\build\contracts\ERC20.json";

// Import address from deploy
const address = '0x6A9865aDE2B6207dAAC49f8bCba9705dEB0B0e6D';

const instance = new web3.eth.Contract(
    JSON.parse(ERC20artifact.abi),
    address
);

/*
import TokenArtifact from "../contracts/Token.json";
import tokenAddress from "../contracts/contract-address.json";

this._token = new ethers.Contract(
    address,
    ERC20artifact.abi,
    this._provider.getSigner(0)
  );
*/

export default instance;
