const truffleAssert = require("truffle-assertions");
const { BN } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Strategies = artifacts.require("Strategies");
const ValidToken = artifacts.require("SampleERC20");
const InValidToken = artifacts.require("CorruptERC20");
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Strategies", function (accounts) {
  const name = "SampleToken";
  const symbol = "ST";
  const caller = accounts[1];
  const owner = accounts[0];
  const minBalance = new BN(5);
  const initialSupply = new BN(50);
  const decimal = new BN(2);
  let strategiesInstance;
  let validTokenInstance;
  let invalidTokenInstance;

  async function initValidContract() {
    validTokenInstance = await ValidToken.new(initialSupply, name, symbol);
    strategiesInstance = await Strategies.new(
      validTokenInstance.address,
      minBalance
    );
  }

  async function initInvalidContract() {
    invalidTokenInstance = await InValidToken.new(
      name,
      symbol,
      decimal,
      initialSupply,
      owner
    );
    strategiesInstance = await Strategies.new(
      invalidTokenInstance.address,
      minBalance
    );
  }

  describe("valid ERC20", function () {
    describe("minimum balance gating strategy", function () {
      beforeEach("should setup the contract strategies instance", async () => {
        await initValidContract();
      });

      it("should return false for user with no balance", async function () {
        const result =
          await strategiesInstance.gateStrategyMinFungibleBalance.call(caller);
        expect(result).to.be.false;
      });

      it("should return true for user with  minimum balance requirement", async function () {
        await truffleAssert.passes(
          validTokenInstance.mint(minBalance, { from: caller })
        );
        const result =
          await strategiesInstance.gateStrategyMinFungibleBalance.call(caller);
        expect(result).to.be.true;
      });

      it("should return true for user with with balance greater than minimum balance requirement", async function () {
        await truffleAssert.passes(
          validTokenInstance.mint(minBalance.addn(1), { from: caller })
        );
        const result =
          await strategiesInstance.gateStrategyMinFungibleBalance.call(caller);
        expect(result).to.be.true;
      });

      it("should return false for user with balance lesser than minimum balance requirement", async function () {
        await truffleAssert.passes(
          validTokenInstance.mint(minBalance.subn(1), { from: caller })
        );
        const result =
          await strategiesInstance.gateStrategyMinFungibleBalance.call(caller);
        expect(result).to.be.false;
      });
    });

    describe("vanilla voting strategy", function () {
      const VANILLA_VOTE_POWER = new BN(1);
      beforeEach("should setup the contract strategies instance", async () => {
        await initValidContract();
      });

      it("should return error for user with no balance", async function () {
        await truffleAssert.reverts(
          strategiesInstance.vanillaVotingStrategy.call(caller)
        );
      });

      it("should return correct power for user with balance above 0", async function () {
        const result = await strategiesInstance.vanillaVotingStrategy.call(
          owner
        );
        expect(result).to.be.bignumber.equals(VANILLA_VOTE_POWER);
      });
    });

    describe("fungible balance voting strategy", function () {
      beforeEach("should setup the contract strategies instance", async () => {
        await initValidContract();
      });

      it("should return error for user with no balance", async function () {
        await truffleAssert.reverts(
          strategiesInstance.fungibleBalanceVotingStrategy.call(caller)
        );
      });

      it("should return correct power for user with balance above 0", async function () {
        await truffleAssert.passes(
          validTokenInstance.mint(minBalance, { from: caller })
        );
        const result =
          await strategiesInstance.fungibleBalanceVotingStrategy.call(caller);
        expect(result).to.be.bignumber.equals(minBalance);
      });
    });
  });

  describe("Invalid ERC20", function () {
    beforeEach("should setup the contract strategies instance", async () => {
      await initInvalidContract();
    });

    it("should return error on calling gating strategy", async function () {
      await truffleAssert.reverts(
        strategiesInstance.gateStrategyMinFungibleBalance.call(caller)
      );
    });

    it("should return error for on calling vanilla voting strategy", async function () {
      await truffleAssert.reverts(
        strategiesInstance.vanillaVotingStrategy.call(caller)
      );
    });

    it("should return error on calling fungible token voting strategy", async function () {
      await truffleAssert.reverts(
        strategiesInstance.fungibleBalanceVotingStrategy.call(caller)
      );
    });
  });
});
