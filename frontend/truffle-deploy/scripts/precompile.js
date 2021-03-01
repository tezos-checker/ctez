const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..", "..", "..");
const destDir = path.join(__dirname, "..", "contracts");

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
  fs.copyFile(path.join(rootDir, name), path.join(destDir, newName), (err) => {
    if (err) throw err;
  });
});

const file = path.join(destDir, "cfmm.mligo");
const data = fs.readFileSync(file);
const fd = fs.openSync(file, "w+");
const buffer = Buffer.from("#define CASH_IS_FA12", "utf-8");

fs.writeSync(fd, buffer, 0, buffer.length, 0);
fs.writeSync(fd, data, 0, data.length, buffer.length);
