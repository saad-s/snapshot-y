const Proposal = artifacts.require("Proposal");
const { BN, expectRevert } = require("@openzeppelin/test-helpers");

contract("Proposal", function (accounts) {

  const guid = '0x1234567890ABCDEF';
  const title = "Proposal";
  const uri = "https://sample.com/file1";
  const votingOptions = ['agree', 'disagree', 'abstain'];
  const startBlock = new BN(10);
  const endBlock = new BN(20);

  describe('owner', () => {

    before(async () => {
      this.proposal = await Proposal.deployed();
    });

    before(async () => {
      await this.proposal.init(
        accounts[0], 
        guid, 
        title, 
        uri, 
        votingOptions, 
        startBlock, 
        endBlock, 
        Proposal.VotingTypes.SingleChoiceVoting)
    });
    
    it('should be contract deployer', async () => {
      const owner = await this.proposal.getOwner()
      return assert.equal(owner, accounts[0])
    });

    it('should be initialized only once', async () => {
      await expectRevert.unspecified(this.proposal.init(
        accounts[1], 
        guid, 
        title, 
        uri, 
        votingOptions, 
        startBlock, 
        endBlock, 
        Proposal.VotingTypes.SingleChoiceVoting));
    });
  });
});