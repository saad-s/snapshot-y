const Strategies = artifacts.require("Strategies");
const {BN} = require('bn.js');

const ERC20 = "0x6483834D130ca21F934153cB40ee12136A56b4f2";
const minimumBalance = new BN(6);
module.exports = function (deployer, accounts) {
  deployer.deploy(Strategies, ERC20, minimumBalance);
};
