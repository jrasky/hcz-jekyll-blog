---
layout: post
title: "Apple's Defaults System"
date: 2017-12-31
---

If you have an iPhone, or even if you don't, you've likely heard the plight of iOS users who are unable to change the default application for handling a certain kind of content.

![Firefox documentation lamenting the lack of changeable defaults](/static/img/apple-ios-defaults-firefox.png)

Apple's defaults system is kind of broken. In particular, it's missing any kind of disambiguation. That means that every app has to have a unique url scheme that it uses, and it alone. I'm not sure if it's a requirement, but it seems like apps are misusing the "authority" part of a URI as part of the path. For example, Twitter uses the `twitter` scheme for handling inter-app links on iOS:

![Twitter has issues with authority](/static/img/apple-ios-defaults-twitter.png)

It feels so distinctly un-Apple to have made things work this way. The way Android handles the situation is much more correct, and makes a difference between host and path. Of course, Android includes UI to allow users to select which app should handle a URL if multiple apps are able to.

![Android's URL matching is more complete](/static/img/apple-ios-defaults-android.png)

Apple's own documentation has fun using URL and URI interchangeably, which is kind of annoying since people should take the time to make documentation as correct as possible. URL in particular is for resources over a network, and apps on the same phone are definitely not over the network.

![Apple also has issues with authority](/static/img/apple-ios-defaults-docs.png)

Apple has certainly heard people complain that they can't change app defaults at all on iOS. I'm sure they have their own internal reasoning as to why they haven't done it yet. Their documentation talks about there being no process "yet" to determine which app actually gets a scheme that it registers if that scheme conflicts with another app, which means that they at least recognize that in theory it's something they could fix. My best guess is that their reasoning is that a feature that allows easily changing default apps would lower engagement for their own and others' apps. I think it's pretty cynical to think along those lines, but it's tough to justify if not for that reason.

![Apple uses the magic word](/static/img/apple-ios-defaults-disambiguation.png)

The biggest question is whether changing defaults would actually make the iPhone better over time. The issue is that it likely wouldn't. The iPhone is more than just a hardware platform, it's an entire ecosystem of services. You can use other apps on the iPhone: the integration point is the homescreen. If you remember, the very first iPhone didn't have third-party apps at all. The amount of work that it probably took to overhaul everything to allow for third party apps was no doubt huge. Third party apps, in a general sense, grow the usefulness of the iPhone, especially in the long run.