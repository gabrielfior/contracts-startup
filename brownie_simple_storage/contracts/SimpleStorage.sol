// SPDX-License-Identified: MIT

pragma solidity >=0.6.0 <0.9.0;

contract SimpleStorage {
	
	uint i;

	function retrieve() public view returns(uint) {
		return i;
	}

	function store(uint _value) public {
		i = _value;
	}

}