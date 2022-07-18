// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

// TODO: import relative path, probably two package.json
import "../node_modules/@openzeppelin/contracts/proxy/Clones.sol";
import "./Proposal.sol";

contract ProposalFactory {

  address private proposalImplementation;

  event createdProposal(address clonedProposal);

  constructor () {
    proposalImplementation = address(new Proposal());
  }


  /** 
  create a new proposal with provided details
  TODO: this contract is propagated as msg.sender, 
    which is set as owner. Caller should be owner 
  */
  function createProposal(
    string memory _title, 
    string memory _uri, 
    string[] memory _options, 
    uint _startBlock, 
    uint _stopBlock
  ) 
    external 
    returns(address) 
  {
    address clonedProposal = Clones.clone(proposalImplementation);
    Proposal(clonedProposal).init(_title, _uri, _options, _startBlock, _stopBlock);
    emit createdProposal(clonedProposal);
    return clonedProposal;
  }
}