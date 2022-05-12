const { alchemyApiKey, mnemonic, polygonAlchemyApiKey } = require('../secrets.json');

const hre = require("hardhat");
const { ethers } = require('hardhat');

const UNISWAP = require('@uniswap/sdk');

const uniswapRouterImport = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');

async function main() {
  console.log(`The chainId of mainnet is ${UNISWAP.ChainId.MAINNET}.`)

  const [deployer] = await ethers.getSigners();
  // to receive erc20
  let wallet = hre.ethers.Wallet.fromMnemonic(mnemonic);


  const tokenAddressUSDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC

  // note that you may want/need to handle this async code differently,
  // for example if top-level await is not an option


  let uniswapV2Router02 = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"
  let uniswapContractName = "UniswapV2Router02";
  let weth_address_polygon = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"//"0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
  let dai_address_polygon = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";

  const usdc_token = await UNISWAP.Fetcher.fetchTokenData(ethers.chainId, tokenAddressUSDC);
  const weth_token = new UNISWAP.Token(ethers.chainId, weth_address_polygon,
    18, "WETH", "Wrapped Ether");
  const dai_token = new UNISWAP.Token(ethers.chainId, weth_address_polygon,
    18, "WETH", "Wrapped Ether");

  // note that you may want/need to handle this async code differently,
  // for example if top-level await is not an option


  //const pair = await UNISWAP.Fetcher.fetchPairData(usdc_token, weth_token);
  //const amountIn = '1000000000000000000' // 1 WETH
  
  //const trade = new Trade(route, new TokenAmount(weth_token, amountIn), TradeType.EXACT_INPUT);

  let routerContract = await ethers.getContractAt(uniswapRouterImport.abi,
    uniswapV2Router02, deployer);
    const slippageTolerance = new UNISWAP.Percent('50', '10000') // 50 bips, or 0.50%

    //const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw // needs to be converted to e.g. hex
    //const value = trade.inputAmount.raw // // needs to be converted to e.g. hex
    const path = [weth_address_polygon, dai_address_polygon];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
    
    const options = {value: ethers.utils.parseEther("100.0")};
  let tx = await routerContract.swapExactETHForTokens(
    ethers.utils.hexlify(0), 
    path, deployer.getAddress(), deadline, options);
  //swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
  console.log('tx', tx);
    
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });