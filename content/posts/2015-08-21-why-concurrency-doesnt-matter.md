---
title: "Why Concurrency doesn't Matter"
date: 2015-08-21
---

Or, why I like Rust

There's a lot of talk these days about how important concurrency is. The reasons
are obvious: in a world of computing at scale, single processors don't. Many
people decry the death of Moore's law, and increasingly they seem to be right.
Transistors can only get so small, after all. As a result, the constantly
increasing desire for computer performance will have to come from concurrency,
working around the issue of Moore's law entirely. All of this is sound reasoning.

Most older languages were designed in a world where Moore's law was still very
valid, and where compute performance came from single processors, not farms of
them. Concurrency and scale networks existed, but were largely restricted to
scientific computing or very special edge-cases, and the technologies that came
out of them were not generally useful. Those days were great. However, that
world doesn't exist anymore, and instead the lessons being drawn from the
current flock of "giants" is the importance of scale. The future is now, and it
looks like networks.

As a result, these older languages did not serve the concurrency story very
well. Though concurrency primitives existed in those languages, they usually
require careful thought and planning for effective use. Data races abound,
memory corruption is easy. In general, it's not the most inviting environment.
In reaction to this, certain modern languages tout "concurrency support" as a
major feature. The goal: to be rid of the pitfalls of traditional concurrency,
and instead present a sane, easy-to-use interface that falls neatly in with all
the other traditional paradigms of programming everybody is used to. Truly a
noble cause.

The problem lies here: concurrency is an anti-pattern to the traditional
programming paradigms. Computing takes a certain level of discipline, especially
with non-managed languages. Concurrency makes everything much harder, requiring
either a much higher degree of discipline or a much higher degree of management.
The latter group includes languages like Haskell, which are generally much more
declarative. What you lose in terms of control over your code, however, you gain
in performance. Suddenly, all the traditional problems with concurrency go away,
and you're left with something concurrent and safe. This is awesome, except that
you lose many of the traditional paradigms most programmers are used to. It's
great for a wide variety of problems that benefit greatly from concurrency, but
it's also hard to get used to, and not great for an equally large number of
corner cases in more traditional programming where a certain level of
concurrency plays positively to the application. Not only this, but learning
this style requires a lot of domain-specific work and knowledge. This doesn't
sound like the best solution.

What certain modern languages offer does sound like a great solution: sane
concurrency without any of the micro-management baggage. It's a great promise,
but one that's ultimately contradictory. These modern languages do provide great
front-ends to the concurrency primitives everybody loves to hate. If your
greatest worry is about correctly creating or scheduling threads, or scaling to
tens of thousands of threads, or about correctly cleaning up a thread's
resources when it finishes, then these new languages offer exactly what you're
after.

That's not really the--or, at least, my--greatest concern with threads.
Obviously, resource management and scale are an issue, but those are whenever
I'm doing any programming. They're amplified by threads, but they aren't
fundamentally _new_ worries. The new worries I do have relate to data races.
Threading means giving up a huge amount of control over how your code executes,
which means any interactions different parts of your code have are now much less
predictable. The easy way to get out of this trap is to prevent all
interactions, but that precludes any real benefits that concurrency provides. If
all concurrent tasks are completely independent, then they cannot service the
same problem.

Using concurrency to work on a single problem requires sharing certain
resources, even if those resources are simply messages. That shared state means
data races are possible. Data races are an entirely different class of worries
from what's possible in traditional, single-threaded programming. These concerns
are serviced by the micro-management model, but not by the sexy-interface model
employed by certain modern languages. As a result, these new languages do not
really solve any underlying problems, but instead lather on a fresh layer of
paint. On a small scale, everything feels awesome. On a larger scale, all the
same problems come back.

This is why concurrency doesn't matter. It doesn't because the real problems
concurrency causes aren't addressed by modern languages. Certain other, more
declarative languages address them to a certain degree, but are "weird" enough
to not be generally useful. Or, if they are, they haven't seen very much
adoption.

What about the resource management and scaling category of problems, however?
Although they are fairly general, they are definitely amplified by concurrency.
The traditional answer to resource management has been garbage collection, which
is a good solution, but doesn't _always_ scale very well. Not only this, but
resource management incurs a performance penalty, caused by the garbage
collection itself and by the extra work required when acquiring or releasing
resources. Much like the micro-management model for concurrency, this doesn't
seem like the best solution.

This is where Rust comes in. Rust's major innovation is the borrow checker, an
additional bit of information the compiler tracks which enables it to determine
when data comes into and falls out of scope. This means the compiler can
identify in a deterministic fashion when to free resources, meaning it can
insert this information into the binary it produces. No more need for separate
garbage collection, instead resources are freed at the ends of certain lexical
scopes. This can obviously hurt performance--especially when code is written
such that large amounts of data are copied and freed--but this is always the
case when the language does not micro-manage your code.

What isn't always the case is the level of control that a borrow checker gives
you. Even if the worst case isn't very different from a garbage collector, the
average case is much better. All the resources your program uses are right
there, instead of being hidden away behind a garbage collector. Plus, the
behavior is defined by the lexical scope of your code, and not by some black-box
mechanics taking place behind the scenes of the garbage collector.

All of this makes for a mechanic that I think will survive Rust as a language.
The borrow checker is something extremely useful in general programming, not
only because it manages resources with no overhead, but because it also prevents
many classes of memory corruption issues and data races often present in other
languages. Much like type checking before it, I think borrow checking will
become part of future languages and we'll all wonder how we ever dealt with
programming without it.
