const cfmm = artifacts.require("cfmm");
const ctez = artifacts.require("ctez");
const fa12 = artifacts.require("fa12");
const FA12LQT = artifacts.require("FA12LQT");
const { MichelsonMap } = require("@taquito/michelson-encoder");

const ctezInitialStorage = {
  ovens: MichelsonMap.fromLiteral({}),
  target: 1n << 48n,
  drift: 0,
  last_drift_update: "2021-01-01T00:00:00Z",
  cfmm_address: "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
  ctez_fa12_address: "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
};

module.exports = async (deployer, _network, accounts) => {
  await deployer.deploy(ctez, ctezInitialStorage);
  await deployer.deploy(fa12, {
    admin: ctez.address,
    tokens: MichelsonMap.fromLiteral({}),
    allowances: MichelsonMap.fromLiteral({}),
    total_supply: 1,
  });
  await deployer.deploy(cfmm, {
    tokenPool: 1,
    cashPool: 1,
    lqtTotal: 1,
    pendingPoolUpdates: 0,
    tokenAddress: fa12.address,
    consumerAddress: ctez.address,
    lastOracleUpdate: "2021-01-01T00:00:00Z",
    lqtAddress: "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
  });
  await deployer.deploy(FA12LQT, {
    admin: cfmm.address,
    tokens: MichelsonMap.fromLiteral({}),
    allowances: MichelsonMap.fromLiteral({}),
    total_supply: 1,
  });
};
