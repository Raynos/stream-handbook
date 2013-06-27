process.stdin.on('readable', function () {
    var buf = process.stdin.read(3);
    console.dir(buf);
    process.stdin.read(0);
});
