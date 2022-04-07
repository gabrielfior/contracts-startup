// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
      "gets automatically created and destroyed every time. Use the Hardhat" +
      " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const swap_router_address = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const dai_address = "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735";
  const weth9_address = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
  const wbtc_address = "0x577d296678535e4903d59a4c929b718e1d575e0a";

  const DeepBalancerPool = await ethers.getContractFactory("DeepBalancerPool");
  const deepBalancerPool = await DeepBalancerPool.deploy(dai_address, weth9_address, wbtc_address, swap_router_address);
  await deepBalancerPool.deployed();

  console.log("Contract address:", deepBalancerPool.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(deepBalancerPool);

}

function saveFrontendFiles(deepBalancerPool) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ address: deepBalancerPool.address }, undefined, 2)
  );

  const deepBalancerPoolArtifact = artifacts.readArtifactSync("DeepBalancerPool");

  fs.writeFileSync(
    contractsDir + "/DeepBalancerPool.json",
    JSON.stringify(deepBalancerPoolArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });