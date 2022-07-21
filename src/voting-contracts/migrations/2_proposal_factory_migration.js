const Proposal = artifacts.require("Proposal");
const ProposalFactory = artifacts.require("ProposalFactory");

module.exports = function (deployer, accounts) {
  deployer.deploy(Proposal).then(() => {
    return deployer.deploy(ProposalFactory, Proposal.address);
  });
};
