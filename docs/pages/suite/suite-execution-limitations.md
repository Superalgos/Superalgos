---
title:  Execution Limitations
summary: ""
sidebar: suite_sidebar
permalink: suite-execution-limitations.html
---

At the current stage of development, users have no control whatsoever over the execution of orders.

The way execution works at this stage is quite basic: once conditions are met for taking a position, or once a take profit or stop target is hit, **one single market order is placed at the exchange**.

When taking a position, the Take Position price shown in simulations is defined by the formula you use in your ```Open Stage > Position Rate > Formula```. 

[![Live-Trading-Execution-Position-Rate](https://user-images.githubusercontent.com/13994516/63421629-3980c180-c409-11e9-837e-212e69588ebb.gif)](https://user-images.githubusercontent.com/13994516/63421629-3980c180-c409-11e9-837e-212e69588ebb.gif)

**However, this is overridden during live-trading, and replaced with a market order.**

When taking profit or hitting a stop, that is, when attempting to close a position, the price in simulations is determined by the intersection of the corresponding candle with the values resulting from the active take profit and stop phases formulas.

**However, during live-trading, once a take profit or stop target is hit, the order to close the trade is placed as a market order.**

Let's quickly review one of the implications these limitations may have, with an example:

[![Live-Trading-Execution-Control](https://user-images.githubusercontent.com/13994516/63420370-d2faa400-c406-11e9-9d0d-ce82cdd078c9.gif)](https://user-images.githubusercontent.com/13994516/63420370-d2faa400-c406-11e9-9d0d-ce82cdd078c9.gif)

The image above, featuring 10-minutes candles, shows a sudden drop in price. As you may see, there where only three executions of the trading bot during the price drop. 

Had there been a stop somewhere in the range of the sudden price drop, chances are that the price would trigger the stop in-between executions. This means that the engine would place the sell order some time after the price hit the stop, and the order would fill at a price lower than intended.

An additional limitation is that there currently is no feature to break up orders,  therefore, the size of your orders and the likeliness of them getting filled depend on the liquidity of the market/exchange.

> **NOTE: It is important that you fully understand the implications of these limitations if you are considering to trade live with the platform at this stage, as you will need to adapt to the current state of affairs.**
