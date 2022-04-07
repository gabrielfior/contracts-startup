
//import { assert } from "chai";
import { address } from '../../frontend/contracts/contract-address.json';

var assert = require('chai').assert;

const DeepBalancerPool = artifacts.require("DeepBalancerPool");

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe("DeepBalancerPool contract", function () {
    let accounts;
    let deepBalancerPool;

    const swap_router_address = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const dai_address = "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735";
    const weth9_address = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    const wbtc_address = "0x577d296678535e4903d59a4c929b718e1d575e0a";

    before(async function () {
        accounts = await web3.eth.getAccounts();
    });

    describe("Deployment", function () {
        it("Should deploy with the right greeting", async function () {
            deepBalancerPool = await DeepBalancerPool.new(dai_address, weth9_address, wbtc_address, swap_router_address);
            assert.equal(await deepBalancerPool.dai_address(), dai_address, "DAI address do not match2");
        });
    });
});