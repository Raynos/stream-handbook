var Writable = require('stream').Writable;
var ws = Writable({ objectMode: true });
ws._write = function (chunk, enc, next) {
    console.dir(chunk);
    next();
};

process.stdin.pipe(ws);
