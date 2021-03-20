const cfmm = artifacts.require("cfmm");
const ctez = artifacts.require("ctez");
const fa12 = artifacts.require("fa12");
const FA12LQT = artifacts.require("FA12LQT");

module.exports = async function (callback) {
  const ctezContract = await ctez.deployed();
  const cfmmContract = await cfmm.deployed();
  const fa12Contract = await fa12.deployed();
  const Fa12LqtContract = await FA12LQT.deployed();
  console.log(
    `Setting addresses in ctez ${cfmmContract.contract.address} ${fa12Contract.contract.address}`
  );
  await ctezContract.set_addresses(
    cfmmContract.contract.address,
    fa12Contract.contract.address
  );
  console.log(`Setting LQT Address ${Fa12LqtContract.contract.address}`);
  await cfmmContract.setLqtAddress(Fa12LqtContract.contract.address);
};
