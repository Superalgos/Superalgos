---
title:  Bots
summary: ""
sidebar: suite_sidebar
permalink: suite-bots.html
---

There are three different kinds of bots, sometimes called *algorithms* interchangeably:

* **Sensor Bots:** they extract raw data from external sources (*i.e.: exchanges, Twitter, etc.*) and store it in the system's standardized format for others to consume;

* **Indicator Bots:** they process available information that other bots may have generated to produce elaborate datasets for others to consume;

* **Trading Bot:** based on datasets exposed as products by other bots (counting sensors, indicators and even other trading bots), a trading bot applies the trading logic defined on a trading system to, on one side, generate a complete trading simulation (outputting datasets that include trades, the action of strategies, validation of conditions, etc.), and on the other side, manages the execution of orders when on a forward testing or live trading session.

What these different kinds of bots have in common is that they all create <a data-toggle="tooltip" data-original-title="{{site.data.concepts.data_product}}">data products</a> that others may consume. To do this, they run <a data-toggle="tooltip" data-original-title="{{site.data.concepts.process}}">processes</a> that produce and store *datasets*. That is, the product a bot creates may result in one or more datasets.

Each bot may have several processes, and processes don't necessarily have a one-to-one relationship with products. That is, a product can be the result of the work of one or more processes.

