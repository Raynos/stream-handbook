var concat = require('concat-stream');
process.stdin.pipe(concat(function (body) {
    console.dir(JSON.parse(body));
}));
