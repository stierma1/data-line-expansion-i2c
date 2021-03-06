
//require("babel-polyfill")
var RX = require("rx");
var i2c = require("i2c");

function vapor(args, dataSources){
  dataSources.get("creationMap").set(args.name, null, args, "i2c-input");
}


module.exports = function(args, dataSources){
  var name = args.name;
  var address = args.address;
  var device = args.device;
  var wire = new i2c(address, {device:device});
  var command = args.command;
  var length = args.length;
  var poll = args.poll || 5000;
  var initCommands = args.initCommands || [];

  var source = RX.Observable.create(function(observer){
    var initProms = initCommands.map(function(commandObj){
      return function() {
        return new Promise(function(res, rej){
          //console.log(wire, writeByte, )
          wire.writeBytes(commandObj.command, commandObj.body, function(err){
            if(err){
              rej(err);
              return;
            }
            res();
          }); 
        });
      }
    });

    var start = Promise.resolve()
    for(var i in initProms){
      start = start.then(initProms[i])
    }
    start.catch(function(err){console.log(err)})
    start.then(function(){
      var int = setInterval(function(){
        wire.readBytes(command, length, function(err, res){
          if(err){
            observer.onError(err);
            clearInterval(int);
            return;
         }
         observer.onNext(res);
        });
      }, poll);
    }); 
  })
  .publish()
  .refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, source);
}

module.exports.vapor = vapor;

module.exports.getArguments = async function(prompt, dataSources){
  var name = await prompt("What name will you give this new instance?\n");
  var device = await prompt("Input device path:\n");
  
  var address = parseInt(await prompt("Input address: (expects hex)\n"), 16);
  var initCommands = [];
  var answer = "first";
  while(answer !== "" && answer !== null){
    answer = await prompt("Input initialize command: (expects (hex hex,hex...), leaving blank to move past this step)\n");
    if(answer !== ""){
      var command = parseInt(answer.split(" ")[0],16);
      var body = answer.split(" ")[1].split(",").map(function(h){return parseInt(h,16)}) 
      initCommands.push({command:command, body:body});
    }
  }
  var command = parseInt(await prompt("Input command(or register) for reading: (expects hex)\n"), 16);
  var length = parseInt(await prompt("What is the length of the received body: (expects integer)\n"));
  var poll = parseInt(await prompt("How often will the wire be read? (Default 5000ms)\n"));

  return {
    name:name,
    device:device,
    address:address,
    command: command,
    length:length,
    poll: poll,
    initCommands:initCommands
  }

}
