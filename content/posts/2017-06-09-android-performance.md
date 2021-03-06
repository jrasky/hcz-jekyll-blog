---
title: "Android Performance"
date: 2017-06-09
---

Despite their impressive hardware specifications, Android devices have an
unfortunate reputation of poor performance. Frames get dropped, launching an
application takes a long time, or the whole device seems to freeze. This kind of
unpredictable performance isn’t great. One important factor of any platform is
the programming language used. Android is based around Java, a dynamic,
garbage-collected language with a hefty runtime and complex features that are
tough to optimize. Android’s kernel, Linux, is designed more for servers than
smartphones, and amplifies performance issues by making poor use of hardware.
The story of Android performance follows the design of the platform, from the
Java compiler and runtime to the Linux kernel at the base.

The Java Virtual Machine on Android was originally designed to be simple, to
conform to the resource constraints of the hardware it was running on. Google
chose to create a memory-efficient bytecode and an interpreter for their JVM.
Over time, hardware improved, and the JVM shifted to become a Just-In-Time
compiler. JIT compilers are fast, and avoid complex optimizations. Regardless,
compiler overhead meant application startup time became problem. Google tackled
this by designing an ahead-of-time compiler to supplement the existing JIT
design. By shifting the work of the compiler from application startup to
installation, startup time improved without sacrificing performance.

Garbage collection is about shifting the cost of memory management to reduce
latency. First generation hardware limitations required choosing a design for
the garbage collector that performed poorly on newer hardware. Applications
often had to wait on the garbage collector, at busy times that made this pausing
very noticeable. The new JIT design for the JVM improved on these glitches,
introducing concurrent garbage collection and compaction. Those and other more
complex strategies mean that modern applications rarely pause to wait for
garbage collection.

Between ahead-of-time compilation and improved garbage collection, the new
Android JVM accomplishes the important goal of getting out of the way. There are
some remaining performance issues, but most are solved. Some applications have
worse performance owing to their own design, which will always be the case on
any platform.

The JVM’s design had matured, but issues around latency persisted, especially
audio latency. Gaps in audio playback are even more unpleasant than dropped
frames, and cause loud pops. Google’s documentation details how the default
scheduler in Linux prioritizes threads that have not used processor time
recently. This means that despite giving priority to UI and audio threads, other
tasks might preempt user-facing ones during periods of high system usage. The
solution for audio threads is real-time scheduling, so that they will always run
immediately if they are ready.

Google has recently announced that Android “O” will carry hard limits on
background task execution. This will improve the situation considerably, as
applications will no longer be as able to impact performance once they aren’t
open. Google’s other project, Fuschia, is a complete redesign of the kernel, and
represents the more nuclear approach to the performance problem in Android. It
will be interesting to see what solutions are in store in the future, and what
shape the Android operating system and ecosystem will take.