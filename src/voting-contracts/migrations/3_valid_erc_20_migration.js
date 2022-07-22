const SampleERC20 = artifacts.require("SampleERC20");
const {BN} = require('bn.js');

const name = "SampleToken";
const symbol = "ST";
const initialSupply = new BN(50);
module.exports = function (deployer, accounts) {


  deployer.deploy(SampleERC20, initialSupply, name, symbol);
};
