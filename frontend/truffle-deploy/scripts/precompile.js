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
