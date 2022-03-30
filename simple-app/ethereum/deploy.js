const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledApproveSpend = require('./artifacts/ethereum/contracts/ApproveSpend.sol/ApproveSpend.json');

const provider = new HDWalletProvider(
    'ghost grace damage pluck medal potato liquid ice illness install couch slide',
    'https://rinkeby.infura.io/v3/19606a02e2154d57adc527f2151ad9a0'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(
    compiledApproveSpend.abi
  )
    .deploy({ data: compiledApproveSpend.bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();