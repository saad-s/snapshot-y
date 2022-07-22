const Proposal = artifacts.require("Proposal");
const { BN, expectRevert, time } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const truffleAssert = require("truffle-assertions");
const { expect } = require("chai");

contract("Proposal", function (accounts) {
  const strategies = "0xDA8b3fa22c950D43507c2fF750EbF5E6C368312E";
  const guid = "0x1234567890ABCDEF";
  const title = "Proposal";
  const uri = "https://sample.com/file1";
  const votingOptions = ["agree", "disagree", "abstain"];
  const startBlock = new BN(100);
  const endBlock = new BN(200);

  describe("owner", () => {
    before(async () => {
      this.proposal = await Proposal.deployed();
    });

    before(async () => {
      await this.proposal.init(
        accounts[0],
        strategies,
        guid,
        title,
        uri,
        votingOptions,
        startBlock,
        endBlock,
        Proposal.VotingTypes.SingleChoiceVoting
      );
    });

    it("should be contract deployer", async () => {
      const owner = await this.proposal.getOwner();
      return assert.equal(owner, accounts[0]);
    });

    it("can be initialized only once", async () => {
      await expectRevert.unspecified(
        this.proposal.init(
          accounts[1],
          strategies,
          guid,
          title,
          uri,
          votingOptions,
          startBlock,
          endBlock,
          Proposal.VotingTypes.SingleChoiceVoting
        )
      );
    });
  });

  describe("pause / unpause", () => {
    it("only owner can pause / unpause proposal", async () => {
      await expectRevert.unspecified(
        this.proposal.pauseContract({ from: accounts[2] })
      );
    });

    it("proposal can be paused / unpaused", async () => {
      const currentBlock = await web3.eth.getBlockNumber();
      if (currentBlock > startBlock) {
        console.log(
          "** ERROR ** TEST NOT POSSIBLE - current block:",
          currentBlock,
          "start block:",
          startBlock.toNumber()
        );
        return false;
      }

      await this.proposal.pauseContract();
      let state = await this.proposal.isPaused();
      assert.equal(state, true);

      this.contractState = await this.proposal.unpauseContract();
      state = await this.proposal.isPaused();
      return assert.equal(state, false);
    });

    it("pause / unpause emits event", async () => {
      const currentBlock = await web3.eth.getBlockNumber();
      if (currentBlock > startBlock) {
        console.log(
          "** ERROR ** TEST NOT POSSIBLE - current block:",
          currentBlock,
          "start block:",
          startBlock.toNumber()
        );
        return false;
      }
      expectEvent(this.contractState, "Unpaused", { account: accounts[0] });
    });
  });

  describe("details", () => {
    // TODO: can be retrieved by calling `getProposalDetails`

    it("can only be updated by proposal owner", async () => {
      await expectRevert.unspecified(
        this.proposal.updateProposalDetails(
          guid,
          title,
          uri,
          votingOptions,
          startBlock,
          endBlock,
          Proposal.VotingTypes.SingleChoiceVoting,
          { from: accounts[2] }
        )
      );
    });
  });

  describe("details utility function", () => {
    const newTitle = "Updated Proposal title";
    const newURI = "https://sample.com/file2";
    const newVotingOptions = ["yes", "no", "maybe"];
    const newStartBlock = new BN(150);
    const newEndBlock = new BN(250);

    it("should be able to update proposal details", async () => {
      const currentBlock = await web3.eth.getBlockNumber();
      if (currentBlock > startBlock) {
        console.log(
          "** ERROR ** TEST NOT POSSIBLE - current block:",
          currentBlock,
          "start block:",
          startBlock.toNumber()
        );
        return;
      }
      await this.proposal.setProposalTitle(newTitle);
      await this.proposal.setProposalDetailsURI(newURI);
      await this.proposal.setVotingOptions(newVotingOptions);
      await this.proposal.setVotingPeriod(newStartBlock, newEndBlock);
      await this.proposal.setVotingType(
        Proposal.VotingTypes.RankedChoiceVoting
      );

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

    it("only owner should be able to update uri", async () => {
      await expectRevert.unspecified(
        this.proposal.setProposalDetailsURI(newURI, { from: accounts[2] })
      );
    });
  });
});

contract("Proposal", function (accounts) {
  const guid = "0x1234567890ABCDEF";
  const strategies = "0xDA8b3fa22c950D43507c2fF750EbF5E6C368312E";
  const title = "Proposal";
  const uri = "https://sample.com/file1";
  const votingOptions = ["agree", "disagree", "abstain"];
  const startBlock = new BN(200);
  const endBlock = new BN(300);

  describe("block height dependant tests..", () => {
    before(async () => {
      this.proposal = await Proposal.deployed();
    });

    before(async () => {
      await this.proposal.init(
        accounts[0],
        strategies,
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

  describe("details", () => {
    it("can only be updated before start block height is reached", async () => {
      let currentBlock = await web3.eth.getBlockNumber();
      if (currentBlock < startBlock) {
        // NOTE: this freezes ganache ui...
        await time.advanceBlockTo(startBlock);
      }
      await expectRevert.unspecified(
        this.proposal.updateProposalDetails(
          guid,
          title,
          uri,
          votingOptions,
          startBlock,
          endBlock,
          Proposal.VotingTypes.SingleChoiceVoting
        )
      );
    });
  });

  describe("details utility function", () => {
    it("only allowed to update before start block height is reached", async () => {
      const newURI = "https://sample.com/file2";
      let currentBlock = await web3.eth.getBlockNumber();
      if (currentBlock < startBlock) {
        // NOTE: this freezes ganache ui...
        await time.advanceBlockTo(startBlock);
      }
      await expectRevert.unspecified(
        this.proposal.setProposalDetailsURI(newURI)
      );
    });
  });
});

contract("Proposal", function (accounts) {
  // NOTE: Update contract address when migrations updated
  const strategies = "0xDA8b3fa22c950D43507c2fF750EbF5E6C368312E";
  const guid = "0x1234567890ABCDEF";
  const title = "TestContract";
  const uri = "https://www.google.com/";
  const votingOptions = ["yes", "no", "neutral"];
  const owner = accounts[0];
  const invalidOwner = accounts[1];
  const startBlockOffset = 10;
  const endBlockOffset = 20;
  let currentBlock;
  let startBlock;
  let endBlock;

  async function initContract() {
    proposalInstance = await Proposal.new();
    currentBlock = (await time.latestBlock()).addn(1);
    startBlock = new BN(currentBlock).addn(startBlockOffset);
    endBlock = startBlock.addn(endBlockOffset);
    await proposalInstance.init(
      owner,
      strategies,
      guid,
      title,
      uri,
      votingOptions,
      startBlockOffset,
      endBlockOffset,
      Proposal.VotingTypes.SingleChoiceVoting
    );
  }

  describe("get proposal uri", function () {
    beforeEach("should setup the contract proposal instance", async () => {
      await initContract();
    });

    it("should get proposal uri", async function () {
      const result = await proposalInstance.getProposalDetailsURI.call();
      expect(result).to.be.a("string");
      expect(result).to.equal(uri);
    });
  });

  describe("set proposal uri", function () {
    const newUri = "https://www.youtube.com/";

    beforeEach("should setup the contract proposal instance", async () => {
      await initContract();
    });

    it("should not set proposal uri when caller isn't owner", async function () {
      await truffleAssert.reverts(
        proposalInstance.setProposalDetailsURI.call(newUri, {
          from: invalidOwner,
        })
      );
    });

    it("should not set proposal uri current block has passed starting block", async function () {
      await time.advanceBlockTo(startBlock);
      await truffleAssert.reverts(
        proposalInstance.setProposalDetailsURI(newUri, { from: owner })
      );
    });

    it("should set proposal uri", async function () {
      const result = await proposalInstance.setProposalDetailsURI.call(newUri, {
        from: owner,
      });
      expect(result).to.be.true;
    });
  });

  describe("set voting options", function () {
    const updatedVotingOptions = ["yes", "no", "neutral", "veto-yes"];

    beforeEach("should setup the contract proposal instance", async () => {
      await initContract();
    });

    it("should not set voting options when caller isn't owner", async function () {
      await truffleAssert.reverts(
        proposalInstance.setVotingOptions.call(updatedVotingOptions, {
          from: invalidOwner,
        })
      );
    });

    it("should not set voting options  current block has passed starting block ", async function () {
      await time.advanceBlockTo(startBlock);
      await truffleAssert.reverts(
        proposalInstance.setVotingOptions.call(updatedVotingOptions, {
          from: owner,
        })
      );
    });

    it("should set voting options", async function () {
      const result = await proposalInstance.setVotingOptions.call(
        updatedVotingOptions,
        { from: owner }
      );
      expect(result).to.be.true;
    });
  });

  describe("set voting period", function () {
    beforeEach("should setup the contract proposal instance", async () => {
      await initContract();
    });

    it("should not set voting period when caller isn't owner", async function () {
      await truffleAssert.reverts(
        proposalInstance.setVotingPeriod.call(startBlock, endBlock.addn(30), {
          from: invalidOwner,
        })
      );
    });

    it("should not set voting period current block has passed starting block ", async function () {
      await time.advanceBlockTo(startBlock);
      await truffleAssert.reverts(
        proposalInstance.setVotingPeriod.call(startBlock, endBlock.addn(30), {
          from: owner,
        })
      );
    });

    it("should not set voting period when stop block < startBlock ", async function () {
      await truffleAssert.reverts(
        proposalInstance.setVotingPeriod.call(
          endBlock.addn(30),
          startBlock.addn(1),
          { from: owner }
        )
      );
    });

    it("should set voting period", async function () {
      const result = await proposalInstance.setVotingPeriod.call(
        startBlock,
        endBlock.addn(30),
        { from: owner }
      );
      expect(result).to.be.true;
    });
  });

  describe("set proposal details", function () {
    const updatedTitle = "Updated Title";
    const updatedUri = "https://www.google.com/";
    const updatedVotingOptions = ["yes", "no", "neutral", "fourth option"];

    beforeEach("should setup the contract proposal instance", async () => {
      await initContract();
    });

    it("should not update proposal details when caller isn't owner", async function () {
      await truffleAssert.reverts(
        proposalInstance.updateProposalDetails.call(
          guid,
          updatedTitle,
          updatedUri,
          updatedVotingOptions,
          startBlock,
          endBlock,
          Proposal.VotingTypes.SingleChoiceVoting,
          { from: invalidOwner }
        )
      );
    });

    it("should not update proposal details current block has passed starting block ", async function () {
      await time.advanceBlockTo(startBlock);
      await truffleAssert.reverts(
        proposalInstance.updateProposalDetails.call(
          guid,
          updatedTitle,
          updatedUri,
          updatedVotingOptions,
          startBlock,
          endBlock,
          Proposal.VotingTypes.SingleChoiceVoting,
          { from: owner }
        )
      );
    });

    it("should not update proposal details when stop block < startBlock ", async function () {
      await truffleAssert.reverts(
        proposalInstance.updateProposalDetails.call(
          guid,
          updatedTitle,
          updatedUri,
          updatedVotingOptions,
          endBlock,
          startBlock,
          Proposal.VotingTypes.SingleChoiceVoting,
          { from: owner }
        )
      );
    });

    it("should update proposal details", async function () {
      await truffleAssert.passes(
        proposalInstance.updateProposalDetails.call(
          guid,
          updatedTitle,
          updatedUri,
          updatedVotingOptions,
          currentBlock.addn(startBlockOffset),
          endBlock.addn(endBlockOffset),
          Proposal.VotingTypes.SingleChoiceVoting,
          { from: owner }
        )
      );
    });
  });

  describe("cast single vote", function () {
    const voter = accounts[2];

    beforeEach("should setup the contract proposal instance", async () => {
      await initContract();
    });

    it("should not cast vote current block is less than startBlock", async function () {
      await time.advanceBlockTo(startBlock.subn(1));
      await truffleAssert.reverts(
        proposalInstance.castSingleChoiceVote.call(votingOptions[0], {
          from: voter,
        })
      );
    });

    it("should not cast vote current block has passed endBlock", async function () {
      await time.advanceBlockTo(endBlock.addn(1));
      await truffleAssert.reverts(
        proposalInstance.castSingleChoiceVote.call(votingOptions[0], {
          from: voter,
        })
      );
    });

    it("should not cast vote when user passes invalid choice", async function () {
      const invalidVotingOption = "invalid choice";
      await time.advanceBlock(startBlock);
      await truffleAssert.reverts(
        proposalInstance.castSingleChoiceVote.call(invalidVotingOption, {
          from: voter,
        })
      );
    });

    it("should cast vote", async function () {
      await time.advanceBlockTo(startBlock);
      await truffleAssert.passes(
        proposalInstance.castSingleChoiceVote.call(votingOptions[0], {
          from: voter,
        })
      );
    });

    it("should not let voter cast vote twice", async function () {
      await time.advanceBlockTo(startBlock);
      await truffleAssert.passes(
        proposalInstance.castSingleChoiceVote(votingOptions[0], { from: voter })
      );
      await truffleAssert.reverts(
        proposalInstance.castSingleChoiceVote.call(votingOptions[1], {
          from: voter,
        })
      );
    });
  });
});
