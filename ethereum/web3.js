import Web3 from "web3";
    
let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'){
    // we are in the browser and metamask is running
    window.ethereum.request({method: "eth_requestAccounts"});
    web3 = new Web3(window.ethereum);
}
else {
    const provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/19606a02e2154d57adc527f2151ad9a0');
    web3 = new Web3(provider);
}


export default web3;