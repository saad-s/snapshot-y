// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Proposal {
    enum VotingTypes {
        SingleChoiceVoting,
        RankedVoting
    }

    struct ProposalDetails {
        string title;
        string uri;
        string[] votingOptions; // TODO: set fixed length to 10
        uint256 startBlock;
        uint256 stopBlock;
        VotingTypes votyingType;
    }

    struct Vote {
        string votingOption;
        uint256 votingPower;
        bool hasVoted;
    }

    ProposalDetails internal proposal;
    address private owner;
    uint256 totalVotes;

    mapping(address => Vote) public votes;
    mapping(string => uint256) public optionCounts;

    error Unauthorized(string reason);
    error EditPeriodOver();
    error IncorrectParams(string reason);
    error VotingError(string reason);

    event VoteCast(address voter, string choice, uint256 votingPower);

    function init(
        address _owner,
        string memory _title,
        string memory _uri,
        string[] memory _options,
        uint256 _startBlock,
        uint256 _stopBlock,
        VotingTypes _votyingType
    ) public {
        owner = _owner;
        proposal = ProposalDetails(
            _title,
            _uri,
            _options,
            _startBlock,
            _stopBlock,
            _votyingType
        );
    }

    modifier onlyOwner(address sender) {
        if (owner != sender) {
            revert Unauthorized("Only owner");
        }
        _;
    }

    /// proposal details are editable till start block height is not reached
    modifier isEditable() {
        if (proposal.startBlock < block.number) {
            revert EditPeriodOver();
        }
        _;
    }

    /// returns owner / deployer address
    function getOwner() external view returns (address) {
        return owner;
    }

    /// returns proposal struct
    function getProposalDetails()
        external
        view
        returns (ProposalDetails memory)
    {
        // TODO: what's the best practice in returning structs?? JSON friendliness...
        return proposal;
    }

    function setProposalTitle(string memory _title)
        external
        onlyOwner(msg.sender)
        isEditable
    {
        proposal.title = _title;
    }

    function setProposalDetailsURI(string memory _uri)
        external
        onlyOwner(msg.sender)
        isEditable
        returns (bool)
    {
        proposal.uri = _uri;
        return true;
    }

    function getProposalDetailsURI() external view returns (string memory) {
        return proposal.uri;
    }

    function setVotingOptions(string[] memory _options)
        external
        onlyOwner(msg.sender)
        isEditable
    {
        proposal.votingOptions = _options;
    }

    function setVotingPeriod(uint256 _start, uint256 _stop)
        external
        onlyOwner(msg.sender)
        isEditable
    {
        require(
            _start > block.number && _start < _stop,
            "end > start > current"
        );
        proposal.startBlock = _start;
        proposal.stopBlock = _stop;
    }

    function updateProposalDetails(
        string memory _title,
        string memory _uri,
        string[] memory _options,
        uint256 _startBlock,
        uint256 _stopBlock,
        VotingTypes _votyingType
    ) external onlyOwner(msg.sender) isEditable {
        if (_startBlock < block.number || _startBlock > _stopBlock) {
            revert IncorrectParams("end > start > current");
        }
        proposal = ProposalDetails(
            _title,
            _uri,
            _options,
            _startBlock,
            _stopBlock,
            _votyingType
        );
    }

    function castSingleChoiceVote(string memory _choice) public {
        if (!votes[msg.sender].hasVoted) {
            revert VotingError("Already Voted");
        }

        if (indexOfVotingOptions(_choice) > -1) {
            revert VotingError("Wrong voting option");
        }
        if (!isVotingPeriodActive()) {
            revert VotingError("Voting period over");
        }
        //TODO: Create voting strategies for caclulating power
        uint256 power = 0;
        votes[msg.sender] = Vote(_choice, power, true);
        optionCounts[_choice] += power;
        totalVotes += power;
        emit VoteCast(msg.sender, _choice, power);
    }

    function indexOfVotingOptions(string memory _option)
        private
        view
        returns (int256)
    {
        for (uint256 i; i < proposal.votingOptions.length; i++) {
            if (
                keccak256(bytes(proposal.votingOptions[i])) ==
                keccak256(bytes(_option))
            ) {
                return int256(i);
            }
        }
        return -1;
    }

    function isVotingPeriodActive() private view returns (bool) {
        return (block.number < proposal.startBlock ||
            block.number > proposal.stopBlock);
    }
}
