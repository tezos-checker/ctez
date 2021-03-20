const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const rootDir = path.join(__dirname, "..", "..", "..");
const contractsDir = path.join(__dirname, "..", "contracts");

const helpersRootDir = path.join(__dirname, "..", "..", "..", "helpers");
const helpersDir = path.join(__dirname, "..", "helpers");

const cTezCustomDefines = {
  tez: "#define CASH_IS_TEZ",
  fa2: "#define CASH_IS_FA2",
  fa12: "#define CASH_IS_FA12",
};

const userSelection = args.length > 0 ? args[0] : "tez";

const mainContracts = [
  {
    name: "cfmm.mligo",
  },
  {
    name: "ctez.mligo",
  },
  {
    name: "fa12.mligo",
  },
  {
    name: "fa12.mligo",
    newName: "FA12LQT.mligo",
  },
];

const helperContracts = [
  {
    name: "oven.mligo",
  },
  {
    name: "oven_types.mligo",
  },
];

mainContracts.forEach(({ name, newName = null }) => {
  fs.copyFileSync(
    path.join(rootDir, name),
    path.join(contractsDir, newName || name)
  );
});

helperContracts.forEach(({ name, newName = null }) => {
  fs.copyFileSync(
    path.join(helpersRootDir, name),
    path.join(helpersDir, newName || name)
  );
});

const file = path.join(contractsDir, "cfmm.mligo");
const data = fs.readFileSync(file);
const fd = fs.openSync(file, "w+");
const buffer = Buffer.from(
  `#define ORACLE\n${cTezCustomDefines[userSelection]}`,
  "utf-8"
);

fs.writeSync(fd, buffer, 0, buffer.length, 0);
fs.writeSync(fd, data, 0, data.length, buffer.length);
