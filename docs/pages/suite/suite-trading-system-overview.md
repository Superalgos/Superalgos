---
title:  Overview
summary: ""
sidebar: suite_sidebar
permalink: suite-trading-system-overview.html
---

| Definition | Trading System |
| :---: | :---: |
| ![definition](https://user-images.githubusercontent.com/13994516/70050815-236dca00-15d0-11ea-9c8d-304edd640c8d.png) | ![trading-system](https://user-images.githubusercontent.com/13994516/70053113-07205c00-15d5-11ea-9618-819cf2e5a0e9.png) |

A *trading system* is a collection of strategies that conform to certain *parameters*.

The trading system organizes the workflow to build strategies following the framework implemented by the _Superalgos Trading Protocol_. If you are not familiar with the protocol, please read either of the following articles:

* [Superalgos Trading Protocol V0.1 - the Short Version, for Experienced Traders](https://medium.com/superalgos/superalgos-protocol-v0-1-the-short-version-for-experienced-traders-86c3fa43f1c0).

* [Superalgos Trading Protocol V0.1 - the Long Version, for Beginner Traders](https://medium.com/superalgos/superalgos-protocol-v0-1-the-long-version-for-beginner-traders-f293f1cc6c13).

> **NOTE**: The articles above are instrumental in understanding the framework that will guide you through the process of creating strategies. The framework is not explained in this guide, therefore, we recommend you go through the article before starting work on your own strategies.

## Parameters

Parameters are both a property of the trading system and of the testing and live trading sessions that engage with the trading system.

Precedence lies with the parameters defined at the level of the sessions. The platform implements a fallback mechanism by which, in case a certain parameter is not found at the level of the session, the information is retrieved from the trading system.

The one parameter that needs to be defined early on is the *base asset*, that is, the side of the market you wish to stand on when you are out of the trade, with no open positions. We will review the rest of the trading system parameters later on when discussing testing and live trading sessions.

| Parameters  | Base Asset |
| :---: | :---: |
| ![parameters](https://user-images.githubusercontent.com/13994516/63508921-3f46d780-c4db-11e9-970d-8d5e2ca5ebe3.png) | ![base-asset](https://user-images.githubusercontent.com/13994516/63638431-0d26a880-c688-11e9-84f9-fa1fe5acbdbf.png) |

Your Base Asset formula contains the following piece of code, which you may configure to your own needs:

```
{ 
"name": "USDT",
"initialBalance": 10,
"minimumBalance": 1,
"maximumBalance": 20000
}
```

| Variable | Description / Possible Values |
| --- | --- |
| name | USDT or BTC |
| initialBalance | The amount of capital you wish to allocate to the whole trading system. |
| minimumBalance | When your overall balance combined (balanceAssetA + balanceAssetB) reaches this value, all trading stops; think of this a general safety switch. |
| maximumBalance | A similar concept as the minimumBalance, but on the higher side of the _initialBalance_. |

> **NOTE**: All strategies contained within a trading system share these parameters. In other words, all strategies within the same trading system have the same base asset and share the initial balance.

Only one trading system is allowed at a time per each definition. If you wish to have more than one trading system, then you will create a new definition to hold the new trading system. This means that if you wish to have strategies with different base assets, you will need to create them within different trading systems, which will live in different definitions.
