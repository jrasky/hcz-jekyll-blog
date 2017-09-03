---
layout: post
title: "Software Design Patterns"
date: 2017-09-02
---
Software is full of design patterns. What I’ve come to realize over the course of the last summer is that function of software can be split along somewhat generic lines. These steps are not extremely clear cut, nor is it possible to strictly categorize every line this way. The lesson here is that thinking along these lines is a productive way to consider the organization of the software that you write.

This is inspired by [Destroy All Software](https://www.destroyallsoftware.com/)’s talk called [Boundaries](https://www.destroyallsoftware.com/talks/boundaries), which presents the concept of functional core, imperative shell. I have found this model very useful, but Gary Bernhardt himself does not have an answer for how to shape the imperative shell. By building software along the lines of imperative shell, functional core, I have come to realize these distinctions below. Following these steps gives a clearer shape to the imperative shell, and clarifies the exact role of the functional core.

These are probably not new ideas, but they are ideas that I have found specifically helpful in considering the design of software components.

More than these principles, having enough time to develop software is critical. Good design choices do not lend themselves well to expediency, and chances are if you are feeling time pressure your priorities will shift and your code will suffer no matter what. Getting your sprints under control is absolutely the best way to improve software quality. Once you have reached a sustainable pace, these steps below may become useful. 

## Determines Input
Software often starts by determining the input provided by the user. Obtaining this input is a fundamentally imperative task that involves modifying global state. Transactions are dependent on the will of the user, so user input must be determined before a transaction can be built.

## Determines State
Software then determines the current state of the system. User commands typically involve some kind of stateful transaction against the current state, such as “copy file.” Before a decision can be made about what kind of transaction to construct, the current state needs to be available.

## Builds Transaction
With the user input and the current state gathered, the software can now make decisions. These decisions involve considering the current state and the user input, in order to determine what kind of transaction to build, and what parameters to give to that transaction. This part of the code is functional, since it maps input state onto an output transaction, without otherwise invoking any side effects.

## Executes Transaction
With the transaction now built, the software can take its parameters and kind and invoke side effects to execute the transaction. There may also be error handling here, or other sub-patterns of this kind for cases such as rollback. Software does not make decisions here, other than directly from the parameters of the transaction.

## Conclusion
Most software resembles the steps above. Or, at least, the above steps can be extracted out of many pieces of software. Badly written software will often mix these steps together, making it very tough to test each part of the process separately. Following this philosophy of separation will split your software into components that are easier to reason about and test. By cleanly separating decisions from side effects, integration tests can be fewer and simpler, with faster functional tests picking up the slack instead.