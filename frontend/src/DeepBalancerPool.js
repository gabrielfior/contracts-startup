import web3 from "./web3";

import ApproveSpendArtifact from "./contracts/DeepBalancerPool.json";
import {address} from './contracts/contract-address.json';

const instance = new web3.eth.Contract(
  ApproveSpendArtifact.abi,
    address
);

export default instance;
