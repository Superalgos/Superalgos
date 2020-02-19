---
title:  Overview
summary: ""
sidebar: suite_sidebar
permalink: suite-live-trading-overview.html
---

Once you are happy with your strategy after extensive backtesting and paper-trading sessions, running it as a fully automated bot to trade live is quite simple. Truth be told, your strategy running as a simulation is pretty much a trading bot already—only that orders don't go to the exchange.

| Forward Testing | Live Trading |
| :---: | :---: |
| ![session-forward-testing](https://user-images.githubusercontent.com/13994516/67090258-eed1ba80-f1a9-11e9-9b00-d281d50d6eff.png) | ![session-live-trading](https://user-images.githubusercontent.com/13994516/67090259-eed1ba80-f1a9-11e9-896a-a8320f3e3f40.png) |

It is recommended to forward test your strategy before committing serious capital to live-trading. Forward testing is usually the final testing phase before going live. It involves placing orders at the exchange for a fraction of the capital that you intend to use when trading live, and that is actually the only difference between a forward testing session and a live trading session.

Forward testing sessions and live trading sessions need to be configured under their corresponding tasks, pretty much like was explained for backtesting and paper-trading sessions, with a few minor nuances:

**1. Datetime Range**

Like with paper trading sessions, you only require a *finalDatetime*. If you do not set one either at the level of the session or the trading system then the session will run for one year.

```
{
"finalDatetime": "2020-12-31T23:59:99.999Z"
}
```

> **NOTE:** The *Exchange Rate* and *Slippage* parameters do not affect forward testing or live trading. However, those parameters are taken into account when creating simulation layers, which are also available during forward-testing and live-trading.

**2. Forward Testing Session Configuration**

In the case of forward testing you will want to configure what is the percentage of your balance that you wish to use for testing. You do this by clicking the *Edit Session* option on the session's menu and entering the desired value in the code snippet:

```
{"balancePercentage": 1}
```
[![Live-Trading-02-Forward-Testing-Config](https://user-images.githubusercontent.com/13994516/67281056-e42b6400-f4ce-11e9-9f95-2a17b20db0c5.gif)](https://user-images.githubusercontent.com/13994516/67281056-e42b6400-f4ce-11e9-9f95-2a17b20db0c5.gif)

The number you enter is applied as a percentage of *balanceAssetA* or *balanceAssetB* (for BTC and USDT-based strategies respectively) to obtain the forward-testing balance that will be available to the *positionSize* formula you defined on the [Open Stage](#open-stage) of the strategy.

For instance, ```"balancePercentage": 1``` means that 1% of your balance will be made available.

Let's draw a quick example:

Your base asset is USDT and your *initialBalance* is USDT 10,000.

If you set up your forward-testing session with ```"balancePercentage": 1```, then USDT 10,000 * 1% = **USDT 100**. This is the balance that will be available to your forward-testing session.

> **NOTE:** You need to take this into account at the time of defining your *positionSize* formula. If the formula is a constant, you may easily run out of balance, as only a fraction of the balance will be available for the strategy to use. It may be a good idea to set up your *positionSize* as a function of your available balance instead.

Just like the balance is scaled down, the *minimumBalance* and *maximumBalance* are also scaled down accordingly.