const Proposal = artifacts.require("Proposal");

module.exports = function (deployer, accounts) {
  deployer.deploy(Proposal);
};
