const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const rootDir = path.join(__dirname, "..", "..", "..");
const destDir = path.join(__dirname, "..", "contracts");

const cTezCustomDefines = {
  tez: "#define CASH_IS_TEZ",
  fa2: "#define CASH_IS_FA2",
  fa12: "#define CASH_IS_FA12",
};

const userSelection = args.length > 0 ? args[0] : "tez";

const files = [
  {
    name: "cfmm.mligo",
    newName: "cfmm.mligo",
  },
  {
    name: "ctez.mligo",
    newName: "ctez.mligo",
  },
  {
    name: "fa12.mligo",
    newName: "fa12.mligo",
  },
  {
    name: "fa12.mligo",
    newName: "FA12LQT.mligo",
  },
];

files.forEach(({ name, newName }) => {
  fs.copyFileSync(path.join(rootDir, name), path.join(destDir, newName));
});

const file = path.join(destDir, "cfmm.mligo");
const data = fs.readFileSync(file);
const fd = fs.openSync(file, "w+");
const buffer = Buffer.from(
  `#define ORACLE\n${cTezCustomDefines[userSelection]}`,
  "utf-8"
);

fs.writeSync(fd, buffer, 0, buffer.length, 0);
fs.writeSync(fd, data, 0, data.length, buffer.length);
