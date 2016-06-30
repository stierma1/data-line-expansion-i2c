
//require("babel-polyfill")
var RX = require("rx");
var i2c = require("i2c");

function vapor(args, dataSources) {
  dataSources.get("creationMap").set(args.name, args.source, args, "bc-i2c-input");
}

module.exports = function (args, dataSources) {
  var name = args.name;
  var address = args.address;
  var device = args.device;
  var wire = new i2c(address, { device: device });
  var command = args.command;
  var length = args.length;
  var initCommands = args.initCommands || [];

  for (var i in initCommands) {
    var obj = initCommands[i];
    wire.writeBytes(obj.command, obj.body, function () {});
  }

  var dataSource = dataSources.get(args.source);

  var newSource = dataSource.map(function () {
    return new Promise(function (res, rej) {
      wire.readBytes(command, length, function (err, resu) {
        if (err) {
          rej(err);
          return;
        }
        res(resu);
      });
    });
  }).concatAll().publish().refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, newSource);
};

module.exports.vapor = vapor;

module.exports.getArguments = function _callee(prompt, dataSources) {
  var name, device, address, initCommands, answer, command, body, length, source;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return regeneratorRuntime.awrap(prompt("What name will you give this new instance?\n"));

      case 2:
        name = _context.sent;
        _context.next = 5;
        return regeneratorRuntime.awrap(prompt("Input device path:\n"));

      case 5:
        device = _context.sent;
        _context.next = 8;
        return regeneratorRuntime.awrap(prompt("Input address: (expects hex)\n"));

      case 8:
        _context.t0 = _context.sent;
        address = parseInt(_context.t0, 16);
        initCommands = [];
        answer = "first";

      case 12:
        if (!(answer !== "" && answer !== null)) {
          _context.next = 19;
          break;
        }

        _context.next = 15;
        return regeneratorRuntime.awrap(prompt("Input initialize command: (expects (hex hex,hex...), leaving blank to move past this step)\n"));

      case 15:
        answer = _context.sent;

        if (answer !== "") {
          command = parseInt(answer.split(" ")[0], 16);
          body = answer.split(" ")[1].split(",").map(function (h) {
            return parseInt(h, 16);
          });

          initCommands.push({ command: command, body: body });
        }
        _context.next = 12;
        break;

      case 19:
        _context.next = 21;
        return regeneratorRuntime.awrap(prompt("Input command(or register) for reading: (expects hex)\n"));

      case 21:
        _context.t1 = _context.sent;
        command = parseInt(_context.t1, 16);
        _context.next = 25;
        return regeneratorRuntime.awrap(prompt("What is the length of the received body: (expects integer)\n"));

      case 25:
        _context.t2 = _context.sent;
        length = parseInt(_context.t2);
        _context.next = 29;
        return regeneratorRuntime.awrap(prompt("What will this be subscribing to?\n"));

      case 29:
        source = _context.sent;
        return _context.abrupt("return", {
          name: name,
          device: device,
          address: address,
          command: command,
          length: length,
          initCommands: initCommands,
          source: source
        });

      case 31:
      case "end":
        return _context.stop();
    }
  }, null, this);
};

module.exports.initialize = function (dataSources) {
  dataSources.get("translations").set("bc-i2c-input", module.exports);
};