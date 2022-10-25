# contracts-startup

This repository contains a few contracts and general scripts around the work done at my previous start-up (DeepBalancer), 
where we tried to develop investment strategies using Deep Learning.

The basic idea was to have a [vault-like contract](./ethereum/contracts/DeepBalancerPool.sol) that was able to hold user's deposits on the one side and, on the other side,
integrate with Uniswap to execute swaps (thus rebalancing the holdings), according to the predictions of the Deep Learning algorithm.

Usage of tools like Hardhat and Tenderly are also present in this repo.
