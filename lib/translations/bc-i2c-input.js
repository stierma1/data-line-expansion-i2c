
//require("babel-polyfill")
var RX = require("rx");
var i2c = require("i2c");

function vapor(args, dataSources){
  dataSources.get("creationMap").set(args.name, args.source, args, "bc-i2c-input");
}

module.exports = function(args, dataSources){
  var name = args.name;
  var address = args.address;
  var device = args.device;
  var wire = new i2c(address, {device:device});
  var command = args.command;
  var length = args.length;

  var dataSource = dataSources.get(args.source);

  var newSource = dataSource.map(function(){
    return new Promise(function(res, rej){
      wire.readBytes(command, length, function(err, res){
        if(err){
          rej(err);
          return;
        }
        res(res);
      });
    })
  })
  .concatAll()
  .publish()
  .refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, newSource);
}

module.exports.vapor = vapor;

module.exports.getArguments = async function(prompt, dataSources){
  var name = await prompt("What name will you give this new instance?\n");
  var device = await prompt("Input device path:\n");
  var address = parseInt(await prompt("Input address: (expects hex)\n"), 16);
  var command = parseInt(await prompt("Input command(or register) for reading: (expects hex)\n"), 16);
  var length = parseInt(await prompt("What is the length of the received body: (expects integer)\n"));
  var source = await(prompt("What will this be subscribing to?\n"));

  return {
    name:name,
    device:device,
    address:address,
    command: command,
    length:length,
    source:source
  }
}

module.exports.initialize = function(dataSources){
  dataSources.get("translations").set("bc-i2c-input", module.exports);
}
