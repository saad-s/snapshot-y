const Proposal = artifacts.require("Proposal");
const { BN, expectRevert, time } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

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

    it('can be initialized only once', async () => {
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

  describe('pause / unpause', () => {

    it('only owner can pause / unpause proposal', async () => {
      await expectRevert.unspecified(this.proposal.pauseContract({from: accounts[2]}));
    });

    it('proposal can be paused / unpaused', async () => {
      const currentBlock = await web3.eth.getBlockNumber();
      if(currentBlock > startBlock) {
        console.log('** ERROR ** TEST NOT POSSIBLE - current block:', currentBlock, 'start block:', startBlock.toNumber());
        return false;
      }
      
      await this.proposal.pauseContract();
      let state = await this.proposal.isPaused();
      assert.equal(state, true);
      
      this.contractState = await this.proposal.unpauseContract();
      state = await this.proposal.isPaused();
      return assert.equal(state, false);
    });

    it('pause / unpause emits event', async () => {
      const currentBlock = await web3.eth.getBlockNumber();
      if (currentBlock > startBlock) {
        console.log('** ERROR ** TEST NOT POSSIBLE - current block:', currentBlock, 'start block:', startBlock.toNumber());
        return false
      }
      expectEvent(this.contractState, 'Unpaused', {account: accounts[0]});
    });
  });

  describe('details', () => {
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
  });

  describe ('details utility function', () => {
    
    const newTitle = "Updated Proposal title";
    const newURI = "https://sample.com/file2";
    const newVotingOptions = ['yes', 'no', 'maybe'];
    const newStartBlock = new BN(150);
    const newEndBlock = new BN(250);

    it('should be able to update proposal details', async () => {
      const currentBlock = await web3.eth.getBlockNumber();
      if (currentBlock > startBlock) {
        console.log('** ERROR ** TEST NOT POSSIBLE - current block:', currentBlock, 'start block:', startBlock.toNumber());
        return 
      }
      await this.proposal.setProposalTitle(newTitle);
      await this.proposal.setProposalDetailsURI(newURI);
      await this.proposal.setVotingOptions(newVotingOptions);
      await this.proposal.setVotingPeriod(newStartBlock, newEndBlock);
      await this.proposal.setVotingType(Proposal.VotingTypes.RankedChoiceVoting);
      
      const details = await this.proposal.getProposalDetails();

      assert.equal(newTitle, details[1]);
      assert.equal(newURI, details[2]);
      assert.equal(newVotingOptions[0], details[3][0]);
      assert.equal(newVotingOptions[1], details[3][1]);
      assert.equal(newVotingOptions[2], details[3][2]);
      assert.equal(newStartBlock, details[4].toNumber());
      assert.equal(newEndBlock, details[5].toNumber());
      return assert.equal(Proposal.VotingTypes.RankedChoiceVoting, details[6]);
    });

    it('only owner should be able to update uri', async () => {
      await expectRevert.unspecified(this.proposal.setProposalDetailsURI(newURI, {from: accounts[2]}));
    });

    
  });

});


contract("Proposal", function (accounts) {
  const guid = '0x1234567890ABCDEF';
  const title = "Proposal";
  const uri = "https://sample.com/file1";
  const votingOptions = ['agree', 'disagree', 'abstain'];
  const startBlock = new BN(200);
  const endBlock = new BN(300);

  describe('block height dependant tests..', () => {
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
  });

  describe ('details', () => {
    it('can only be updated before start block height is reached', async () => {
      let currentBlock = await web3.eth.getBlockNumber();
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
    });
  });

  describe ('details utility function', () => {
    it('only allowed to update before start block height is reached', async () => {
      const newURI = "https://sample.com/file2";
      let currentBlock = await web3.eth.getBlockNumber();
      if (currentBlock < startBlock) {
        // NOTE: this freezes ganache ui...
        await time.advanceBlockTo(startBlock);
      }
      await expectRevert.unspecified(this.proposal.setProposalDetailsURI(newURI));
    });
  });
});