---
title:  Getting Ready to Trade Live
summary: ""
sidebar: suitev_sidebar
permalink: suite-getting-ready-to-trade-live.html
---

To start forward-testing or live-trading with your own strategy, you need to follow the same steps explained in the *Getting Started* guide.

Not mentioned there is the following detail:

Make sure the following nodes are present in your strategy. If they are not, simply add them: go to the _Open Stage_ node and select _Add Open Execution_ on the menu; do the same with the _Close Stage_, adding _Close Execution_). No need to configure anything, simply make sure the nodes are there).

| Icon | Node | Stage |
| :---: | :---: | :--- |
| ![execution](https://user-images.githubusercontent.com/13994516/63542647-25c87e80-c521-11e9-899a-318bd6c62288.png) | Open Execution | Open Stage |
| ![execution](https://user-images.githubusercontent.com/13994516/63542647-25c87e80-c521-11e9-899a-318bd6c62288.png) | Close Execution | Close Stage |

As soon as you click *Run* in your session, your bot will be forward testing or trading live. What happens is that you are still running a simulation—thus all the simulation layers keep plotting the same kind of information over the Charts.

The difference is that orders will now go to the exchange.

**For maximum efficiency, we recommend you run live trading sessions on the 01-min time frame. Your bot will then be executed every 60 seconds to evaluate your strategy rules and decide if any action needs to be taken.**

 This is important even if your strategy operates at a lower frequency, as running the live session at the 01-min time frame guarantees that the trading bot will exit trades as soon as the one-minute candle closes tagging your stop or take profit target. On the contrary, if you run the live trading session at a time frame higher than 01-min, slippage when closing the position may be considerably greater.

> **WARNING:** Superalgos is at a very early stage of development. As such, errors may occur at any point, including errors that can cause you to lose money. You are responsible for taking all precautions before starting trading live. Make sure you test with small amounts of money, the kind you can afford losing. Also, make sure you understand the [Execution Limitations](Execution-Limitations). Trade live at your own risk.