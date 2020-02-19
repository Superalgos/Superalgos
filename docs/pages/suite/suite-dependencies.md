---
title:  Dependencies
summary: ""
sidebar: suite_sidebar
permalink: suite-dependencies.html
---

We established that bots produce products for others to consume. _Others_ include other algorithms, meaning that bots usually depend on the datasets produced by other bots. We call these _data dependencies_.

Bots consume their own status report and they might as well consume status reports from other algorithms. We call these _status dependencies_. 

There are three types of *status dependencies*:

* *Self Reference* is the status dependency a process establishes with its own status report so as to learn what was done in the previous run.

* *Market Starting Point* is the status dependency a process may establish with another bot's status report to learn what is the date time of the begining of the market.

* *Market Ending Point* is a similar concept as the *market starting point* only that the goal is to learn how far the bot producing the input dataset (the data dependency) has processed so far.

The declaration of such dependencies is what allows bots to add value over the product of other bots, generating new, more elaborate products by further processing datasets that other bots have created.

As you may figure, the possibilities are endless when you have the power to combine information from different sources, produce an analysis on top of that information, and store the new information separately to be consumed by other bots, including the trading bot, through the trading logic behind strategies.

Let's go through the dependencies existing among the current set of bots shipped with the system...

## Charly

Charly is a _sensor bot_. He gets both historic and live trades data from exchanges and assures consistency using recursive processes before storing it in a highly fragmented and usable dataset.

Charly has three different processes: Live-Trades, Historic-Trades, and Hole-Fixing. These three processes combined create the one Charly product: Trades, stored in a single dataset.

The dataset is stored under the _minutes_ file structure. This structure is very efficient to store large amounts of data the is to be consumed in one-minute chunks by another bot, as you will soon learn.

The process *Historic-Trades* provides the information about the starting point of the market to all other bots. It's logical, as Charly is the only bot in contact with the exchange.

## Bruce

Now, let's see what Bruce, an *indicator bot*, does with Charly's product. Bruce offers two products, *Candles* and *Volumes*, stored in two datasets: candles at 1-minute resolution and volumes at 1-minute resolution. The datasets are stored under the _daily file_ type of dataset.

Can you guess what is Bruce's data dependency? That's right! Bruce depends on Charly's product. 

Bruce takes the trades data that Charly extracted from the exchange in intervals of one minute, and processes it as follows:

* finds the first and last trades to come up with the open and close values,

* goes over all trades to extract minimum and maximum values, 

* agregates buy and sell trades volume, 

With that information Bruce builds a dataset of 1-minute candles and 1-minute volumes, each of them stored under the _daily file_ structure.

Notice how Charly storing 1-minute files makes Bruce's work straightforward. Bruce needs to load a single file that contains all the data it needs to build each 1-minute candle and 1-minute volume.

In other words, Bruce is adding value to Charly's product and offering a new value-added product of his own. But the value-adding chain does not stop there...

## Olivia

Let's take a look at another indicator, Olivia. She offers four different products: candles at sub-hour resolutions, candles in resolutions above one hour, volumes in sub-hour resolutions and volumes in resolutions above one hour. 

And guess what? Indeed, Olivia uses Bruce's 1-minute candles and 1-minute volumes to produce complementary candles and volumes at different resolutions.

As a result, Olivia stores data in two different types of datasets: *daily files* for resolutions below one hour and *market files* for resolutions of one hour and above. 

From this point and onwards, all bots processing Olivia's products and subsequent derivatives will likely store data in the same two types of datasets, so as to maintain the most efficient possible data structures to serve the intended purposes.

## Tom

Tom uses candles from Bruce and Olivia to produce the candle-stairs pattern indicator.

## Chris

Chris uses Olivia's candles to produce the Bollinger Bands indicator.

## Paula

Paula uses Chris' Bollinger Bands dataset to build the Bollinger Channel and Bollinger SubChannel indicators.

## Jason

The last link in the chain usually comes in the form of user strategies handled by the trading bot, Jason—consuming data from indicators to make trading decisions.

Of course, the main goal of a strategy is to perform profitable trading. However, notice that Jason has outputs too: Simulations, Formulas & Conditions, Trades, Strategies and Live are products that Jason exposes so that the Trading Simulation Plotter may create a visual representation of strategies' actions over the charts.