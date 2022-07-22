// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

interface IStrategies {
    function evaluateVotingPower(address _voter) external returns (uint256);

    function evaluateGatingStrategies(address _voter) external returns (bool);
}
