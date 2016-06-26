//This installs a mock i2c on non arm-processors
const spawn = require('child_process').spawnSync;
const os = require('os');
var fs = require("fs");

if(os.arch() === "arm"){
  spawn("npm", ["install", "i2c"]);
} else {
  try{
    fs.mkdirSync("./node_modules/i2c");
    fs.createReadStream("./i2c/package.json").pipe(fs.createWriteStream("./node_modules/i2c/package.json"));
    fs.createReadStream("./i2c/index.js").pipe(fs.createWriteStream("./node_modules/i2c/index.js"));
  } catch(err){
    console.log("delete i2c from node modules and rerun")
  }
}
