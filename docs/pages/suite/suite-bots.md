---
title:  Bots
summary: ""
sidebar: suite_sidebar
permalink: suite-bots.html
---

There are three different kinds of bots, sometimes called *algorithms* interchangeably:

* **Sensor Bots:** they extract raw data from external sources (*i.e.: exchanges, Twitter, etc.*) and store it in the platform's standardized format for others to consume;

* **Indicator Bots:** they process available information that other bots may have generated to produce elaborate datasets for others to consume;

* **Trading Bot:** based on datasets exposed as products by other bots (counting sensors, indicators and even other trading bots), a trading bot applies the trading logic defined on a trading system to, on one side, generate a complete trading simulation (outputting datasets that include trades, the action of strategies, validation of conditions, etc.), and on the other side, manages the execution of orders when on a forward testing or live trading session.

What these different kinds of bots have in common is that they all create _products_ that others can consume. To do this, they run _processes_ that produce and store _datasets_. That is, the product a bot creates may result in one or more datasets.

Each bot may have several processes, and processes don't necessarily have a one-to-one relationship with products. That is, a product can be the result of the work of one or more processes.

The datasets processes create are part of the _output_ of bots, and are stored in the file system. Processes also produce and store a second valuable piece of information: _status reports_.

Status reports serve as temporal annotations that bots read every time they are called by the platform to know what was done in the previous run and what the state of affairs is at present. Status reports are dynamic, and they change constantly, with updates after every single run of the associated process.

Upon execution, bots run in a branched sequence determined by their *status and data dependecies*. For instance, if bot A depends on the data produced by bot B, then bot A will be configured to run as soon as bot B finishes it's execution.

Each bot runs for as long as it may require to perform its job, usually in the order of a few seconds, and remain asleep until the next cycle is due.

The last pages of this chapter will go deeper into these few concepts, for those who may want to learn the intricacies.