---
title:  Live Trading History Layer
summary: "The Masters trading bot Jason provides an additional layer to track live trading activity."
sidebar: suite_sidebar
permalink: suite-live-trading-history-layer.html
---

In addition to the simulation layers, the <a data-toggle="tooltip" data-original-title="{{site.data.concepts.trading_bot}}">trading bot</a> provides an additional layer to track live trading activity. 

[![Live-Trading-Charts](https://user-images.githubusercontent.com/13994516/63526577-e9385b00-c4ff-11e9-898a-81880cfa0c7d.gif)](https://user-images.githubusercontent.com/13994516/63526577-e9385b00-c4ff-11e9-898a-81880cfa0c7d.gif)

The layer plots tiny orange circles to indicate the precise point in time and price of each execution of the bot.

When a buy order is successfully placed and filled at the exchange, a green triangle pointing upwards is drawn on the screen. The lower tip of the triangle signals the point in time and rate of the order.

When a sell order fills, a red triangle is plotted over the charts.

{% include note.html content="When live-trading, the simulation layers do not currently reflect the actual live trades, but simulated ones. This means that the take position rate and the exit rate (take profit or stop loss) is taken from the ideal rate, factoring fees and slippage as per the session's configuration, and not from the actual rate of the orders as filled at the exchange." %}