const Proposal = artifacts.require("Proposal");

module.exports = function (deployer) {
  deployer.deploy(Proposal, 'Proposal', 'https://sample.com', ['yes', 'no', 'maybe'], 60000, 60500);
};
