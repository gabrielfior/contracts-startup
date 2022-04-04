//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

// We import this library to be able to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

//import { SafeCast } from "@openzeppelin/contracts/utils/SafeCast.sol";
//import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
//import { SignedSafeMath } from "@openzeppelin/contracts/math/SignedSafeMath.sol";

// inspired by SetToken.sol (0xeF72D3278dC3Eba6Dc2614965308d1435FFd748a)

// This is the main building block for smart contracts.
contract DeepBalancerPool is Pausable, ReentrancyGuard, Ownable {


    constructor() {
        address SWAP_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564; //rinkeby
        swapRouter = ISwapRouter(SWAP_ROUTER);
    }

    // A mapping is a key/value map. Here we store each account balance.
    mapping(address => uint256) balances;

    ISwapRouter public immutable swapRouter;

    // This example swaps DAI/WETH9 for single path swaps and DAI/USDC/WETH9 for multi path swaps.
    //address public constant DAI = 0x6A9865aDE2B6207dAAC49f8bCba9705dEB0B0e6D; //rinkeby
    address public constant DAI = 0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735; // DAI from uniswap
    address public constant WETH9 = 0xc778417E063141139Fce010982780140Aa0cD5Ab; // rinkeby
    uint24 public constant poolFee = 3000; // 0.3%

    function transferFrom(uint256 amount) public {
        // Frontend can call function directly on ERC20 contract
        ERC20(DAI).transferFrom(msg.sender, address(this), amount);
    }
    /*
    function approveDAISwap(uint256 amountIn) external {
        // need to be called only once
        // Approve the router to spend DAI.
        TransferHelper.safeApprove(DAI, address(swapRouter), amountIn);
    }

    function approveWETH9Swap(uint256 amountIn) external {
        // need to be called only once
        // Approve the router to spend DAI.
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);
    }
    */

    function withdrawAllDAI() onlyOwner external {
        withdrawAll(DAI);
    }

    function withdrawAllWETH9() onlyOwner external {
        withdrawAll(WETH9);
    }


    function withdrawAll(address erc20Token) private {
        ERC20 Token = ERC20(erc20Token);
        uint256 balanceToken = Token.balanceOf(address(this));

        TransferHelper.safeTransferFrom(
            erc20Token,
            address(this),
            msg.sender,
            balanceToken
        );
    }

    function swapAllDAIForWETH9() external whenNotPaused nonReentrant returns (uint256 amountOut) {
        // we exchange all DAI from inside the contract
        amountOut = totalSwap(DAI, WETH9);
    }

    function swapAllWETH9ForDAI() external whenNotPaused nonReentrant returns (uint256 amountOut) {
        // we exchange all DAI from inside the contract
        amountOut = totalSwap(WETH9, DAI);
    }

    function totalSwap(address tokenIn, address tokenOut)
        private
        returns (uint256 amountOut)
    {
        // We exchange all tokenIn from the contract into tokenOut

        uint256 tokensInsideContract = ERC20(tokenIn).balanceOf(address(this));

        TransferHelper.safeApprove(tokenIn, address(swapRouter), tokensInsideContract);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp + 100, //block.timestamp 2000000000
                amountIn: tokensInsideContract,
                amountOutMinimum: 0, // use estimator
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
        return amountOut;
    }
}
