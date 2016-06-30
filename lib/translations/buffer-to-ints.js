
//require("babel-polyfill")
var RX = require("rx");

function vapor(args, dataSources){
  dataSources.get("creationMap").set(args.name, args.source, args, "buffer-to-ints");
}

module.exports = function(args, dataSources){
  var name = args.name;

  var dataSource = dataSources.get(args.source);

  var newSource = dataSource.map(function(buffer){
    var data = [];
    for(var i =0; i < buffer.length; i++){
      data[i] = buffer[i];
    }
    return data;
  })
  .publish()
  .refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, newSource);
}

module.exports.vapor = vapor;

module.exports.getArguments = async function(prompt, dataSources){
  var name = await prompt("What name will you give this new instance?\n");
  var source = await(prompt("What will this be subscribing to?\n"));

  return {
    name:name,
    source:source
  }
}

module.exports.initialize = function(dataSources){
  dataSources.get("translations").set("buffer-to-ints", module.exports);
}
