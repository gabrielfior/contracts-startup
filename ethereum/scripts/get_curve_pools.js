
const curve = require("@curvefi/api");
const { ethers } = require("hardhat");
// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

async function connectToCurve() {

  const [deployer] = await ethers.getSigners();
  await curve.default.init('JsonRpc', { url: 'http://localhost:8545/', privateKey: deployer.privateKey }, { gasPrice: 0, maxFeePerGas: 0, maxPriorityFeePerGas: 0 });
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

  // atricrypto3
  let poolName = 'eurtusd';
  const pool = new curve.default.Pool(poolName);
  console.log('baseAPY', await pool.stats.getBaseApy());
  console.log('rewardsAPY', await pool.stats.getRewardsApy());

  console.log('underlyingCoins', pool.underlyingCoins); // [ 'DAI', 'USDC', 'USDT' ]
  console.log('coins', pool.coins); // [ 'aDAI', 'aUSDC', 'aUSDT' ]

  // --- ADD LIQUIDITY ---

  const amounts = ['0', '10', '0', '0'];
  const isApproved = await pool.addLiquidityIsApproved(amounts);
  console.log('isApproved', isApproved);
  //let tx = await pool.addLiquidityApprove(['0', '1', '0','0']);
  //console.log(tx);

  console.log(await pool.underlyingCoinBalances());
  // { DAI: '10000.0', USDC: '10000.0' }
  console.log(await pool.lpTokenBalances());
  // { lpToken: '0.0', gauge: '0.0' }

  const options = {gasPrice: ethers.utils.parseUnits('500', 'gwei'), gasLimit: "800000"};
  await pool.depositAndStakeApprove(amounts, options);
  await pool.depositAndStake(amounts);

  console.log(await pool.underlyingCoinBalances());
  // { DAI: '9000.0', USDC: '9000.0' }
  console.log(await pool.lpTokenBalances());
  // { lpToken: '0.0', gauge: '1820.556829935710883568' }

  // 283.535915313504880343
  //const tx = await pool.addLiquidity(['100', '100', '100']);
  //console.log(tx); // 0x7aef5b13385207f1d311b7e5d485d4994a6520482e8dc682b5ef26e9addc53be

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });