---
title:  What to Expect
summary: "The Superalgos Suite is in beta stage, still under development. Check the website for details on features and functionality."
sidebar: suite_sidebar
permalink: suite-what-to-expect.html
---

## Open Beta Stage

Superalgos is in an open beta-stage, still under development. The early-stage pre-release intends to gather feedback from early adopters, who may help shape the software and evolve it into a robust product. We try our best to make installation and operation easy, but at this point, the system is directed at tech-savvy individuals with a knack for learning a few PC operator tricks while installing and using the system.

If you don't consider yourself an early adopter and usually go to your 10-year-old for advice on using your PC, you may still give it a shot. Developers and users in the <a href="https://t.me/superalgoscommunity" rel="nofollow" rel="noopener" target="_blank">Community</a> will be happy to give you a hand and help you get up and running.

## About the System

What you will get is a client application that runs entirely on users' machines. This is to fulfill the design principle of a trustless deployment: you don't need to trust any third party with your strategies, exchange API keys, personal information, or funds.

There is a thorough description of system features and functionality [on the website](https://superalgos.org/).

## Data in Your Machine

Traders rely on datasets for backtesting. The system retrieves raw trades data directly from exchanges and processes data to produce candles and  indicators, which are stored in your local machine.

The volume of trades data generated at exchanges is significant. Exchanges APIs impose limits on the bandwidth of data you may retrieve from your machine per unit of time. Different exchanges have different transaction volumes, and imposse different limits.

For those reasons, retrieving historic data takes considerably different times on each exchange. For example, retrieving the USDT-BTC market for the whole of 2019 from Poloniex may take three to four hours. The same period for Bitmex may take double or more.

A third factor affecting data-retrieval times and initial candles-processing is the computational power of your machine. Check the [system requirements](suite-system-requirements.html) for more details in this regard.

## Supported Exchanges

For a list of supported exchanges, please refer to the <a href="https://github.com/Superalgos/Superalgos/blob/develop/README.md" rel="nofollow" rel="noopener" target="_blank">develop branch README file</a>. 

The system implements the <a href="https://github.com/ccxt/ccxt/" rel="nofollow" rel="noopener" target="_blank">CCXT library</a>, which allows connecting to a <a href="https://github.com/ccxt/ccxt/wiki/Exchange-Markets" rel="nofollow" rel="noopener" target="_blank">vast list of exchanges</a>. 

You are free to try exchanges that haven't been tested by the team. We'd be happy to hear about your tests.

## Feedback

We value highly all feedback. We are listening and actively participating in the various Superalgos Telegram groups.

We keep a wish list for new features in the form of <a href="https://github.com/Superalgos/Platform/issues" rel="nofollow" rel="noopener" target="_blank">issues in the Superalgos repository</a>. If you are missing a key feature, feel free to open an issue using the ```improvement``` label.

However, bear in mind that the system is at an early stage of development and that the current priority is the stabilization and delivery of core functionality.

