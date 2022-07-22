// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

// TODO: import relative path, probably two package.json
import "../node_modules/@openzeppelin/contracts/proxy/Clones.sol";
import "./Proposal.sol";

contract ProposalFactory {
    address private proposalImplementation;

    event CreatedProposal(address clonedProposal);

    constructor(address _implementation) {
        // proposalImplementation = address(new Proposal());
        proposalImplementation = _implementation;
    }

    /** 
        create a new proposal with provided details
    */
    function createProposal(
        address _strategiesContract,
        string memory _guid,
        string memory _title,
        string memory _uri,
        string[] memory _options,
        uint256 _startOffset,
        uint256 _stopOffset,
        Proposal.VotingTypes _votingType
    ) external returns (address) {
        address clonedProposal = Clones.clone(proposalImplementation);
        Proposal(clonedProposal).init(
            msg.sender,
            _strategiesContract,
            _guid,
            _title,
            _uri,
            _options,
            _startOffset,
            _stopOffset,
            _votingType
        );
        emit CreatedProposal(clonedProposal);
        return clonedProposal;
    }
}
