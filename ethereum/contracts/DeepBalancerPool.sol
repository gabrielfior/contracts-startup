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
//import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol"; // not needed from solidity >= 0.8.0 as overflows already checked
//import { SignedSafeMath } from "@openzeppelin/contracts/math/SignedSafeMath.sol";

contract DeepBalancerPool is Pausable, ReentrancyGuard, Ownable {
    constructor(
        address dai_address,
        address weth9_address,
        address wbtc_address,
        address swap_router_address
    ) {
        swapRouter = ISwapRouter(swap_router_address);
        DAI = dai_address;
        WBTC = wbtc_address;
        WETH9 = weth9_address;

        // ToDo - Call refreshPrices for a more accurate estimate
        prices[dai_address] = 1;
        prices[weth9_address] = 3000;

        tokenPrice = 10 * 10**18; // in units of 10**18
    }

    address[] public tokenHolders;
    mapping(address => uint256) public prices;
    mapping(address => uint256) public holdings; //100% == 1e18, 25% = 0.25e18
    //uint256 public totalFundValueInUSD;
    uint256 public tokenPrice; //in units of 10**18
    uint256 public numTokens = 0;

    ISwapRouter public immutable swapRouter;
    address public immutable WBTC;
    address public immutable WETH9;
    address public immutable DAI;

    // ToDo - Make this argument to constructor
    uint24 public constant poolFee = 3000; // 0.3%

    function refreshPrices() private {
        /**
        ToDo - Get real prices from WETH and BTC. Check if units match.
        */
        prices[WETH9] = 3000;
        prices[DAI] = 1;
    }

    function getWealthFromToken(address tokenAddress)
        private
        view
        returns (uint256)
    {
        ERC20 token = ERC20(tokenAddress);
        uint256 balanceToken = token.balanceOf(address(this));
        uint256 priceToken = prices[tokenAddress];
        uint256 decimals = token.decimals();
        uint256 wealthToken = (balanceToken / 10**decimals) * priceToken;
        return wealthToken;
    }

    function updateTotalWealthInUsdAndTokenPrice() private {
        uint256 totalFundValueInUSD = 0;

        // WETH
        uint256 wealthWETH9 = getWealthFromToken(WETH9);
        totalFundValueInUSD += wealthWETH9;

        // DAI
        uint256 wealthDAI = getWealthFromToken(DAI);
        totalFundValueInUSD += wealthDAI;

        if (totalFundValueInUSD > 0){
            tokenPrice = totalFundValueInUSD/numTokens;
        }
    }


    function deposit(address tokenAddress, uint256 tokenQuantity) external whenNotPaused nonReentrant {
        
        // New value was not deposited yet. We do internal operations before calling external contract.
        ERC20 depositedToken = ERC20(tokenAddress);

        // make sure allowance is checked
        uint allowanceForContract = depositedToken.allowance(msg.sender, address(this));
        require(allowanceForContract > tokenQuantity, "Allowance not properly set");

        refreshPrices();
        updateTotalWealthInUsdAndTokenPrice();

        // calculate valueInUSD of deposit by accessing prices
        uint tokenDecimals = 10**(depositedToken.decimals());
        uint depositInUsd = prices[tokenAddress]*tokenQuantity / tokenDecimals; // update shareValue

        uint newTokensIssued = (depositInUsd * tokenDecimals) / tokenPrice; //tokenPrice in units of 10**18
        
        tokenHolders.push(msg.sender);
        holdings[msg.sender] += newTokensIssued; // initiated with value 0 if key not previously existent
        numTokens += newTokensIssued;

        bool transferSuccess = depositedToken.transferFrom(msg.sender, address(this), tokenQuantity);
        require(transferSuccess, 'Transfer of deposit unsuccessful');
    }

    function transferFrom(uint256 amount) public {
        // Frontend can call function directly on ERC20 contract
        ERC20(DAI).transferFrom(msg.sender, address(this), amount);
    }

    function withdrawAllDAI() external onlyOwner {
        withdrawAll(DAI);
    }

    function withdrawAllWETH9() external onlyOwner {
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

    function swapAllDAIForWETH9()
        external
        whenNotPaused
        nonReentrant
        returns (uint256 amountOut)
    {
        // we exchange all DAI from inside the contract
        amountOut = totalSwap(DAI, WETH9);
    }

    function swapAllWETH9ForDAI()
        external
        whenNotPaused
        nonReentrant
        returns (uint256 amountOut)
    {
        // we exchange all DAI from inside the contract
        amountOut = totalSwap(WETH9, DAI);
    }

    function totalSwap(address tokenIn, address tokenOut)
        private
        returns (uint256 amountOut)
    {
        // We exchange all tokenIn from the contract into tokenOut

        uint256 tokensInsideContract = ERC20(tokenIn).balanceOf(address(this));

        TransferHelper.safeApprove(
            tokenIn,
            address(swapRouter),
            tokensInsideContract
        );

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

    function emergencyPriceUpdate(
        uint256 PRICEDAIinUSD,
        uint256 PRICEWBTCinUSD,
        uint256 PRICEWETH9IinUSD
    ) public onlyOwner {
        prices[DAI] = PRICEDAIinUSD;
        prices[WBTC] = PRICEWBTCinUSD;
        prices[WETH9] = PRICEWETH9IinUSD;
    }
}
