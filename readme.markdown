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

## readable

## writable

## pipe

## backpressure

***

# builtin streams

## child_process.spawn()

## fs.createReadStream()

## fs.createWriteStream()

## net.connect()

## net.createServer()

## http.request()

## http.createServer()

***

# control streams

## through

## pause-stream

## concat-stream

## duplex

## mux-demux

## emit-stream

## invert-stream

## map-stream

## remote-events

***

# state streams

## cdrt

## delta-stream

***

# io streams

## request

## reconnect

## kv

***

# parser streams

## tar

## trumpet

## JSONStream

## json-scrape

## trumpet

***

# browser streams

## shoe

## domnode

## sorta

## graph-stream

## arrow-keys

***

# rpc streams

## dnode

## rpc-stream

***

# test streams

## tap
