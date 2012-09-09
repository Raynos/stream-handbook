# introduction

This document covers the basics of how to write [node.js](http://nodejs.org/)
programs with [streams](http://nodejs.org/docs/latest/api/stream.html).

```
"We should have some ways of connecting programs like garden hose--screw in
another segment when it becomes necessary to massage data in
another way. This is the way of IO also."
```

[Doug McIlroy. October 11, 1964](http://cm.bell-labs.com/who/dmr/mdmpipe.html)

![doug mcilroy](http://substack.net/images/mcilroy.png)

***

Streams come to us from the
[earliest days of unix](http://www.youtube.com/watch?v=tc4ROCJYbm0)
and have proven themselves over the decades as a dependable way to compose large
systems out of small components that
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

![brian kernighan](http://substack.net/images/kernighan.png)

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

With the [filed module](http://github.com/mikeal/filed) we get mime types, etag
caching, and error handling for free in addition to a nice streaming API.

Want compression? There are streaming modules for that too!

``` js
var http = require('http');
var filed = require('filed');
var oppressor = require('oppressor');

var server = http.createServer(function (req, res) {
    filed(__dirname + '/data.txt')
        .pipe(oppressor(req))
        .pipe(res)
    ;
});
server.listen(8000);
```

Now our file is compressed for browsers that support gzip or deflate! We can
just let [oppressor](https://github.com/substack/oppressor) handle all that
content-encoding stuff.

Once you learn the stream api, you can just snap together these streaming
modules like lego bricks or garden hoses instead of having to remember how to push
data through wonky non-streaming custom APIs.

Streams make programming in node simple, elegant, and composable.

# basics

Streams are just
[EventEmitters](http://nodejs.org/docs/latest/api/events.html#events_class_events_eventemitter)
that have a
[.pipe()](http://nodejs.org/docs/latest/api/stream.html#stream_stream_pipe_destination_options)
function and expected to act in a certain way depending if the stream is
readable, writable, or both (duplex).

To create a new stream, just do:

``` js
var Stream = require('stream');
var s = new Stream;
```

This new stream doesn't yet do anything because it is neither readable nor
writable.

## readable

To make that stream `s` into a readable stream, all we need to do is set the
`readable` property to true:

``` js
s.readable = true
```

Readable streams emit many `'data'` events and a single `'end'` event.
Your stream shouldn't emit any more `'data'` events after it emits the `'end'`
event.

This simple readable stream emits one `'data'` event per second for 5 seconds,
then it ends. The data is piped to stdout so we can watch the results as they

``` js
var Stream = require('stream');

function createStream () {
    var s = new Stream;
    s.readable = true

    var times = 0;
    var iv = setInterval(function () {
        s.emit('data', times + '\n');
        if (++times === 5) {
            s.emit('end');
            clearInterval(iv);
        }
    }, 1000);
    
    return s;
}

createStream().pipe(process.stdout);
```

```
substack : ~ $ node rs.js
0
1
2
3
4
substack : ~ $ 
```

In this example the `'data'` events have a string payload as the first argument.
Buffers and strings are the most common types of data to stream but it's
sometimes useful to emit other types of objects.

Just make sure that the types you're emitting as data is compatible with the
types that the writable stream you're piping into expects.
Otherwise you can pipe into an intermediary conversion or parsing stream before
piping to your intended destination.

## writable

Writable streams

## duplex

Duplex streams are just streams that are both readable and writable.

## pipe

`.pipe()` is the only member function of the built-in `Stream` prototype.

`.pipe(target)` returns the destination stream, `target`.
This means you can chain `.pipe()` calls together like in the shell with `|`.

### pause / resume / drain

## backpressure

## destroy

## stream-spec

## read more

* [core stream documentation](http://nodejs.org/docs/latest/api/stream.html#stream_stream)
* [notes on the stream api](http://maxogden.com/node-streams)
* [why streams are awesome](http://blog.dump.ly/post/19819897856/why-node-js-streams-are-awesome)

## the future

A big upgrade is planned for the stream api in node 0.9.
The basic apis with `.pipe()` will be the same, only the internals are going to
be different. The new api will also be backwards compatible with the existing
api documented here for a long time.

You can check the
[readable-stream](https://github.com/isaacs/readable-stream) repo to see what
these future streams will look like.

***

# built-in streams

These streams are built into node itself.

## process

### [process.stdin](http://nodejs.org/docs/latest/api/process.html#process_process_stdin)

This readable stream contains the standard system input stream for your program.

It is paused by default but the first time you refer to it `.resume()` will be
called implicitly on the
[next tick](http://nodejs.org/docs/latest/api/process.html#process_process_nexttick_callback).

If process.stdin is a tty (check with
[`tty.isatty()`](http://nodejs.org/docs/latest/api/tty.html#tty_tty_isatty_fd))
then input events will be line-buffered. You can turn off line-buffering by
calling `process.stdin.setRawMode(true)` BUT the default handlers for key
combinations such as `^C` and `^D` will be removed.

### process.stdout

### process.stderr

## child_process.spawn()

## fs

### fs.createReadStream()

### fs.createWriteStream()

## net

### [net.connect()](http://nodejs.org/docs/latest/api/net.html#net_net_connect_options_connectionlistener)

This function returns a [duplex stream] that connects over tcp to a remote
host.

You can start writing to the stream right away and the writes will be buffered
until the `'connect'` event fires.

### net.createServer()

## http

### http.request()

### http.createServer()

## zlib

### zlib.createGzip()

### zlib.createGunzip()

### zlib.createDeflate()

### zlib.createInflate()

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

# http streams

## request

## filed

## oppressor

## response-stream

***

# io streams

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

# audio streams

## [baudio](https://github.com/substack/baudio)

# rpc streams

## dnode

## rpc-stream

***

# test streams

## tap

## stream-spec

***

# power combos

## roll your own socket.io

We can build a socket.io-style event emitter api over streams using some of the
libraries mentioned earlier in this document.

First  we can use [shoe](http://github.com/substack/shoe)
to create a new websocket handler server-side and
[emit-stream](https://github.com/substack/emit-stream)
to turn an event emitter into a stream that emits objects.
The object stream can then be fed into
[JSONStream](https://github.com/dominictarr/JSONStream)
to serialize the objects and from there the serialized stream can be piped into
the remote browser.

``` js
var EventEmitter = require('events').EventEmitter;
var shoe = require('shoe');
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');

var sock = shoe(function (stream) {
    var ev = new EventEmitter;
    emitStream(ev)
        .pipe(JSONStream.stringify())
        .pipe(stream)
    ;
    ...
});
```

Inside the shoe callback we can emit events to the `ev` function.  Here we'll
just emit different kinds of events on intervals:

``` js
var intervals = [];

intervals.push(setInterval(function () {
    ev.emit('upper', 'abc');
}, 500));

intervals.push(setInterval(function () {
    ev.emit('lower', 'def');
}, 300));

stream.on('end', function () {
    intervals.forEach(clearInterval);
});
```

Finally the shoe instance just needs to be bound to an http server:

``` js
var http = require('http');
var server = http.createServer(require('ecstatic')(__dirname));
server.listen(8080);

sock.install(server, '/sock');
```

Meanwhile on the browser side of things just parse the json shoe stream and pass
the resulting object stream to `eventStream()`. `eventStream()` just returns an
event emitter that emits the server-side events:

``` js
var shoe = require('shoe');
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');

var parser = JSONStream.parse([true]);
var stream = parser.pipe(shoe('/sock')).pipe(parser);
var ev = emitStream(stream);

ev.on('lower', function (msg) {
    var div = document.createElement('div');
    div.textContent = msg.toLowerCase();
    document.body.appendChild(div);
});

ev.on('upper', function (msg) {
    var div = document.createElement('div');
    div.textContent = msg.toUpperCase();
    document.body.appendChild(div);
});
```

Use [browserify](https://github.com/substack/node-browserify) to build this
browser source code so that you can `require()` all these nifty modules
browser-side:

```
$ browserify main.js -o bundle.js
```

Then drop a `<script src="/bundle.js"></script>` into some html and open it up
in a browser to see server-side events streamed through to the browser side of
things.

With this streaming approach you can rely more on tiny reusable components that
only need to know how to talk streams. Instead of routing messages through a
global event system socket.io-style, you can focus more on breaking up your
application into tinier units of functionality that can do exactly one thing
well.

For instance you can trivially swap out JSONStream in this example for
[stream-serializer](https://github.com/dominictarr/stream-serializer)
to get a different take on serialization with a different set of tradeoffs.
You could bolt layers over top of shoe to handle
[reconnections](https://github.com/dominictarr/reconnect) or heartbeats
using simple streaming interfaces.
You could even add a stream into the chain to use namespaced events with
[eventemitter2](https://npmjs.org/package/eventemitter2) instead of the
EventEmitter in core.

If you want some different streams that act in different ways it would likewise
be pretty simple to run the shoe stream in this example through mux-demux to
create separate channels for each different kind of stream that you need.

As the requirements of your system evolve over time, you can swap out each of
these streaming pieces as necessary without as many of the all-or-nothing risks
that more opinionated framework approaches necessarily entail.
