import web3 from "./web3";
//import CampaignFactory from './build/CampaignFactory.json';
import ApproveSpend from '../ethereum/artifacts/ethereum/contracts/ApproveSpend.sol/ApproveSpend.json';

// Import address from deploy
const address = 'ToDo';

const instance = new web3.eth.Contract(
    JSON.parse(ApproveSpend.abi),
    address
);

import TokenArtifact from "../contracts/Token.json";
import tokenAddress from "../contracts/contract-address.json";

this._token = new ethers.Contract(
    tokenAddress.Token,
    TokenArtifact.abi,
    this._provider.getSigner(0)
  );

export default instance;
