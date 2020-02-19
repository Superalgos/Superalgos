---
title:  Trade Live With an Open-Source Strategy
summary: ""
sidebar: suite_sidebar
permalink: suite-trade-live-with-an-open-source-strategy.html
---

Running a strategy as a fully automated bot to trade live is quite simple. Truth be told, your strategy running as a simulation is pretty much a trading bot already—only that orders don't go to the exchange.

If you are a crypto-holder, you are probably looking to trade live with an open-source strategy. If you are a trader, you are probably interested in seeing the system in action before you spend time learning it to build your own strategies.

Either way, to start trading live, follow these steps:

## Go to the Live Sessions Task Manager

| Task Manager | Task | Trading Bot | Process | Live Trading |
| :---: | :---: | :---: | :---: | :---: |
|![task](https://user-images.githubusercontent.com/13994516/66308205-ca9eef80-e906-11e9-8864-f7dba886bc7d.png) | ![timeline](https://user-images.githubusercontent.com/13994516/67079956-73b1d980-f194-11e9-89e0-9c8d1ea2ad1d.png) | ![trading-engine](https://user-images.githubusercontent.com/13994516/69948042-2f358f80-14ef-11ea-9193-f49eeb67b51c.png) | ![process](https://user-images.githubusercontent.com/13994516/67079738-00a86300-f194-11e9-9f59-a4cc4ce6d56c.png) | ![session-live-trading](https://user-images.githubusercontent.com/13994516/67090259-eed1ba80-f1a9-11e9-896a-a8320f3e3f40.png)  |


Hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>L</kbd> (*L* for *Live trading*) to go the the *Live Sessions* task manager. Find the live trading session for the desired strategy and click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the menu. 

[![Live-01-Session](https://user-images.githubusercontent.com/13994516/70344145-4c54c000-1859-11ea-950a-f1e96e3c8512.gif)](https://user-images.githubusercontent.com/13994516/70344145-4c54c000-1859-11ea-950a-f1e96e3c8512.gif)

## Configure Your Base Asset

| Parameters | Base Asset |
| :---: | :---: |
| ![parameters](https://user-images.githubusercontent.com/13994516/63508921-3f46d780-c4db-11e9-970d-8d5e2ca5ebe3.png) | ![base-asset](https://user-images.githubusercontent.com/13994516/63638431-0d26a880-c688-11e9-84f9-fa1fe5acbdbf.png) |

Click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the *parameters* menu, locate the *base asset* parameter and select *Edit Base Asset*.

[![Live-02-Asset](https://user-images.githubusercontent.com/13994516/70344147-4c54c000-1859-11ea-85b2-e0504bb0218d.gif)](https://user-images.githubusercontent.com/13994516/70344147-4c54c000-1859-11ea-85b2-e0504bb0218d.gif)

Your base asset contains the following piece of code, which you may configure to your own needs:

For Bull Run Rider:

```
{ 
"name": "USDT",
"initialBalance": 10,
"minimumBalance": 1,
"maximumBalance": 20000
}
```
For Weak Hands Buster:

```
{ 
"name": "BTC",
"initialBalance": 0.01,
"minimumBalance": 0.0001,
"maximumBalance": 100
}
```

| Variable | Description / Possible Values |
| --- | --- |
| name | USDT or BTC. The remaining fields in the configuration are denominated in this currency. |
| initialBalance | The amount of capital you wish to allocate to the whole trading system. The strategy will trade with the full amount of the *initialBalance* on the first trade. Subsequent trades will be sized with the full available balance, meaning that your earnings will be traded together with the initial capital. |
| minimumBalance | When your overall balance combined (USDT + BTC) reaches this value, all trading stops; think of this as a general safety switch. |
| maximumBalance | A similar concept as the minimumBalance, but on the higher side of the _initialBalance_. |

## Enter Your Exchange API Key

| Parameters | API Key |
| :---: | :---: |
| ![parameters](https://user-images.githubusercontent.com/13994516/63508921-3f46d780-c4db-11e9-970d-8d5e2ca5ebe3.png) | ![key](https://user-images.githubusercontent.com/13994516/70038709-fe219180-15b8-11ea-9b4f-1e8d3f558362.png) |

First thing is creating an *exchange account key* node using the *Add Key* option on the menu of the *parameters* of the live trading session.

Once you've got your API Key from the exchange (see instructions for [Poloniex](Poloniex-API-Keys)), you will enter the public key and secret in the *Exchange Account Key* node: 

Select *Confirgure Key Value* on the menu and replace the value of  *name* with your public key, and *secret* with the secret of your key.

[![API-Key-01](https://user-images.githubusercontent.com/13994516/71255383-12da8500-232e-11ea-8a51-7daadd210efb.gif)](https://user-images.githubusercontent.com/13994516/71255383-12da8500-232e-11ea-8a51-7daadd210efb.gif)

## Check Funds at the Exchange

Simply make sure that you have enough funds at the exchange. The system will handle the error gracefully if there are no funds, but you will miss the trading opportunity.

## Run the Task and Session

Go back to the task controlling the Live Trading Session, select *Run* on the menu. Then go to the *Live Trading* session and do the same. You are now trading live!

> **WARNING:** Superalgos is at a very early stage of development. As such, errors may occur at any point, including errors that can cause you to lose money. Make sure you test with small amounts of money, the kind you can afford losing. Also, make sure you understand the [Execution Limitations](Execution-Limitations). You are responsible for taking all precautions before starting trading live, but even if you do errors may occur. Trade at your own risk.

> **DISCLAIMER:** THIS IS NOT FINANCIAL ADVICE. ALTHOUGH THE STRATEGIES DISTRIBUTED WITH THE SUPERALGOS DESKTOP APP MAY BE FULLY FUNCTIONAL, WE DO NOT MAKE ANY EXPRESS OR IMPLIED RECOMMENDATION AS OF HOW YOU SHOULD USE THEM. WE SHARE STRATEGIES FOR EDUCATIONAL PURPOSES ONLY. TRADE AT YOUR OWN RISK.

## Trading with Both Strategies at the Same Time

You may easily trade live with both the Weak-hands Buster (BTC) and Bull-run Rider (USDT) strategies.

Simply make sure that you:

**1.** Configure both live trading sessions as per the instructions on point 2 above.

**2.** Obtain two sets of API Keys from the exchange and use each set on either session. The exchange does not allow multiple connections with the same API keys.

**3.** Check both assets (USDT and BTC) are available to trade with at the exchange.

Once you are set up, run the tasks corresponding to the two live trading sessions and run both sessions one after the other one.

## Following Live Trading on the Charts

To follow the live trading sessions on the charts, please refer to the [Live trading history layer](Live-Trading-History-Layer) page of this User Manual. We encourage you to keep learning about the system so that you may get the most out of it.