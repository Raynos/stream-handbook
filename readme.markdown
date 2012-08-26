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
[do one thing well](http://www.faqs.org/docs/artu/ch01s06.html#id2873237).
In unix, streams are implemented by the shell with `|` pipes.
In node, the built-in
[stream module](http://nodejs.org/docs/latest/api/stream.html)
is used by the core libraries and easily be used by user-land code.
Similar to unix, the node stream module's primary composition operator is called
`.pipe()`.

Streams can be useful because they restrict the implementation surface area into
a single consistent interface.
You can then easily plug the output of one stream to the input of another and
[use libraries](http://npmjs.org) that operate abstractly on streams to
institute higher-level flow control.

Streams are an important component of
[small-program design](https://michaelochurch.wordpress.com/2012/08/15/what-is-spaghetti-code/)
and [unix philosophy](http://www.faqs.org/docs/artu/ch01s06.html)
but there are many other important abstractions worth considering.
Just remember that [technical debt](http://c2.com/cgi/wiki?TechnicalDebt)
is the enemy and seek the best abstractions for the problem at hand.

***

# basics

http://maxogden.com/node-streams

## readable

### pause / resume / drain

## writable

## pipe

## backpressure

## destroy

## stream-spec

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
