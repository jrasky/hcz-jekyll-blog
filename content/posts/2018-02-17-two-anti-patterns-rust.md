---
title: "Two anti-patterns in Rust"
date: 2018-02-17
---

I had an interesting conversation with a friend today about programming
languages. in particular, we talked about Rust, which my friend had recently
used to do a small personal project. We talked about what matters in languages,
and how companies and people choose the languages that they do.

I'm a huge fan of Rust. I think it solves the data sharing problem, which is a
domain that's traditionally been the realm of functional languages. Those
languages have their merits, but it turns out that humans tend not to think the
way that functional languages work.

At one point, my friend got into two issues he ran into with Rust, which he felt
frustrated about, and which made him feel like the language really wasn't ready
for prime time. I understand how he feels, because one of the hardest things to
do when learning a language is to figure out why the language is built a certain
way. I know that I get frustrated at Go sometimes for reasons that feel similar.

The first anti-pattern my friend came across he called "partial borrows," which
more concretely is the issue around how member functions that take pointers to
`self` borrow the whole struct. Functionally, what he wants to do is write an
algorithm as member functions on one data structure that reference different
parts of the struct, and then compose calls to those methods to form an
algorithm. An example would be a method that produces a reference to some data
item, which is used to decide on what kind of mutation to do.

```rust
impl Algo {
    fn get_item(&self, key: String) -> &DataItem {
        // Produce a reference to a data item
    }

    fn update_accumulator(&mut self, item: &DataItem) {
        // Update the accumulator with the data item
    }

    fn do_work(&mut self) {
        let item = self.get_item("data_key");

        // Will not compile!
        self.update_accumulator(item);
    }
}
```

My sense about the matter is that the above code has a code smell, namely that
of a large struct. In a way, Rust is trying to tell you that accumulators and
data stores should be separate from each other. When you borrow from `self`,
that borrow effectively depends on the entire state of your struct. In other
languages, you'd have a new invariant: don't break the borrowed item while
updating the accumulator. In Rust, the compiler steps in because it can't prove
that your methods have those invariants.

```rust
struct Algo {
    data_items: DataStore,
    accum: Accumulator,
}

impl Algo {
    fn do_work(&mut self) {
        let item = self.data_items.get_item("data_key");

        // Will compile happily
        self.accum.update(item);
    }
}
```

It might not be readily obvious how the above code is really any different. All
I've done is to re-arrange how the data is organized, and the pattern of calls.
In most languages, this would be largely identical, since most languages let you
alias mutable data.

By splitting your data into pieces, and borrowing each piece separately, Rust
can prove that the two borrows can't interfere with each other. There have been
discussions about this issue in Rust, and how it would be great to have some way
to express those invariants in the type system, in a way merging the semantics
of other languages to a point into Rust. Maybe that's the right direction.

The second anti-pattern my friend tried to implement was that of out parameters.

```rust
fn do_work(buffer: &mut Vec<usize>) {
    // Do some work and mutate 
}
```

In imperative languages without move semantics, this kind of pattern can be
somewhat essential. By passing in a reference to a vector, you avoid copying all
the values. Unfortunately in Rust, out parameters play poorly with the borrow
checker. One out parameter is generally alright, but if you start to have more
than one out parameter, you can get some very bad interactions.

```rust
struct Algo {
    param: usize,
    inner_buffer: Vec<usize>
}

impl Algo {
    fn do_work(&self, buffer: &mut Vec<usize>) {
        // Do some work and mutate buffer, using information from self
    }

    fn process(&mut self) {
        // Will not compile!
        self.do_work(&mut self.inner_buffer);
    }
}
```

This is almost a combination of the first anti-pattern, but it's more of a case
of out parameters. With imperative programming, it's normal to destructively
update some object with information, and then eventually process its internal
state into some kind of output. This won't work, however, since the update
method takes self as a reference: if the above could compile, self would alias
buffer, and that breaks invariants in Rust.

```rust
struct Algo {
    param: usize,
    data: AlgoData
}

struct AlgoData {
    inner_buffer: Vec<usize>
}

impl AlgoData {
    fn do_work(&mut self, param: usize) {
        // Do work using param
    }
}

impl Algo {
    fn process(&mut self) {
        self.data.do_work(self.param);
    }
}
```

The solution in this case is to split the data structure. When you see an out
parameter in Rust, what you really want is a separate object, which has its own
methods. By doing this, you can narrow the borrow down to just the field of Algo
that you want to update.

There's a common theme in these two problems, which is that of overly broad
borrowing. In rust, `&mut self` really means you are borrowing the whole struct.
An important question you should ask yourself is what the scope of the different
references really means in your code. If you're borrowing `&mut self`, that
means the entire data structure, when what you probably want is to only borrow
part of the data structure.