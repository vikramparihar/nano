const EventEmitter = require("events");

class MyEmitter extends EventEmitter {}

const NanoEmitter = new MyEmitter();

module.exports = NanoEmitter;