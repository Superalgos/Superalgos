---
title:  Overview
summary: ""
sidebar: suite_sidebar
permalink: suite-testing-overview.html
---

| Backtesting | Paper-Trading |
| :---: | :---: |
| ![session-backtesting](https://user-images.githubusercontent.com/13994516/66930152-7990a900-f034-11e9-8f97-2216e139cf40.png) | ![session-paper-trading](https://user-images.githubusercontent.com/13994516/66930155-7990a900-f034-11e9-9c87-0f5627c6f219.png) |

A simulation is a visual representation over the charts of any of the forms of strategy testing available within the platform: 

* **Backtesting:** testing over historic data;

* **Paper-trading:** testing over a live data feed, without placing orders at the exchange (orders are simulated);

* **Forward testing:** testing over a live data feed, placing actual orders at the exchange for a fraction of the available balance.

We will cover *forward testing* when we discuss live trading, as it involves placing orders at the exchange. For the time being, we will focus on the first two steps of the strategy-testing process.

As explained in the previous chapter, the trading bot handles testing sessions and is controlled by a task and its corresponding task manager. 

**To run a testing session, you will click *Run* on the corresponding task, and once the task is running, you will click *Run* on the session menu.**

[![Network-03-Running-Backtest](https://user-images.githubusercontent.com/13994516/67272210-68c0b700-f4bc-11e9-8eb2-04a253451932.gif)](https://user-images.githubusercontent.com/13994516/67272210-68c0b700-f4bc-11e9-8eb2-04a253451932.gif)

For your convenience, all our templates in the ```Quick-Start-Examples``` folder come with at least one backtesting and one paper-trading session set up. All you need to do is customize the *parameters* to your liking and, if you wish, add or remove layers to the *layer manager*, both offspring nodes of each testing session.

[![Network-04-Parameters](https://user-images.githubusercontent.com/13994516/67272211-68c0b700-f4bc-11e9-82c4-570699faa673.gif)](https://user-images.githubusercontent.com/13994516/67272211-68c0b700-f4bc-11e9-82c4-570699faa673.gif)