// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

// TODO: import relative path, probably two package.json
import "../node_modules/@openzeppelin/contracts/proxy/Clones.sol";
import "./Proposal.sol";

contract ProposalFactory {
    address private proposalImplementation;

    event CreatedProposal(address clonedProposal);

    constructor() {
        proposalImplementation = address(new Proposal());
    }

    /** 
  create a new proposal with provided details
  */
    function createProposal(
        string memory _title,
        string memory _uri,
        string[] memory _options,
        uint256 _startBlock,
        uint256 _stopBlock,
        Proposal.VotingTypes _votingType
    ) external returns (address) {
        address clonedProposal = Clones.clone(proposalImplementation);
        Proposal(clonedProposal).init(
            msg.sender,
            _title,
            _uri,
            _options,
            _startBlock,
            _stopBlock,
            _votingType
        );
        emit CreatedProposal(clonedProposal);
        return clonedProposal;
    }
}
