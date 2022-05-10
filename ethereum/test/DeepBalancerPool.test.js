
const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");
const { smock } = require('@defi-wonderland/smock');

// for using Waffle
/*
const { waffle } = require("hardhat");
const { deployContract } = waffle;
https://hardhat.org/plugins/nomiclabs-hardhat-waffle.html
*/

// allow javascript to handle big numbers
var chai = require('chai');
var BN = require('bn.js');
var bnChai = require('bn-chai');
const { BigNumber } = require("ethers");
chai.use(bnChai(BN));

// Import utilities from Test Helpers
//const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');


const DeepBalancerPool = artifacts.require("DeepBalancerPool");
const ERC20Artifact = artifacts.require("ERC20");

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe("DeepBalancerPool contract", function () {
    let accounts;
    let deepBalancerPool;
    let fakeERC20;
    let owner;

    const swap_router_address = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const dai_address = "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735";
    const weth9_address = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    const wbtc_address = "0x577d296678535e4903d59a4c929b718e1d575e0a";
    const tokenPrice = BigInt(10 * 10 ** 18);

    before(async () => {
        accounts = await web3.eth.getAccounts();
        [owner, , ] = await ethers.getSigners();

        daiContract = await ERC20Artifact.new("my-name", "my-symbol");
        fakeERC20 = await smock.fake(daiContract);

        deepBalancerPool = await DeepBalancerPool.new(fakeERC20.address, weth9_address, wbtc_address, swap_router_address,
            tokenPrice);

    });

    describe("Deployment", () => {

        it("Should deploy with the right number of tokens", async () => {
            let numTokens = await deepBalancerPool.numTokens();
            expect(numTokens).to.eq.BN(0);
        });

        it("Should deploy with the right prices", async () => {
            let priceWETH9 = await deepBalancerPool.prices(weth9_address);
            let priceDAI = await deepBalancerPool.prices(fakeERC20.address);
            expect(priceWETH9).to.eq.BN(3000, "WETH9 price des not match");
            expect(priceDAI).to.eq.BN(1, "DAI price des not match");
        });
    });


    describe("Deposit", () => {

        const daiQuantity = BigInt(10 * (10 ** 18));

        before("deposit 10 DAI", async () => {

            // set allowance
            fakeERC20.allowance.whenCalledWith(owner.address, deepBalancerPool.address).returns(ethers.constants.MaxUint256);
            fakeERC20.transferFrom.returns(true);

            let allowance = await fakeERC20.allowance(owner.address, deepBalancerPool.address);
            console.log('allow', allowance.toString());

            await deepBalancerPool.deposit(fakeERC20.address, daiQuantity);
        });

        it("deposit should fill tokenholders list", async () => {
            let tokenholders = await deepBalancerPool.getTokenHolders();
            expect(tokenholders).to.contain(owner.address, "Owner not contained in tokenholders");
            expect(tokenholders).to.have.length(1, "Length should be only 1 - owner");
        });

        it("tokens should have been minted after deposit", async () => {
            let numTokens = await deepBalancerPool.numTokens();
            let expectedTokens = daiQuantity / tokenPrice;
            expect(numTokens).to.eq.BN(expectedTokens, "Owner not contained in tokenholders");
        });

        it("holdings should be updated", async () => {
            let ownerTokens = await deepBalancerPool.holdings(owner.address);
            let expectedTokens = daiQuantity / tokenPrice;
            expect(ownerTokens).to.eq.BN(expectedTokens, "Owner does not hold expected number of tokens");
        });

    });

    // ToDo - Add further tests for when price is indeed retrieved

});