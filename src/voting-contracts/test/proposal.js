const Proposal = artifacts.require("Proposal");
const { BN, expectRevert, time, snapshot } = require("@openzeppelin/test-helpers");

contract("Proposal", function (accounts) {

  const guid = '0x1234567890ABCDEF';
  const title = "Proposal";
  const uri = "https://sample.com/file1";
  const votingOptions = ['agree', 'disagree', 'abstain'];
  const startBlock = new BN(100);
  const endBlock = new BN(200);

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
        Proposal.VotingTypes.SingleChoiceVoting
      );
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
        Proposal.VotingTypes.SingleChoiceVoting
      ));
    });
  });

  describe('proposal details', () => {
    // TODO: can be retrieved by calling `getProposalDetails`

    it('can only be updated by proposal owner', async () => {
      await expectRevert.unspecified(this.proposal.updateProposalDetails(
        guid, 
        title, 
        uri, 
        votingOptions, 
        startBlock, 
        endBlock, 
        Proposal.VotingTypes.SingleChoiceVoting, 
        {from: accounts[2]}
      ));
    });

    it('can only be updated before start block height is reached', async () => {
      // get current snapshot of chain 
      // before moving chain tip forward 
      const snapshotA = await snapshot();
      const currentBlock = await web3.eth.getBlockNumber();
      if (currentBlock < startBlock) {
        // NOTE: this freezes ganache ui...
        await time.advanceBlockTo(startBlock);
      }
      await expectRevert.unspecified(this.proposal.updateProposalDetails(
        guid, 
        title, 
        uri, 
        votingOptions, 
        startBlock, 
        endBlock, 
        Proposal.VotingTypes.SingleChoiceVoting
      ));
      // restore previous chain state to run further tests
      await snapshotA.restore();
    });
  });

});