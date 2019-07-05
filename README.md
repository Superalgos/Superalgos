# Welcome to the Canvas App

The Canvas App provides a visual environment for the _Charting System_ and the _Strategy Designer_.

**Installation (for developers):** To install the Canvas App, you need to install AAWeb, following [this guide](https://github.com/Superalgos/AAWeb/blob/develop/README.md).

# Trading System Automation Demo

Use the latest Chrome version to [access the Demo](https://demo.superalgos.org), sign up, log in and click on the CHARTS link in the Menu.

![Access-Demo](https://user-images.githubusercontent.com/13994516/58415158-dbe50f00-807d-11e9-812c-3b4de503bc34.gif)
<br/><br/>
## Overview

The first time you access the _Charts_, you will see the following screen, split in half. The top half features the space used by the _Charting System_ and the bottom half features the _Strategy Designer_.

Use the control in the center of the turquoise bar to pull the bar up and down in order to make more room to either application. 

![Drag-Panels](https://user-images.githubusercontent.com/13994516/58413461-1ac49600-8079-11e9-9dd8-96f416e75b33.gif)
<br/><br/>
Pulling the bar to the very top of the screen causes the _Charting System_ to stop consuming resources in your local machine, and gives you an ample view of the _Strategy Designer_.

The **_Strategy Designer_** allows you to manage your _Trading System_. The structure represented by the various icons nested in a hierarchy of elements is the representation of the logic behind your _Strategies_.

![image](https://user-images.githubusercontent.com/13994516/58325421-f32bbe80-7e29-11e9-9478-9e6e4a02ae47.png)
<br/><br/>
Pulling the bar to the very bottom of the screen causes the _Strategy Designer_ to stop consuming resources from your local machine, and offers a full-screen view of the _Charting System_.

The **_Charting System_** plots indicators data along with the actions taken by the _Strategy Engine_ and the _Executor_, integrated with market data.

![image](https://user-images.githubusercontent.com/13994516/58325972-c37db600-7e2b-11e9-9aa2-9f6faaf8dd94.png)
<br/><br/>
The **_Superalgos Protocol_** (also refered to as the _protocol_) determines the structure in which all the information regarding a trading system is stored and—at the same time—provides a clear guidance on how traders using the various tools developed and distributed by the Superalgos Project shall create and automate their strategies.

> You don't really _need_ to know this, but for the sake of context...
>
> The **_Strategy Engine_** backtests and forward tests the instructions defined on its _protocol_ file input. In coordination with the _Strategy Executor_, the engine can also live trade.
>
>The **_Strategy Executor_** interprets the execution instructions embedded at a _protocol_ file. The instructions determine the type of order to use, and what to do in every possible situation that could emerge during the placement and management of exchange orders.

## Charts Interface

### Layers Panel

This panel includes different layers you may visualize by toggling them on and off with a single mouse clicks.
The layer title bar can have 3 possible background colors:

1. **Red**: layer is off.
2. **Green**: layer is on.
3. **Yellow**: layer is loading. If it stays yellow, it means it can't load fully.

![Layers](https://user-images.githubusercontent.com/13994516/58434206-c04c2980-80ba-11e9-964b-8223ad99eb0b.gif)
<br/><br/>
### Main Elements

Notice the following three elements relative to the position of the mouse pointer:

1. Above, the current datetime. This is the date and time at the mouse pointer position.
2. To the right, the current rate. This is the rate (in this case USDT per BTC) at the mouse pointer position.
3. Below, the current time period (or candle size if you wish). This is the currently displayed time period—not only for candles, but for any other object plotted across available layers.

### Mouse Wheel Operations

There are many things you can do with your mouse wheel. 

1. Scroll over the Layers Panel to access layers that may be out of reach downwards.
1. Scroll on top of or next to the datetime to produce a horizontal scaling.
1. Scroll on top of or next to the displayed rate to produce a vertical scaling.
1. Scroll on top of or next to the time period to change the time period to available values. 
1. Scroll elsewhere over the chart to zoom in and out. The App will not only zoom in and out of the chart, but also automatically adjust the time period to the most convenient one (for the current zoom level).

![Mouse-Wheel](https://user-images.githubusercontent.com/13994516/58434568-a01d6a00-80bc-11e9-9a58-3edd4852f07c.gif)
<br/><br/>
### Minimizing & Moving Floating Panels

To minimize a panel, click on the small triangle on the right of their title bar. This will automatically position the panel at the bottom of the screen. Clicking again restores the panel to its previous position.

You may also drag and drop the panels by right-clicking on the title bar.

![Panels](https://user-images.githubusercontent.com/13994516/58580610-d0e0d900-824d-11e9-8c57-501eb9429ba6.gif)
<br/><br/>
### Layers

Superalgos is an open system, meaning anyone can build layers for the _Charting System_. So far—with our current limited manpower—we have created 8 public layers (available without logging in) and 2 private layers (available to logged-in users):

#### Public Layers

1. **Candles**: Typical candlesticks.

![Candles](https://user-images.githubusercontent.com/13994516/58435905-1a50ed00-80c3-11e9-860a-bb4afc8e0f42.gif)
<br/><br/>
2. **Volumes**: I innovated a bit placing the buy volume at the bottom (in green), and the sell volume at the top (in red).

![Volumes](https://user-images.githubusercontent.com/13994516/58435907-1ae98380-80c3-11e9-90e5-de9052b166c4.gif)
<br/><br/>

3. **Candle Stairs Patterns**: This is an unusual pattern proving any dataset may be plotted on the charts (and by extension, that anything can be added to the system). A Stair Pattern is defined as a set of candles going in the same direction, either up or down. You can think of these patterns as "Candle Channels", as they represent channels with an up or down direction based on underlying candles direction.

![Candle-Stairs](https://user-images.githubusercontent.com/13994516/58435906-1ae98380-80c3-11e9-893e-1f8cd1b5c925.gif)
<br/><br/>
4. **Volume Stairs Patterns**: A similar concept, this time with volumes. Whenever a sequence of volume bars is found where each one is bigger than the previous one, they are bundled together in a "Stair". The same applies when they are going down (the next is smaller than the previous one). For a trading bot, this serves to identify if sell or buy volumes are raising or declining, if any.

![Volume-Stairs](https://user-images.githubusercontent.com/13994516/58435908-1ae98380-80c3-11e9-8c0d-87a105b4e021.gif)
<br/><br/>
5. **Bollinger Bands**: This is the traditional [Bollinger Bands indicator](https://en.wikipedia.org/wiki/Bollinger_Bands). Bollinger Bands have a moving average, in our case calculated with the last 20 periods (the line in the middle of the bands). We are plotting the moving average with one color when it is going up, and with a different color when it's going down. The upper band is at 2 Standard Deviations from the center, pretty much like the lower band, also at 2 Standard Deviations. These are the most widely used Bollinger Bands settings.

![Bollinger-Bands](https://user-images.githubusercontent.com/13994516/58435901-1a50ed00-80c3-11e9-853a-68d39ba7958b.gif)
<br/><br/>
6. **Percentage Bandwidth or %B**: This is a well-known indicator that derives from the Bollinger Bands. In a nutshell it tells you how close the price is either to the upper band or the lower band at any point in time. When the price is in the middle of the bands (it is calculated with the close value of each candle), then %B is in the middle of its chart, at value 50. When the price touches the upper band, then %B is at 100, and finally when the price is at the lower band, then %B is at 0. 

![Bollinger-Bands-Percentage-Bandwidth](https://user-images.githubusercontent.com/13994516/58435903-1a50ed00-80c3-11e9-90d5-e0d5293c76ad.gif)
<br/><br/>
The chart features lines at %B value 30 and 70 since those are the most common values for traders to forecast when a reversal may happen. In our chart, %B is the one represented at #1. I've found useful to add a moving average in order to smooth volatility a bit, and to be able to ask—at any time—if it is going up or down. The moving average calculated with the last 5 %B values is plotted as line #2. Finally I also added a property called Bandwidth, which represents the separation of the upper band from the lower band. It is a measure of the volatility and is plotted at #3.  

![image](https://user-images.githubusercontent.com/9479367/56834223-1c7c1d80-6871-11e9-9687-ae5dc12d0336.png)
<br/><br/>
7. **Bollinger Channels**: This is a non-standard indicator derived from the Bollinger Bands. These types of channels are calculated using the Bollinger Bands moving average. Essentially an upward channel begins when the moving average turns from going down to going up, and the channel finishes when it turns from going up to down. A downward channel starts when the Bollinger Band moving average turns from going up to down, and it finishes when it starts going up again. Upward channels are plotted in green, while downward channels in red. Additional information can be found at the indicator's panel, like the number of periods contained at the channel.

![Bollinger-Channels](https://user-images.githubusercontent.com/13994516/58497359-146b1280-817c-11e9-9f4d-99fee41cd27f.gif)
<br/><br/>
8. **Bollinger Sub-Channels**: If we consider that one Bollinger Channel can have sub-channels with the same direction (up or down) but different slopes, then we get to the concept of Bollinger Sub-Channels. The most important property of a sub-channel is its slope. The possible values are: side, gentle, medium, high and extreme. With this information, a trading bot could easily ask if it is in a sub-channel with a certain slope and for how many periods. 

![Bollinger-Sub-Channels](https://user-images.githubusercontent.com/13994516/58497358-146b1280-817c-11e9-83df-219d0fffa9f0.gif)
<br/><br/>
#### Private Layers

1. **Trading Simulation**: The Trading Simulation layer displays a backtest + fordwardtest (paper trading) of whatever strategies you have created in the system. At sign up, you are provided with an initial set of strategies so that you can be up and running as quickly as possible. By activating the Trading Simulation layer you should be able to see something like this:

![Trading-Simulation](https://user-images.githubusercontent.com/13994516/58564550-6c158680-822d-11e9-8bb1-102912d4bfd0.gif)
<br/><br/>
Notice Asset Balances in the bottom left corner of the screen. Asset A is your _base asset_.

![Trading-Simulation-Asset-Balances](https://user-images.githubusercontent.com/13994516/58564447-3e304200-822d-11e9-9e90-e4f02212de5a.gif)
<br/><br/>
The dashed line represents the duration of the trade at the price of the _take position_ event. Notice how the _base asset_ is exchanged for Asset B and back to the _base asset_ as the trade closes.

![Trading-Simulation-Trade-Duration](https://user-images.githubusercontent.com/13994516/58564452-3ec8d880-822d-11e9-8b4e-4cd892df69e7.gif)
<br/><br/>
Notice the green horizontal bars indicating the _take profit_ value for each period (candle). _Take profit_ is managed in _phases_, marked with the corresponding icons.

![Trading-Simulation-Take-Profit](https://user-images.githubusercontent.com/13994516/58564451-3ec8d880-822d-11e9-84c4-7e2147018297.gif)
<br/><br/>
Notice the red horizontal bars indicating the _stop_ value for each period (candle). Stop is managed in _phases_, marked with the corresponding icons.

![Trading-Simulation-Stop](https://user-images.githubusercontent.com/13994516/58564450-3e304200-822d-11e9-8281-cc4b9cc22746.gif)
<br/><br/>
2. **Trading Conditions**: The Trading Conditions layer helps identify which _conditions_ are met at each candle. Notice how _conditions_ are highlighted as the cursor moves through different candles.

![Trading-Simulation-Conditions](https://user-images.githubusercontent.com/13994516/58564448-3e304200-822d-11e9-967b-8c74fb8532fe.gif)
<br/><br/>
3. **Simulation Strategies**: The Simulation Strategies layer identifies trigger on and trigger off events, signaling the activation and deactivation of strategies.

![Trading-Simulation-Strategies](https://user-images.githubusercontent.com/13994516/58565955-fd85f800-822f-11e9-9f95-9d0a477a4460.gif)
<br/><br/>
4. **Simulation Trades**: The Simulation Trades layer marks trades with a triangle whose hypotenuse connects the price at the _take position_ event with the _exit_ price. When the trade is profitable, the triangle is green; when the _exit_ happens at a loss, the triangle is red.

![Trading-Simulation-Trades](https://user-images.githubusercontent.com/13994516/58574801-1a76f700-8241-11e9-9144-0db81636dace.gif)
<br/><br/>

## Strategy Designer

The Strategy Designer organizes strategies following the framework established by the _Superalgos Protocol_. If you are not familiar with the protocol, please read either of the following articles:

* Superalgos Protocol V0.1 - the Short Version, for Experienced Traders.

* Superalgos Protocol V0.1 - the Long Version, for Beginner Traders.

The Strategy Designer provides a Graphic User Interface for traders to input the rules and _formulas_ that determine the behaviour of the strategy. Overall, traders need to define the rules to _trigger on_ and _trigger off_ the strategy, to _take a position_, to manage _take profit_ targets and _stop loss_.

The protocol calls any set of rules a _situation_, in the sense that you are trying to determine what is going on with the market and if the 'situation' is right, certain _actions_ or _events_ should be triggered.

In other words, you define _situations_ in which you wish a certain _event_ to happen (i.e.: trigger on the strategy, take a position, etc.) and each situation is described as a set of _conditions_ that need to be met in order for the _event_ to be triggered.

When all _conditions_ within a _situation_ evaluate _true_, then the _situation_ evaluates _true_.

Events may be triggered in different situations, meaning that you are free to define different _situations_ upon which the event would be triggered. In such case, when any of the _situations_ evaluate _true_, then the event shall be triggered.

In order to define _conditions_ you will create _statements_ using any of the available _variables_ that describe what is happening with the market. Remember, _conditions_ need to evaluate either _true_ or _false_.

**For example:**

Situation 1

  Condition A: candle.close > bollingerBand.MovingAverage
  Condition B: candle.previous.max > bollingerBand.MovingAverage
  
In the example above, conditions A and B are mathematical comparison statements that may evaluate either _true_ or _false_. In the case both would evaluate _true_ then Situation 1 would be true.

### Available Variables

#### Candles

**candle.min:** 
**candle.max:** 
**candle.open:** 
**candle.close:** 
**candle.begin:** 
**candle.end:** 
**candle.direction (Down | Up | Side):** 
**candle.previous:** 

Bollinger Band

**bollingerBand.begin:** 
**bollingerBand.end:** 
**bollingerBand.movingAverage:** 
**bollingerBand.standardDeviation:** 
**bollingerBand.deviation:** 
**bollingerBand.direction (Down | Up | Side):** 
**bollingerBand.previous:** 

Percentage Bandwidth

**percentageBandwidth.begin:** 
**percentageBandwidth.end:** 
**percentageBandwidth.value:** 
**percentageBandwidth.movingAverage:** 
**percentageBandwidth.bandwith:** 
**percentageBandwidth.direction (Down | Up | Side):** 
**percentageBandwidth.previous:** 

Bollinger Channels

**bollingerChannel.begin:** 
**bollingerChannel.end:** 
**bollingerChannel.direction (Down | Up | Side):** 
**bollingerChannel.period:** 
**bollingerChannel.firstMovingAverage:** 
**bollingerChannel.lastMovingAverage:** 
**bollingerChannel.firstDeviation:** 
**bollingerChannel.lastDeviation:** 
**bollingerChannel.previous:** 

Bollinger SubChannels

**bollingerSubChannel.begin:** 
**bollingerSubChannel.end:** 
**bollingerSubChannel.direction (Down | Up | Side):** 
**bollingerSubChannel.slope (Steep | Medium | Gentle | Side):** 
**bollingerSubChannel.period:** 
**bollingerSubChannel.firstMovingAverage:** 
**bollingerSubChannel.lastMovingAverage:** 
**bollingerSubChannel.firstDeviation:** 
**bollingerSubChannel.lastDeviation:** 
**bollingerSubChannel.previous:** 

Internal

**strategyStage (No Stage | Trigger Stage | Open Stage | Manage Stage | Close Stage):** 

**stopLoss:** 
**stopLossPhase (0 | 1 | ...):** 

**takeProfit:** 
**takeProfitPhase:** 

**positionRate:** 
**positionSize:** 
**positionInstant:** 

**balanceAssetA:** 
**balanceAssetB:** 

**lastTradeProfitLoss:** 
**lastTradeROI:** 

**profit:** 
**roundtrips:** 
**fails:** 
**hits:** 
**periods:** 


