import React from 'react';
import * as material from '@mui/material';
import web3 from './web3';
import DAI from './DAI';
import WETH9 from './WETH9';
import ApproveSpend from './ApproveSpend';
import { ethers } from "ethers";
import CssBaseline from '@mui/material/CssBaseline';


class App extends React.Component {

  // ToDo - set nested object for DAI and WETH9
  state = {
    accounts: '',
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
    wethDecimals: ''
  };

  async componentDidMount() {

    window.process = {
      ...window.process,
      env: {
        NODE_ENV: 'development'
      }
    };

    const accounts = await web3.eth.getAccounts();
    const addressApproveSpend = ApproveSpend.options.address;

    let [daiDecimals, daiAllowance, daiBalanceAccount, daiBalanceContract] = await this.getInfoFromToken(DAI, accounts, addressApproveSpend);
    let [wethDecimals, wethAllowance, wethBalanceAccount, wethBalanceContract] = await this.getInfoFromToken(WETH9, accounts, addressApproveSpend);

    this.setState({
      accounts, daiDecimals, daiAllowance, daiBalanceAccount, daiBalanceContract, addressApproveSpend,
      wethDecimals, wethAllowance, wethBalanceAccount, wethBalanceContract
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

  /*
  onClickApproveDai = async (e) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();
    const addressApproveSpend = ApproveSpend.options.address;

    const amount = ethers.constants.MaxInt256;
    //const amount = this.outputAmountInDai(this.state.daiNewAllowance);
    await DAI.methods.approve(addressApproveSpend, amount).send({
      from: accounts[0],
      gas: 1000000
    });

  };

  onClickApproveWeth = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();
    const addressApproveSpend = ApproveSpend.options.address;

    //const amount = ethers.constants.MaxInt256;
    const amount = this.outputAmountInDai(this.state.wethNewAllowance);
    await WETH9.methods.approve(addressApproveSpend, amount).send({
      from: accounts[0],
      gas: 1000000
    });
  };
  */

  outputAmountInDai = (amountInDai) => {
    return ethers.BigNumber.from(amountInDai)
      .mul(ethers.BigNumber.from(10)).pow(this.state.daiDecimals)
  };

  depositDAIToContract = async () => {
    console.log('start deposit');
    const accounts = await web3.eth.getAccounts();
    const addressApproveSpend = ApproveSpend.options.address;
    const divisorDaoDecimals = 10 ** this.state.daiDecimals;
    const daiToSend = this.state.daiToSend;

    await DAI.methods.transferFrom(accounts[0], addressApproveSpend, this.outputAmountInDai(daiToSend)).send({
      from: accounts[0],
      gas: 1000000
    });
    console.log('finish deposit');
  };

  swapAllDaiForWETH9 = async () => {
    console.log('start swap all dai');
    const accounts = await web3.eth.getAccounts();
    await ApproveSpend.methods.swapAllDAIForWETH9()
      .send({
        from: accounts[0],
        gas: 1000000
      });
    console.log('finished swap all dai');
  };

  swapAllWETH9ForDAI = async () => {
    console.log('start swap all weth9');
    const accounts = await web3.eth.getAccounts();
    await ApproveSpend.methods.swapAllWETH9ForDAI()
      .send({
        from: accounts[0],
        gas: 1000000
      });
    console.log('finished swap all weth9');
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

    await ApproveSpend.methods.withdrawAllDAI()
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


        {/*}
        Approve not used anymore as ETH and DAI directly spent from contract.
        Contract approves itself.

        <material.TextField id="outlined-basic" label="DAI Allowance (eth units)" variant="outlined"
          onChange={(e) => this.setState({ daiNewAllowance: e.target.value })}
          value={this.state.daiNewAllowance}
        />
        <LoadingButton loading={this.state.loading} variant="contained"
          disabled={!this.state.daiNewAllowance}
          onClick={this.onClickApproveDai}
        >Approve spend DAI</LoadingButton>

        <br />


        <material.TextField id="outlined-basic" variant="outlined"
          label="WETH Allowance (eth units)"
          onChange={(e) => this.setState({ wethNewAllowance: e.target.value })}
          value={this.state.wethNewAllowance}
        />

        <LoadingButton loading={this.state.loading} variant="contained"
          disabled={!this.state.wethNewAllowance}
          onClick={this.onClickApproveWeth}
        >Approve spend WETH9</LoadingButton>

        <br />
        {*/}

        <material.Box
          component="form"
          sx={{
            '& > :not(style)': { m: 0.5, width: '300px', height: '50px' },
          }}
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
        approveSend contract {this.state.addressApproveSpend} <br />

        <material.Divider>DAI</material.Divider>

        daiApprovedInContract {String(this.state.daiApprovedInContract)} <br />
        daiAllowance {this.state.daiAllowance / divisorDaoDecimals} DAI < br />
        balance account {this.state.daiBalanceAccount / divisorDaoDecimals} DAI < br />
        balance contract {this.state.daiBalanceContract / divisorDaoDecimals} DAI < br />

        <material.Divider>WETH9</material.Divider>

        weth9ApprovedInContract {String(this.state.wethApprovedInContract)} <br />
        allowance {this.state.wethAllowance / divisorWethDecimals} WETH9 < br />
        balance account {this.state.wethBalanceAccount / divisorWethDecimals} WETH9 < br />
        balance contract {this.state.wethBalanceContract / divisorWethDecimals} WETH9 < br />

      </React.Fragment >
    );
  }
}

export default App;
