---
title:  Multiple Live Trading Sessions
summary: ""
sidebar: suite_sidebar
permalink: suite-multiple-forward-testing-and-live-trading-sessions.html
---

The platform allows running multiple forward testing and live trading sessions at the same time. This enables trading with multiple trading systems, from within the same instance of the platform.

The one thing you need to be aware of is that—due to restrictions on API use imposed by exchanges—you may not use the same exchange API key with different processes.

If you ever need to create a new trading session, you will create a copy of an existing one by cloning the whole task. Once you drop the clone back on the Designer, the new task will have all of the nodes required for trading, including an *exchange account key*. 

Just make sure you don't use the same key on more than one session: you need to get a new API key from the exchange and edit the *exchange account key** accordingly.

> **NOTE:** If you don't specify which API Key to use at the session level, the platform's fallback mechanism will look for an API Key at the level of the parameters of the trading system. If more than one forward testing or live trading session ends up using the same API Key, you should expect errors to occur.

Also, make sure the new process instance is referencing Jason's Multi-Period process definition, and the actual session is referencing the definition you intend to run the session on. Follow the same procedure as you would for new testing sessions, as described in the [Advanced backtesting](Advanced-Backtesting) page.