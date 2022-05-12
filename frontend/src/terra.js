import React from 'react';
import * as material from '@mui/material';
import { CurveHandler } from './curve';
import { ethers, providers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useState, useEffect } from 'react';
import { providerOptions } from "./providerOptions";
import { toHex, truncateAddress } from "./utils";
import { networkParams } from "./networks";

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions // required
});

export default function Terra(props) {


  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();
  const [network, setNetwork] = useState();
  const [amount, setAmount] = useState(Number.parseInt("1"));

  const curveHandler = new CurveHandler();

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) setAccount(accounts[0]);
      setChainId(network.chainId);
    } catch (error) {
      setError(error);
    }
  };

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const onDeposit = async () => {

    // receive 1 ETH
    // swap to USDC
    // deposit USDC to curve pool

    await curveHandler.deposit(amount);
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(network) }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[toHex(network)]]
          });
        } catch (error) {
          setError(error);
        }
      }
    }
  };

  const refreshState = () => {
    setAccount();
    setChainId();
    setNetwork("");
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleChainChanged = (_hexChainId) => {
        setChainId(_hexChainId);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);


  return (
    <div>
      <h2>Conservative pool</h2>

      <material.ButtonGroup style={{ "float": "right" }} variant="contained" aria-label="outlined primary button group">
        {!account ? (
          <material.Button onClick={connectWallet}>Connect Wallet</material.Button>
        ) : (
          <>
            <material.Button onClick={disconnect}>Disconnect</material.Button>

            <material.Button disabled style={{ "background": "lightGray" }}>{truncateAddress(account)}</material.Button>
          </>
        )}
      </material.ButtonGroup>


      <div>
        <h2>{`Network ID: ${chainId ? chainId : "No Network"}`}</h2>
      </div>

      <div>
        <material.Button 
        variant="contained" aria-label="outlined primary"
        onClick={switchNetwork} disabled={!network}>
          Switch Network
        </material.Button>

        <material.Select autoWidth placeholder="Select network"
          onChange={handleNetwork}>
          <material.MenuItem value="1">Mainnet</material.MenuItem>
          <material.MenuItem value="3">Ropsten</material.MenuItem>
          <material.MenuItem value="4">Rinkeby</material.MenuItem>
          <material.MenuItem value="42">Kovan</material.MenuItem>
          <material.MenuItem value="1666600000">Harmony</material.MenuItem>
          <material.MenuItem value="42220">Celo</material.MenuItem>
        </material.Select>
      </div>


      <material.FormGroup row style={{ "marginTop": "10px" }}>
        <material.TextField variant="outlined" type={'numeric'}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          InputProps={{
            endAdornment: <material.InputAdornment position="end">USDC</material.InputAdornment>,
          }}
        />
        <material.Button variant="contained" disableElevation onClick={onDeposit}>
          Deposit
        </material.Button>

      </material.FormGroup>
          
          <p>amount {amount}</p>

    </div>
  );
}