const { BN } = require("@openzeppelin/test-helpers");
const Proposal = artifacts.require("Proposal");

const title = "TestContract";
const uri = "https://www.google.com/";
const votingOptions = ['yes', 'no', 'neutral'];
const startBlock = new BN(0);
const endBlock = new BN(10);

module.exports = function (deployer, accounts) {
  deployer.deploy(Proposal, accounts[0], title, uri, votingOptions, startBlock, endBlock, Proposal.VotingTypes.SingleChoiceVoting);
};
