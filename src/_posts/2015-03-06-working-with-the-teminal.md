---
layout: post
title: "Working with the Terminal"
date: 2015-03-06
---

Having done by now a fair bit of work building a terminal application in Linux,
I'd like to mention how much the interface matches what I'd like to call "the
text box of doom." There are a few major issues that I have with it, namely

1. No way to read out the contents of the screen

    I understand the issue with doing so, but there being no way of getting the
    contents of the current screen means there is no real way to know what is on
    there--even if you clear everything and redraw, there might be some quirks
    with the terminal emulator that cause it to not actually contain what you
    think it contains.

2. No strict separation of control and text sequences

    Again, the limitations of the serial connection mean escape characters are
    really the only way to go when designing control sequences, but it would be
    nice to not mix them in with the text. I understand the simplicity of having
    applications just be able to print out contents and read back lines, but
    given the existence of termios this shouldn't need to be. Instead, there
    should be a "high" mode where text is a control sequence.

3. Output at the end of the line counts as a newline

    Ideally, lines should be inputted as that: lines. At least, there should be
    a way to do so, much like there is a line input method on the other end.
    Applications shouldn't have to worry about how long a line is exactly, and
    instead the terminal should treat each line like a line.

The result of all this is a lot of work and redundancy on the part of the
application to maintain a correct representation of the state of the display,
something which a good API should specifically avoid.
