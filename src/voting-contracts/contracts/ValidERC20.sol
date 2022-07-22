pragma solidity 0.8.15;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ValidERC20 is ERC20 {
    constructor(
        uint256 _initialSupply,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _initialSupply);
    }

    function mint(uint256 _amount) public {
        _mint(msg.sender, _amount);
    }
}
