
const curve = require("@curvefi/api");
const { ethers } = require("hardhat");
// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

async function connectToCurve(){
  
  const [deployer] = await ethers.getSigners();
  await curve.default.init('JsonRpc', {url: 'http://localhost:8545/', privateKey: deployer.privateKey}, { gasPrice: 0, maxFeePerGas: 0, maxPriorityFeePerGas: 0 });
}

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
      "gets automatically created and destroyed every time. Use the Hardhat" +
      " option '--network localhost'"
    );
  }

  await connectToCurve();
  //const [deployer] = await ethers.getSigners();    
  console.log('next');
  const [deployer] = await ethers.getSigners();
  
  console.log('balance', (await deployer.getBalance()).toString());
  console.log(curve.default.getPoolList());
  

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });