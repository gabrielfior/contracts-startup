import React from 'react';
import * as material from '@mui/material';
import web3 from './web3';
import DAI from './DAI';
import WETH9 from './WETH9';
import DeepBalancerPool from './DeepBalancerPool';
import { BigNumber, ethers } from "ethers";
import CssBaseline from '@mui/material/CssBaseline';


class App extends React.Component {

  addressDeepBPool = DeepBalancerPool.options.address;

  // ToDo - set nested object for DAI and WETH9
  state = {
    accounts: '',
    addressDeepBPool: '',
    daiBalanceAccount: '',
    daiBalanceContract: '',
    daiAllowance: '',
    daiNewAllowance: '',
    daiDecimals: '',
    daiToSend: '',
    wethBalanceAccount: '',
    wethBalanceContract: '',
    wethAllowance: '',
    wethNewAllowance: '',
    wethDecimals: '',
    wethToSend: '',
    totalWealthUSD: ''
  };

  async componentDidMount() {

    window.process = {
      ...window.process,
      env: {
        NODE_ENV: 'development'
      }
    };

    const accounts = await web3.eth.getAccounts();

    let [daiDecimals, daiAllowance, daiBalanceAccount, daiBalanceContract] = await this.getInfoFromToken(DAI, accounts, this.addressDeepBPool);
    let [wethDecimals, wethAllowance, wethBalanceAccount, wethBalanceContract] = await this.getInfoFromToken(WETH9, accounts, this.addressDeepBPool);
    let addressDeepBPool = this.addressDeepBPool;

    let totalWealthUSD = await DeepBalancerPool.methods.totalWealthUSD().call();
    console.log('totalWealthUSD', totalWealthUSD);

    console.log('price DAI', await DeepBalancerPool.methods.prices(DAI.options.address).call());
    console.log('price WETH', await DeepBalancerPool.methods.prices(WETH9.options.address).call());

    this.setState({
      accounts, daiDecimals, daiAllowance, daiBalanceAccount, daiBalanceContract,
      wethDecimals, wethAllowance, wethBalanceAccount, wethBalanceContract, addressDeepBPool, totalWealthUSD
    });
  }

  getInfoFromToken = async (token, accounts, addressApproveSpend) => {
    let decimals = await token.methods.decimals().call();
    let allowance = await token.methods.allowance(accounts[0], addressApproveSpend).call();
    let balanceAccount = await token.methods.balanceOf(accounts[0]).call();
    let balanceContract = await token.methods.balanceOf(addressApproveSpend).call();
    return [decimals, allowance, balanceAccount, balanceContract];
  };

  async componentDidUpdate() {
    window.process = {
      ...window.process,
      env: {
        NODE_ENV: 'development'
      }
    };
  }

  outputAmountInCorrectDecimals = (amount, decimals) => {
    console.log('amount', amount, 'decimals', decimals);
    console.log('big number', BigNumber.from(amount));
    console.log('before');
    return ethers.BigNumber.from(Number(amount)).mul(ethers.BigNumber.from(10)).pow(decimals);
  };

  outputAmountInDai = (amount) => this.outputAmountInCorrectDecimals(amount, this.state.daiDecimals);
  outputAmountInWETH9 = (amount) => this.outputAmountInCorrectDecimals(amount, this.state.wethDecimals);

  depositDAIToContractTest = async () => {

    console.log('started deposit');
    const accounts = await web3.eth.getAccounts();
    const daiToSend = this.state.daiToSend;

    /*
    await DAI.methods.transferFrom(accounts[0], addressApproveSpend, this.outputAmountInDai(daiToSend)).send({
      from: accounts[0],
      gas: 1000000
    });
    console.log('finish deposit');
    */

    await DeepBalancerPool.methods.deposit(DAI.options.address, this.outputAmountInDai(daiToSend)).send({
      from: accounts[0],
      gas: 1000000
    });
    console.log('finished deposit function');

    //let [, , daiBalanceAccount, daiBalanceContract] = await this.getInfoFromToken(DAI, accounts, addressApproveSpend);
    //this.setState({ daiBalanceAccount, daiBalanceContract });

  };

  depositDAIToContract = async () => {
    this.depositToContract(this.state.daiToSend, DAI, this.state.daiDecimals, 'daiBalanceAccount', 'daiBalanceContract');
  };

  depositWETH9ToContract = async () => {
    this.depositToContract(this.state.wethToSend, WETH9, this.state.wethDecimals, 'wethBalanceAccount', 'wethBalanceContract');
  };

  depositToContract = async (amountToSend, Token, decimals, accountBalanceString, contractBalanceString) => {
    console.log('start deposit');
    const accounts = await web3.eth.getAccounts();

    await Token.methods.transferFrom(accounts[0], DeepBalancerPool.options.address, this.outputAmountInCorrectDecimals(amountToSend, decimals))
      .send({
        from: accounts[0],
        gas: 1000000
      });
    console.log('finish deposit');

    let [, , balanceAccount, balanceContract] = await this.getInfoFromToken(Token, accounts, DeepBalancerPool.options.address);
    this.setState({ [accountBalanceString]: balanceAccount, [contractBalanceString]: balanceContract });
  };

  swapAllDaiForWETH9 = async () => {
    console.log('start swap all dai');
    const accounts = await web3.eth.getAccounts();
    await DeepBalancerPool.methods.swapAllDAIForWETH9()
      .send({
        from: accounts[0],
        gas: 1000000
      });
    console.log('finished swap all dai');
    let [, , daiBalanceAccount, daiBalanceContract] = await this.getInfoFromToken(DAI, accounts, this.addressDeepBPool);
    let [, , wethBalanceAccount, wethBalanceContract] = await this.getInfoFromToken(WETH9, accounts, this.addressDeepBPool);

    this.setState({ daiBalanceAccount, daiBalanceContract, wethBalanceAccount, wethBalanceContract });

  };

  swapAllWETH9ForDAI = async () => {
    console.log('start swap all weth9');
    const accounts = await web3.eth.getAccounts();
    await DeepBalancerPool.methods.swapAllWETH9ForDAI()
      .send({
        from: accounts[0],
        gas: 1000000
      });
    console.log('finished swap all weth9');

    let [, , daiBalanceAccount, daiBalanceContract] = await this.getInfoFromToken(DAI, accounts, this.addressDeepBPool);
    let [, , wethBalanceAccount, wethBalanceContract] = await this.getInfoFromToken(WETH9, accounts, this.addressDeepBPool);

    this.setState({ daiBalanceAccount, daiBalanceContract, wethBalanceAccount, wethBalanceContract });
  };

  /*
  onClickSwap = async () => {
    const accounts = await web3.eth.getAccounts();

    await ApproveSpend.methods.swapExactInputSingle(this.outputAmountInDai(3))
      .send({
        from: accounts[0],
        gas: 1000000
      });
    console.log('finished swap');
  };
  */

  withdrawAllDAI = async () => {
    console.log('started withdraw');
    const accounts = await web3.eth.getAccounts();

    await DeepBalancerPool.methods.withdrawAllDAI()
      .send({
        from: accounts[0],
        gas: 1000000
      });
    console.log('finished withdraw');
  }

  withdrawAllWETH9() {
    console.log('withdraw all WETH9');
  }

  render() {

    const divisorDaoDecimals = 10 ** this.state.daiDecimals;
    const divisorWethDecimals = 10 ** this.state.wethDecimals;


    return (
      <React.Fragment>
        <CssBaseline />

        <h3>
          Swap Router
        </h3>
        <ol>
          <li>Transfer 3 DAI to contract</li>
          <li>Observe that DAI lands in contract balance</li>
          <li>Press "swap all DAI for weth9"</li>
          <li>Observe that WETH lands in contract balance whereas DAI is 0</li>
          <li>Press "swap all WETH9 for DAI"</li>
          <li>Observe that DAI lands in contract balance whereas WETH9 is 0</li>
        </ol>


        <material.Box
          component="form"
          sx={{ '& > :not(style)': { m: 0.5, width: '300px', height: '50px' } }}
          noValidate
          autoComplete="off"
        >
          <material.TextField size='small'
            id="outlined-basic" label="DAI to send (eth units)" variant="outlined"
            onChange={(e) => this.setState({ daiToSend: e.target.value })}
            value={this.state.daiToSend}
          />
          <material.Button variant="contained" size='small'
            disabled={!this.state.daiToSend}
            onClick={this.depositDAIToContract}
          >Transfer DAI to contract</material.Button>

          <material.Button variant="contained" size='small'
            disabled={!this.state.daiToSend}
            onClick={this.depositDAIToContractTest}
          >Deposit function</material.Button>

        </material.Box>

        <material.Box
          component="form"
          sx={{ '& > :not(style)': { m: 0.5, width: '300px', height: '50px' } }}
          noValidate
          autoComplete="off"
        >
          <material.TextField size='small'
            id="outlined-basic" label="WETH9 to send (eth units)" variant="outlined"
            onChange={(e) => this.setState({ wethToSend: e.target.value })}
            value={this.state.wethToSend}
          />
          <material.Button variant="contained" size='small'
            disabled={!this.state.wethToSend}
            onClick={this.depositWETH9ToContract}
          >Transfer WETH9 to contract</material.Button>

        </material.Box>

        <material.Box
          component="form"
          sx={{
            '& > :not(style)': { m: 0.5, width: '300px', height: '50px' },
          }}
          noValidate
          autoComplete="off"
        >
        </material.Box>


        <material.Box sx={{ m: 1, p: 1 }}>
          <material.Grid container spacing={2}>
            <material.Grid item xs={6}>
              <material.Button size='large' onClick={this.swapAllDaiForWETH9}
                variant="contained"
              >Swap all DAI for WETH9</material.Button>
            </material.Grid>
            <material.Grid item xs={6}>
              <material.Button size='large' onClick={this.swapAllWETH9ForDAI}
                variant="contained"
              >Swap all WETH9 for DAI</material.Button>
            </material.Grid>
            <material.Grid item xs={6}>
              <material.Button size='large' variant="contained"
                onClick={this.withdrawAllDAI}>Withdraw all DAI</material.Button>
            </material.Grid>
            <material.Grid item xs={6}>
              <material.Button size='large' variant="contained"
                onClick={this.withdrawAllWETH9}>Withdraw all WETH9</material.Button>

            </material.Grid>
          </material.Grid>
        </material.Box>


        <material.Divider>Contracts</material.Divider>

        accounts {this.state.accounts} <br />
        approveSend contract {this.state.addressDeepBPool} <br />
        totalWealthUSD {this.state.totalWealthUSD} <br />

        <material.Divider>DAI</material.Divider>

        daiAllowance {this.state.daiAllowance / divisorDaoDecimals} DAI < br />
        balance account {this.state.daiBalanceAccount / divisorDaoDecimals} DAI < br />
        balance contract {this.state.daiBalanceContract / divisorDaoDecimals} DAI < br />

        <material.Divider>WETH9</material.Divider>

        allowance {this.state.wethAllowance / divisorWethDecimals} WETH9 < br />
        balance account {this.state.wethBalanceAccount / divisorWethDecimals} WETH9 < br />
        balance contract {this.state.wethBalanceContract / divisorWethDecimals} WETH9 < br />

      </React.Fragment >
    );
  }
}

export default App;
