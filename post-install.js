//This installs a mock i2c on non arm-processors
const spawn = require('child_process').spawnSync;
const os = require('os');
var fs = require("fs");
console.log(os.arch() === "arm")
if(os.arch() === "arm"){
  spawn("npm", ["install", "i2c"]);
} else {
  try{
    console.log("WTf")
    fs.mkdirSync("./node_modules/i2c");
    fs.createReadStream("./_i2c/package.json").pipe(fs.createWriteStream("./node_modules/i2c/package.json"));
    fs.createReadStream("./_i2c/index.js").pipe(fs.createWriteStream("./node_modules/i2c/index.js"));
  } catch(err){
    console.log("delete i2c from node modules and rerun")
  }
}
