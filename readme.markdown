# introduction

This document covers the basics of how to write [node.js](http://nodejs.org/)
programs with [streams](http://nodejs.org/docs/latest/api/stream.html).

```
"We should have some ways of connecting programs like garden hose--screw in
another segment when it becomes when it becomes necessary to massage data in
another way. This is the way of IO also."
```

[Doug McIlroy. October 11, 1964](http://cm.bell-labs.com/who/dmr/mdmpipe.html)

***

Streams come to us from the earliest days of unix and have proven themselves
over the decades as a dependable way to compose large systems out of small
components that
[do one thing well](http://www.faqs.org/docs/artu/ch01s06.html).
In unix, streams are implemented by the shell with `|` pipes.
In node, the built-in
[stream module](http://nodejs.org/docs/latest/api/stream.html)
is used by the core libraries and can also be used by user-space modules.
Similar to unix, the node stream module's primary composition operator is called
`.pipe()` and you get a backpressure mechanism for free to throttle writes for
slow consumers.

Streams can help to
[separate your concerns](http://www.c2.com/cgi/wiki?SeparationOfConcerns)
because they restrict the implementation surface area into a consistent
interface that can be
[reused](http://www.faqs.org/docs/artu/ch01s06.html#id2877537).
You can then plug the output of one stream to the input of another and
[use libraries](http://npmjs.org) that operate abstractly on streams to
institute higher-level flow control.

Streams are an important component of
[small-program design](https://michaelochurch.wordpress.com/2012/08/15/what-is-spaghetti-code/)
and [unix philosophy](http://www.faqs.org/docs/artu/ch01s06.html)
but there are many other important abstractions worth considering.
Just remember that [technical debt](http://c2.com/cgi/wiki?TechnicalDebt)
is the enemy and to seek the best abstractions for the problem at hand.

***

# why you should use streams

I/O in node is asynchronous, so interacting with the disk and network involves
passing callbacks to functions. You might be tempted to write code that serves
up a file from disk like this:

``` js
var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    fs.readFile(__dirname + '/data.txt', function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.end(String(err));
        }
        else res.end(data);
    });
});
server.listen(8000);
```

This code works but it's bulky and buffers up the entire `data.txt` file into
memory for every request before writing the result back to clients. If
`data.txt` is very large, your program could start eating a lot of memory as it
serves lots of users concurrently. The latency will also be high as users will
need to wait for the entire file to be read before they start receiving the
contents.

Luckily both of the `(req, res)` arguments are streams, which means we can write
this in a much better way using `fs.createReadStream()` instead of
`fs.readFile()`:

``` js
var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    var stream = fs.createReadStream(__dirname + '/data.txt');
    stream.on('error', function (err) {
        res.statusCode = 500;
        res.end(String(err));
    });
    stream.pipe(res);
});
server.listen(8000);
```

Here `.pipe()` takes care of listening for `'data'` and `'end'` events from the
`fs.createReadStream()`. This code is not only cleaner, but now the `data.txt`
file will be written to clients one chunk at a time immediately as they are
received from the disk.

Using `.pipe()` has other benefits too, like handling backpressure automatically
so that node won't buffer chunks into memory needlessly when the remote client
is on a really slow or high-latency connection.

But this example, while much better than the first one, is still rather verbose.
The biggest benefit of streams is their versatility. We can
[use a module](https://npmjs.org/) that operates on streams to make that example
even simpler:

``` js
var http = require('http');
var filed = require('filed');

var server = http.createServer(function (req, res) {
    filed(__dirname + '/data.txt').pipe(res);
});
server.listen(8000);
```

With this module we get mime types and error handling for free!

Once you learn the stream api, you'll be able to use
all the [modules on npm](https://npmjs.org/) that implement streaming APIs
without having to remember how to get data in and out of wonky custom APIs.

Streams make programming in node simple, elegant, and composable.

# basics

## readable

### pause / resume / drain

## writable

## pipe

## backpressure

## destroy

## stream-spec

## read more

* [core stream * documentation](http://nodejs.org/docs/latest/api/stream.html#stream_stream)
* [notes on the stream api](http://maxogden.com/node-streams)
* [why streams are awesome](http://blog.dump.ly/post/19819897856/why-node-js-streams-are-awesome)

***

# builtin streams

These streams are built into node itself.

## [process.stdin](http://nodejs.org/docs/latest/api/process.html#process_process_stdin)

This readable stream contains the standard system input stream for your program.

It is paused by default but the first time you refer to it `.resume()` will be
called implicitly on the
[next tick](http://nodejs.org/docs/latest/api/process.html#process_process_nexttick_callback).

If process.stdin is a tty (check with
[`tty.isatty()`](http://nodejs.org/docs/latest/api/tty.html#tty_tty_isatty_fd))
then input events will be line-buffered. You can turn off line-buffering by
calling `process.stdin.setRawMode(true)` BUT the default handlers for key
combinations such as `^C` and `^D` will be removed.

## process.stdout

## process.stderr

## child_process.spawn()

## fs.createReadStream()

## fs.createWriteStream()

## [net.connect()](http://nodejs.org/docs/latest/api/net.html#net_net_connect_options_connectionlistener)

This function returns a [duplex stream] that connects over tcp to a remote
host.

You can start writing to the stream right away and the writes will be buffered
until the `'connect'` event fires.

## net.createServer()

## http.request()

## http.createServer()

***

# control streams

## through

## from

## pause-stream

## concat-stream

## duplex

## duplexer

## emit-stream

## invert-stream

## map-stream

## remote-events

## buffer-stream

## event-stream

## auth-stream

***

# meta streams

## mux-demux

## stream-router

## multi-channel-mdm

***

# state streams

## cdrt

## delta-stream

***

# io streams

## request

## filed

## reconnect

## kv

## discovery-network

***

# parser streams

## tar

## trumpet

## [JSONStream](https://github.com/dominictarr/JSONStream)

Use this module to parse and stringify json data from streams.

If you need to pass a large json collection through a slow connection or you
have a json object that will populate slowly this module will let you parse data
incrementally as it arrives.

## json-scrape

## stream-serializer

***

# browser streams

## shoe

## domnode

## sorta

## graph-stream

## arrow-keys

## attribute

## data-bind

***

# rpc streams

## dnode

## rpc-stream

***

# test streams

## tap

## stream-spec
