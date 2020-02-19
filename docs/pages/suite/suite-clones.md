---
title:  Clones
summary: ""
sidebar: suite_sidebar
permalink: suite-clones.html
---

> **NOTE:** To understand clones, you first need to be familiar with [*references*](References).

## Introduction

We will analyze the case of clones under the same lens we analyzed how backups work: we will study how clones treat outgoing, incoming and internal references.

Unlike with backups, clones behave in the same way independently of the existence of the original structure of nodes in the workspace, therefore, we will not make such distinction in the following paragraphs.

## Outgoing References

**Outgoing references are kept intact.**

Pretty much like with backups, a clone preserves outgoing references. 

The same example as with backups apply: cloning a task running a session produces a copy of the task with the trading bot process instance maintaining the reference to the trading bot Multi-Period process, and the session maintaining the reference with the corresponding definition.

[![Clones-01-task](https://user-images.githubusercontent.com/13994516/71164672-d7698900-224f-11ea-9985-eee1a448a4de.gif)](https://user-images.githubusercontent.com/13994516/71164672-d7698900-224f-11ea-9985-eee1a448a4de.gif)

## Incoming References

**Incoming references are discarded.**

Let's go back to the example of a definition, like we did when exploring backups:

[![Clones-02-definition](https://user-images.githubusercontent.com/13994516/71164674-d8021f80-224f-11ea-8365-56c455b89f55.gif)](https://user-images.githubusercontent.com/13994516/71164674-d8021f80-224f-11ea-8365-56c455b89f55.gif)

The capture above shows that restoring a clone of a definition does not restore incoming references, even when the original structure of nodes is deleted before restoration.

## Internal References

**Internal references are kept intact.**

Going back to the *shapes* node example, the capture below shows how restonring a clone keeps internal references intact:

[![Clones-03-shapes](https://user-images.githubusercontent.com/13994516/71164677-d8021f80-224f-11ea-8707-5cde89de259c.gif)](https://user-images.githubusercontent.com/13994516/71164677-d8021f80-224f-11ea-8707-5cde89de259c.gif)

## Conclusion

The clone feature is designed to produce copies of data structures when you need to replicate nodes and expect the copies to behave similarly to the original.