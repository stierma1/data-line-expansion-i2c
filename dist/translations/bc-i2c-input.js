
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

  var dataSource = dataSources.get(args.source);

  var newSource = dataSource.map(function () {
    return new Promise(function (res, rej) {
      wire.readBytes(command, length, function (err, res) {
        if (err) {
          rej(err);
          return;
        }
        res(res);
      });
    });
  }).concatAll().publish().refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, newSource);
};

module.exports.vapor = vapor;

module.exports.getArguments = function _callee(prompt, dataSources) {
  var name, device, address, command, length, source;
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
        _context.next = 12;
        return regeneratorRuntime.awrap(prompt("Input command(or register) for reading: (expects hex)\n"));

      case 12:
        _context.t1 = _context.sent;
        command = parseInt(_context.t1, 16);
        _context.next = 16;
        return regeneratorRuntime.awrap(prompt("What is the length of the received body: (expects integer)\n"));

      case 16:
        _context.t2 = _context.sent;
        length = parseInt(_context.t2);
        _context.next = 20;
        return regeneratorRuntime.awrap(prompt("What will this be subscribing to?\n"));

      case 20:
        source = _context.sent;
        return _context.abrupt("return", {
          name: name,
          device: device,
          address: address,
          command: command,
          length: length,
          source: source
        });

      case 22:
      case "end":
        return _context.stop();
    }
  }, null, this);
};

module.exports.initialize = function (dataSources) {
  dataSources.get("translations").set("bc-i2c-input", module.exports);
};