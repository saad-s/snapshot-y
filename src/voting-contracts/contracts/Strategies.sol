// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IStrategies.sol";

contract Strategies is IStrategies {
    IERC20 private contractInstance;
    uint256 private minimumAmount;

    error ERC20StrategyError(string reason);

    constructor(address _contractAddress, uint256 _minimumAmount) {
        contractInstance = IERC20(_contractAddress);
        minimumAmount = _minimumAmount;
    }

    function getBalance(address _owner) private view returns (uint256) {
        try contractInstance.balanceOf(_owner) returns (uint256 balance) {
            return balance;
        } catch {
            revert ERC20StrategyError("Error fetching balance");
        }
    }

    function gateStrategyMinFungibleBalance(address _owner)
        public
        view
        returns (bool)
    {
        return (getBalance(_owner) >= minimumAmount);
    }

    function vanillaVotingStrategy(address _voter)
        public
        view
        returns (uint256)
    {
        if (getBalance(_voter) > 0) {
            return 1;
        }
        revert ERC20StrategyError("Balance must be greater than 0");
    }

    function fungibleBalanceVotingStrategy(address _voter)
        public
        view
        returns (uint256)
    {
        uint256 _balance = getBalance(_voter);
        if (_balance > 0) {
            return _balance;
        }
        revert ERC20StrategyError("Balance must be greater than 0");
    }

    // NOTE: This implementation will be replaced by frontend depending on the strategies selected
    function evaluateVotingPower(address _voter)
        external
        pure
        returns (uint256)
    {
        return 1;
    }

    // NOTE: This implementation will be replaced by frontend depending on the strategies selectedx
    function evaluateGatingStrategies(address _voter)
        external
        pure
        returns (bool)
    {
        return true;
    }
}
