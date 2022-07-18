// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

contract Proposal {

  struct ProposalDetails {
    string title;             // TODO: needed?
    string uri;
    string[] votingOptions;   // TODO: set fixed length to 10
    uint startBlock;
    uint stopBlock;
  }

  ProposalDetails internal proposal;
  address private owner;

  function init(
    string memory _title, 
    string memory _uri, 
    string[] memory _options, 
    uint _startBlock, 
    uint _stopBlock
  ) external 
  {
    owner = msg.sender;
    proposal = ProposalDetails(_title, _uri, _options, _startBlock, _stopBlock);
  }

  modifier onlyOwner(address sender) {
    require(owner == sender, 'only owner allowed');
    _;
  }

  /// proposal details are editable till start block height is not reached
  modifier isEditable() {
    require(proposal.startBlock >= block.number, 'edit period is over');
    _;
  }

  /// returns owner / deployer address 
  function getOwner() external view returns(address) {
    return owner;
  }

  /// returns proposal struct
  function getProposalDetails() external view returns(ProposalDetails memory) {
    // TODO: what's the best practice in returning structs?? JSON friendliness... 
    return proposal;
  }

  function setProposalTitle(string memory _title) external onlyOwner(msg.sender) isEditable() {
    proposal.title = _title;
  }

  function setProposalDetailsURI(string memory _uri) external onlyOwner(msg.sender) isEditable() {
    proposal.uri = _uri;
  }

  function setVotingOptions(string[] memory _options) external onlyOwner(msg.sender) isEditable() {
    proposal.votingOptions = _options;
  } 

  function setVotingPeriod(uint _start, uint _stop) external onlyOwner(msg.sender) isEditable() {
    require(_start > block.number && _start < _stop, 'end > start > current');
    proposal.startBlock = _start;
    proposal.stopBlock = _stop;
  }
}
