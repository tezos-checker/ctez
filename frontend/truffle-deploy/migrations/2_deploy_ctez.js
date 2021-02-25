const cfmm = artifacts.require("cfmm");
const ctez = artifacts.require("ctez");
const fa12 = artifacts.require("fa12");
const FA12LQT = artifacts.require("FA12LQT");

const { MichelsonMap } = require("@taquito/michelson-encoder");

const ctezInitialStorage = {
  ovens: MichelsonMap.fromLiteral({}),
  target: 1 << 48,
  drift: 0,
  last_drift_update: "2021-01-01T00:00:00Z",
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
    xtzPool: 1,
    lqtTotal: 1,
    selfIsUpdatingTokenPool: false,
    manager: accounts[0],
    tokenAddress: fa12.address,
    consumerAddress: ctez.address,
    lastOracleUpdate: "2021-01-01T00:00:00Z",
  });
  await deployer.deploy(FA12LQT, {
    admin: cfmm.address,
    tokens: MichelsonMap.fromLiteral({}),
    allowances: MichelsonMap.fromLiteral({}),
    total_supply: 1,
  });
};
