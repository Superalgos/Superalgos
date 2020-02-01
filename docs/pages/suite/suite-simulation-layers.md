---
title:  Simulation Layers
summary: ""
sidebar: suite_sidebar
permalink: suite-simulation-layers.html
---

## Introduction

| Layers Manager |
| :---: |
| ![layer-manager](https://user-images.githubusercontent.com/13994516/67079737-00a86300-f194-11e9-85cb-2704afa30f04.png) |

The layers manager allows you to determine which visualization layers will be available at the Layers Panel to plot the results of testing sessions over the charts.

The layers manager and its offspring nodes must be visible in the Designer

Back on the charts, the following layers plot strategies' actions over the market data, providing a comprehensive set of visual clues showing how strategies would behave when trading.

> **NOTE:** The examples below illustrate the [*Weak-hands Buster*](https://github.com/Superalgos/Strategy-BTC-WeakHandsBuster) strategy, designed to sell BTC as prices start dropping and re-buy BTC as prices stabilize at a lower level.

## Simulation

The *Simulation* layer displays the actions of strategies throughout the tested period. Actions include the *take position event* and the management of *stop* and *take profit* in phases. By activating the Simulation layer you should be able to see something like this:

[![Simulation-Layers-01-Simulation-1](https://user-images.githubusercontent.com/13994516/67279788-040d5880-f4cc-11e9-9098-11496fac9c79.gif)](https://user-images.githubusercontent.com/13994516/67279788-040d5880-f4cc-11e9-9098-11496fac9c79.gif)

Notice Asset Balances in the bottom left corner of the screen. Asset A represents BTC while Asset B represents USDT.

[![Simulation-Layers-02-Simulation-2](https://user-images.githubusercontent.com/13994516/67279789-040d5880-f4cc-11e9-9124-9076273e6dfd.gif)](https://user-images.githubusercontent.com/13994516/67279789-040d5880-f4cc-11e9-9124-9076273e6dfd.gif)

> **NOTE:** For the time being, asset balances displayed on-screen correspond to the Simulation layer that was turned on last.

The dashed line represents the duration of the trade at the price of the _take position_ event. Notice how one asset is exchanged for the other asset at the take position event, and exchanged back as the trade closes.

[![Simulation-Layers-03-Simulation-3](https://user-images.githubusercontent.com/13994516/67279791-040d5880-f4cc-11e9-9cac-db42c419ca0c.gif)](https://user-images.githubusercontent.com/13994516/67279791-040d5880-f4cc-11e9-9cac-db42c419ca0c.gif)

Notice the green horizontal lines indicating the _take profit_ value for each period (candle). _Take profit_ is managed in _phases_, marked with the corresponding icons.

[![Simulation-Layers-04-Simulation-4](https://user-images.githubusercontent.com/13994516/67279792-040d5880-f4cc-11e9-8487-cf390d78da92.gif)](https://user-images.githubusercontent.com/13994516/67279792-040d5880-f4cc-11e9-8487-cf390d78da92.gif)

Notice the red horizontal lines indicating the _stop_ value for each period (candle). *Stop* is managed in _phases_ marked with the corresponding icons.

[![Simulation-Layers-05-Simulation-5](https://user-images.githubusercontent.com/13994516/67279793-04a5ef00-f4cc-11e9-8ac1-32e98762bf5b.gif)](https://user-images.githubusercontent.com/13994516/67279793-04a5ef00-f4cc-11e9-8ac1-32e98762bf5b.gif)

## Formulas and Conditions

The *Formulas and Conditions* layer helps identify which conditions are met at each candle. Notice how conditions are highlighted as the mouse pointer moves through different candles.

[![Simulation-Layers-06-Conditions](https://user-images.githubusercontent.com/13994516/67279794-04a5ef00-f4cc-11e9-9c53-cf5694701b50.gif)](https://user-images.githubusercontent.com/13994516/67279794-04a5ef00-f4cc-11e9-9c53-cf5694701b50.gif)

It also allows to track the value of each formula, for instance, those used to dynamically manage take profit in phases.

[![Simulation-Layers-07-Formulas](https://user-images.githubusercontent.com/13994516/67279796-053e8580-f4cc-11e9-8688-4fea62c1f40b.gif)](https://user-images.githubusercontent.com/13994516/67279796-053e8580-f4cc-11e9-8688-4fea62c1f40b.gif)

## Strategies

The *Strategies* layer identifies trigger on and trigger off events, signaling the activation and deactivation of strategies.

[![Simulation-Layers-08-Strategies](https://user-images.githubusercontent.com/13994516/67280186-dd035680-f4cc-11e9-82e8-e52706749f5a.gif)](https://user-images.githubusercontent.com/13994516/67280186-dd035680-f4cc-11e9-82e8-e52706749f5a.gif)

## Trades

The *Trades* layer marks trades with a triangle whose hypotenuse connects the price at the _take position_ event with the _exit_ price. When the trade is profitable, the triangle is green; when the _exit_ happens at a loss, the triangle is red.

[![Simulation-Layers-09-Trades](https://user-images.githubusercontent.com/13994516/67280187-dd9bed00-f4cc-11e9-93be-74b497d8f7b5.gif)](https://user-images.githubusercontent.com/13994516/67280187-dd9bed00-f4cc-11e9-93be-74b497d8f7b5.gif)