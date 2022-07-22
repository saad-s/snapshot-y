const InvalidERC20 = artifacts.require("CorruptERC20");
const { BN } = require("bn.js");
const name = "Cosmo";
  const symbol = "CTX";
  const decimal = new BN(2);
  const tokenSupply = new BN(16);

  
module.exports = function (deployer, network, accounts) {
  
  const owner = accounts[0];
  deployer.deploy(InvalidERC20, name, symbol, decimal, tokenSupply, owner);
};
