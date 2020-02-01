---
title:  What to Expect
summary: "The Superalgos Suite is in beta stage, still under development. Check the website for details on features and functionality."
sidebar: suite_sidebar
permalink: suite-what-to-expect.html
---

Superalgos is pre-releasing an early beta-stage version of the Superalgos Platform in the hope that early adopters will help us shape the software and evolve it into a robust product. We try our best to make installation and operation easy, but at this point, the platform is directed at tech-savvy individuals with a knack for learning a few PC operator tricks while installing and using the platform.

If you don't consider yourself an early adopter and usually go to your 10-year-old for advice on using your PC, you may still give it a shot. Developers and users in the [Community](https://t.me/superalgoscommunity) will be happy to give you a hand and help you get up and running.

## About the Platform

What you will get is a client application that runs entirely on users' machines. This is to fulfill the design principle of a trustless deployment: you don't need to trust any third party with your strategies, exchange API keys, personal information, or funds.

If you haven't seen it yet, there is a thorough description of the platform including introduction videos [on the website](https://superalgos.org/tools-superalgos-platform.shtml).

## A Rather Big Download

Traders rely on datasets for backtesting. The platform retrieves raw trades data directly from exchanges and processes data to produce candles and a few indicators, which are stored in your local machine.

The volume of trades data generated at exchanges is massive. Exchanges APIs impose limits on the bandwidth of data you may retrieve from your machine per unit of time. To save you from spending days or weeks running processes to retrieve the data you will need for backtesting, we include historic market data in our releases.

This has a small non-monetary cost associated: the zip files you will download are a bit heavy and highly compressed. As a result, it may take 30 to 60 minutes for your machine to decompress the files. Also, a second small cost is that this adds a step in the process to fire up the platform the first time.

## Poloniex Only as a Temporary Limitation

Because the platform is still at an early stage of development, we limit the use of data and trading to a single exchange: Poloniex. Once the core infrastructure is sufficiently developed and stabilized, we plan to implement the [CCXT library](https://github.com/ccxt/ccxt/) to enable access to [a vast list of exchanges](https://github.com/ccxt/ccxt/wiki/Exchange-Markets). We expect this to happen in Q1 2021.

The choice of Poloniex as the first exchange was purely circumstantial: Poloniex was the number one exchange in the world when the Superalgos Project was born, back in the summer of 2017.

## Feedback

We value highly all feedback. We are listening and actively participating in the various Superalgos Telegram groups.

We keep a wish list for new features in the form of [issues in this repository](https://github.com/Superalgos/Platform/issues). If you are missing a key feature, feel free to open an issue using the ```improvement``` label.

However, bear in mind that the platform is at an early stage of development and that the current priority is stabilization and delivery of core functionality.

