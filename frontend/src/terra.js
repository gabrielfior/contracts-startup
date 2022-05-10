import React from 'react';
import * as material from '@mui/material';
import { deposit } from './curve';

class Terra extends React.Component {

  // ToDo - set nested object for DAI and WETH9
  state = {
    depositAmount: '',
  };


  handleChange = (event) => {
    this.setState({ depositAmount: event.target.value });
  };

  onDeposit = () => {
    deposit(this.state.depositAmount);
  }


  render() {

    return (
      <div>
        <h2>Conservative pool</h2>

      

        <material.FormGroup row style={{ "margin-top": "10px" }}>
          <material.TextField variant="outlined" type={'numeric'}
            value={this.state.depositAmount}
            onChange={this.handleChange}
            InputProps={{
              endAdornment: <material.InputAdornment position="end">USDC</material.InputAdornment>,
            }}
          />
          <material.Button variant="contained" disableElevation onClick={this.onDeposit}>
            Deposit
          </material.Button>

        </material.FormGroup>

        <p>deposit amount {this.state.depositAmount}</p>

      </div>
    );
  }
};

export default Terra;