# Superalgos Desktop App Documentation

The Superalgos Desktop App is the client application of the Superalgos Platform suite, and provides a visual environment for developing and automating trading strategies.

This is a pre-release in alpha stage. The app is still under heavy development. We appreciate your help testing the app and reporting any errors you may experience.

# Table of Contents

* [Before You Begin](#before-you-begin)
* [Installing / Running the App](#installing--running-the-app)
* [Overview](#overview)
* [Charts Interface](#charts-interface)
  * [Layers Panel](#layers-panel)
  * [Main Elements](#main-elements)
  * [Mouse Wheel Operations](#mouse-wheel-operations)
  * [Floating Panels](#floating-panels)
  * [Layers](#layers)
    * [Indicator Layers](#indicator-layers)
      * [Candles](#candles)
      * [Volumes](#volumes)
      * [Candle Stairs Patterns](#candle-stairs-patterns)
      * [Volume Stairs Patterns](#volume-stairs-patterns)
      * [Bollinger Bands](#bollinger-bands)
      * [Percentage Bandwidth (%B)](#percentage-bandwidth-b)
      * [Bollinger Channels](#bollinger-channels)
      * [Bollinger Sub-Channels](#bollinger-sub-channels)
* [Designer](#designer)
  * [Workspace](#workspace)
  * [Interface](#interface)
    * [Element's Menu](#elements-menu)
    * [Detachment and Attachment of Elements](#detachment-and-attachment-of-elements)
  * [Trading System](#trading-system)
  * [Working with Strategies](#working-with-strategies)
    * [Situations and Conditions](#situations-and-conditions)
      * [Comparison and Logical Operators](#comparison-and-logical-operators)
    * [Starting a Strategy from Scratch](#starting-a-strategy-from-scratch)
    * [Using an Existing Strategy](#using-an-existing-strategy)
  * [Available Variables](#available-variables)
    * [Ticker](#ticker)
    * [Candles](#candles)
    * [Bollinger Band](#bollinger-band)
    * [Percentage Bandwidth](#percentage-bandwidth)
    * [Bollinger Channels](#bollinger-channels)
    * [Bollinger SubChannels](#bollinger-subchannels)
    * [Internal](#internal)
* [Simulation](#simulation)
  * [Running the First Simulation](#running-the-first-simulation)
  * [Simulation Datetime Range](#simulation-datetime-range)
  * [Simulation Time Period](#simulation-time-period)
  * [Simulation Processes](#simulation-processes)
  * [Simulation Layers](#simulation-layers)
    * [Trading Simulation](#trading-simulation)
    * [Simulation Conditions](#simulation-conditions)
    * [Simulation Strategies](#simulation-strategies)
    * [Simulation Trades](#simulation-trades)
* [Live Trading](#live-trading)
  * [Getting Started](#getting-started)
  * [Live Trading Process](#live-trading-process)
  * [Live Trading History Layer](#live-trading-history-layer)
  * [Poloniex API Keys](#poloniex-api-keys)
* [Troubleshooting](#troubleshooting)
  * [On-screen Errors and Warnings](#on-screen-errors-and-warnings)
  * [Market Data / Indicators Seem to be Outdated](#market-data--indicators-seem-to-be-outdated)
  * [New Simulation Doesn't Seem to Match My New Settings](#new-simulation-doesnt-seem-to-match-my-new-settings)
* [Reporting Bugs](#reporting-bugs)
* [Maintainer](#maintainer)

# Before You Begin

The following recommendations may make your life easier using this pre-release in alpha stage:

* Only the latest version of Chrome is being tested at the moment. We highly recommend you use Chrome to run the app, so that you have a similar environment as developers in case you need help. 

* You may need a decent Console / Command Line application for similar reasons: we hope you won't need it, but in case you do, it may save you lots of hassle and make a difference troubleshooting and getting help from the community. We recommend [Console Emulator Cmder](https://cmder.net/).

> Bear in mind that the app evolves fast. We do our best to keep this README up to date, however, some of the images illustrating these explanations may defer from what you will find in the app.

> WARNING: The Superalgos Desktop App is at a very early stage of development. As such, errors may occur at any point, including errors that can cause you to lose money. You are responsible for taking all precautions before starting trading live. Make sure you test with small amounts of money, the kind you can afford losing. Trade live at your own risk.

# Installing / Running the App

**1. Download the multi-part ZIP file**:

Go to [releases](https://github.com/Superalgos/DesktopApp/releases), find the latest release and download all of the multi-part files with a ZIP extension.

**2. Extract the ZIP files**: 

Right-click on the first multi-part ZIP file and extract / unpack the files. The ZIP files include highly-compressed complete historic market data. Expect decompression to take from 4 to 8 hours, depending on your system (decompressing overnight may be a good idea, as your drive will be quite busy for some time, potentially slowing down your system).

**Next Steps on Windows Systems**:

**3. Run the App**: 

Double click on AAWEB\Windows-Superalgos-Desktop.exe

Two things will happen:

  * Your default console / command line app will open and display some information. Do not close your console or stop the processes running for as long as you are using the app.

  * The app will load on your default browser. You should either [set Chrome as your default browser](https://support.google.com/chrome/answer/95417?co=GENIE.Platform%3DDesktop&hl=en) before executing the EXE file, or simply close the non-Chrome browser, open Chrome and go to http://localhost:1337/.

**Next Steps on Non-Windows Systems**:

**3. Run your web server**: 

Open your console / command line app and go to directory AAWEB (a folder in the root of the zip files your previously decompressed); assuming you are starting the console from the root directory of the app, the command to access AAWEB is:

```
cd AAWEB
```

Once inside AAWeb, continue with this command:

```
node server.js
```

The app will load on your default browser. You should either [set Chrome as your default browser](https://support.google.com/chrome/answer/95417?co=GENIE.Platform%3DDesktop&hl=en) before executing the EXE file, or simply close the non-Chrome browser, open Chrome and go to http://localhost:1337/.

**Final Steps**:

**4. Start indicators**: 

Click the RESTART BOTS button on the right-hand side of the horizontal turquoise bar. This puts all indicator bots to run. Allow some time for the bots to catch up with building candles and the rest of indicators up to the present time (the ZIP files you downloaded contains data files up to a certain point in time). After a few minutes, refresh the layers in the [Layers Panel](#layers-panel) as explained below.

That's it! You are up and running!

# Overview

The first time you run the app, you will see the following screen, split in half. The top half features the space used by the _Charting System_ and the bottom half features the _Designer_.

Use the control in the center of the turquoise bar to pull the bar up and down in order to make more room to either application. 

![Drag-Panels](https://user-images.githubusercontent.com/13994516/58413461-1ac49600-8079-11e9-9dd8-96f416e75b33.gif)
<br/><br/>
Pulling the bar to the very top of the screen causes the _Charting System_ to stop consuming resources in your local machine, and gives you an ample view of the _Designer_.

The **_Designer_** allows you to manage your _Trading System_. The structure represented by the various icons nested in a hierarchy of elements is the representation of the logic behind your _Strategies_.

![image](https://user-images.githubusercontent.com/13994516/58325421-f32bbe80-7e29-11e9-9478-9e6e4a02ae47.png)
<br/><br/>
Pulling the bar to the very bottom of the screen causes the _Designer_ to stop consuming resources from your local machine, and offers a full-screen view of the _Charting System_.

The **_Charting System_** plots indicators data along with the actions taken by the _Strategy Engine_ and the _Executor_, integrated with market data.

![image](https://user-images.githubusercontent.com/13994516/58325972-c37db600-7e2b-11e9-9aa2-9f6faaf8dd94.png)
<br/><br/>
The **_Superalgos Protocol_** (also referred to as the _protocol_) determines the structure in which all the information regarding a trading system is stored and—at the same time—provides a clear guidance on how traders using the various tools developed and distributed by the Superalgos Project shall create and automate their strategies.

> You don't really _need_ to know this, but for the sake of context...
>
> The **_Strategy Engine_** backtests and forward tests the instructions defined on its _protocol_ file input. In coordination with the _Strategy Executor_, the engine can also live trade.
>
>The **_Strategy Executor_** interprets the execution instructions embedded at a _protocol_ file. The instructions determine the type of order to use, and what to do in every possible situation that could emerge during the placement and management of exchange orders.

# Charts Interface

## Layers Panel

This panel includes different layers you may visualize by toggling them on and off with a single mouse clicks.
The layer title bar can have 3 possible background colors:

1. **Red**: layer is off.
2. **Green**: layer is on.
3. **Yellow**: layer is loading. If it stays yellow, it means it can't load fully.

![Layers](https://user-images.githubusercontent.com/13994516/58434206-c04c2980-80ba-11e9-964b-8223ad99eb0b.gif)

## Main Elements

Notice the following three elements relative to the position of the mouse pointer:

1. Above, the current datetime. This is the date and time at the mouse pointer position.
2. To the right, the current rate. This is the rate (in this case USDT per BTC) at the mouse pointer position.
3. Below, the current time period (or candle size if you wish). This is the currently displayed time period—not only for candles, but for any other object plotted across available layers.

## Mouse Wheel Operations

There are many things you can do with your mouse wheel. 

1. Scroll over the Layers Panel to access layers that may be out of reach downwards.
1. Scroll on top of or next to the datetime to produce a horizontal scaling.
1. Scroll on top of or next to the displayed rate to produce a vertical scaling.
1. Scroll on top of or next to the time period to change the time period to available values. 
1. Scroll elsewhere over the chart to zoom in and out. The App will not only zoom in and out of the chart, but also automatically adjust the time period to the most convenient one (for the current zoom level).

![Mouse-Wheel](https://user-images.githubusercontent.com/13994516/58434568-a01d6a00-80bc-11e9-9a58-3edd4852f07c.gif)

## Floating Panels

To minimize a panel, click on the small triangle on the right of their title bar. This will automatically position the panel at the bottom of the screen. Clicking again restores the panel to its previous position.

You may also drag and drop the panels by right-clicking on the title bar.

![Panels](https://user-images.githubusercontent.com/13994516/58580610-d0e0d900-824d-11e9-8c57-501eb9429ba6.gif)

## Layers

The Superalgos Desktop App is an open system, meaning anyone can build layers for the _Charting System_. So far—with our current limited manpower—we have created several Indicator Layers described below, along with a few Simulation and Execution Layers described further down this document.

### Indicator Layers

#### Candles

Typical candlesticks.

![Candles](https://user-images.githubusercontent.com/13994516/58435905-1a50ed00-80c3-11e9-860a-bb4afc8e0f42.gif)

#### Volumes

We innovated a bit placing the buy volume at the bottom (in green), and the sell volume at the top (in red).

![Volumes](https://user-images.githubusercontent.com/13994516/58435907-1ae98380-80c3-11e9-90e5-de9052b166c4.gif)

#### Candle Stairs Patterns

This is an unusual pattern proving any dataset may be plotted on the charts (and by extension, that anything can be added to the system). A Stair Pattern is defined as a set of candles going in the same direction, either up or down. You can think of these patterns as "Candle Channels", as they represent channels with an up or down direction based on underlying candles direction.

![Candle-Stairs](https://user-images.githubusercontent.com/13994516/58435906-1ae98380-80c3-11e9-893e-1f8cd1b5c925.gif)

#### Volume Stairs Patterns

A similar concept, this time with volumes. Whenever a sequence of volume bars is found where each one is bigger than the previous one, they are bundled together in a "Stair". The same applies when they are going down (the next is smaller than the previous one). For a trading bot, this serves to identify if sell or buy volumes are raising or declining, if any.

![Volume-Stairs](https://user-images.githubusercontent.com/13994516/58435908-1ae98380-80c3-11e9-8c0d-87a105b4e021.gif)

#### Bollinger Bands

This is the traditional [Bollinger Bands indicator](https://en.wikipedia.org/wiki/Bollinger_Bands). Bollinger Bands have a moving average, in our case calculated with the last 20 periods (the line in the middle of the bands). We are plotting the moving average with one color when it is going up, and with a different color when it's going down. The upper band is at 2 Standard Deviations from the center, pretty much like the lower band, also at 2 Standard Deviations. These are the most widely used Bollinger Bands settings.

![Bollinger-Bands](https://user-images.githubusercontent.com/13994516/58435901-1a50ed00-80c3-11e9-853a-68d39ba7958b.gif)

#### Percentage Bandwidth (%B)

This is a well-known indicator that derives from the Bollinger Bands. In a nutshell it tells you how close the price is either to the upper band or the lower band at any point in time. When the price is in the middle of the bands (it is calculated with the close value of each candle), then %B is in the middle of its chart, at value 50. When the price touches the upper band, then %B is at 100, and finally when the price is at the lower band, then %B is at 0. 

![Bollinger-Bands-Percentage-Bandwidth](https://user-images.githubusercontent.com/13994516/58435903-1a50ed00-80c3-11e9-90d5-e0d5293c76ad.gif)
<br/><br/>

The chart features lines at %B value 30 and 70 since those are the most common values for traders to forecast when a reversal may happen. In our chart, %B is the one represented at #1. We've found useful to add a moving average in order to smooth volatility a bit, and to be able to ask—at any time—if it is going up or down. The moving average calculated with the last 5 %B values is plotted as line #2. Finally we've also added a property called Bandwidth, which represents the separation of the upper band from the lower band. It is a measure of volatility and is plotted at #3.  

![image](https://user-images.githubusercontent.com/9479367/56834223-1c7c1d80-6871-11e9-9687-ae5dc12d0336.png)

#### Bollinger Channels

This is a non-standard indicator derived from the Bollinger Bands. These types of channels are calculated using the Bollinger Bands moving average. Essentially an upward channel begins when the moving average turns from going down to going up, and the channel finishes when it turns from going up to down. A downward channel starts when the Bollinger Band moving average turns from going up to down, and it finishes when it starts going up again. Upward channels are plotted in green, while downward channels in red. Additional information can be found at the indicator's panel, like the number of periods contained at the channel.

![Bollinger-Channels](https://user-images.githubusercontent.com/13994516/58497359-146b1280-817c-11e9-9f4d-99fee41cd27f.gif)

#### Bollinger Sub-Channels

If we consider that one Bollinger Channel can have sub-channels with the same direction (up or down) but different slopes, then we get to the concept of Bollinger Sub-Channels. The most important property of a sub-channel is its slope. The possible values are: side, gentle, medium, high and extreme. With this information, a trading bot could easily ask if it is in a sub-channel with a certain slope and for how many periods. 

![Bollinger-Sub-Channels](https://user-images.githubusercontent.com/13994516/58497358-146b1280-817c-11e9-83df-219d0fffa9f0.gif)

# Designer

The Designer organizes the workflow to build strategies following the framework implemented by the _Superalgos Protocol_. If you are not familiar with the protocol, please read either of the following articles:

* [Superalgos Protocol V0.1 - the Short Version, for Experienced Traders](https://medium.com/@julian_superalgos/superalgos-protocol-v0-1-the-short-version-for-experienced-traders-86c3fa43f1c0).

* [Superalgos Protocol V0.1 - the Long Version, for Beginner Traders](https://medium.com/@julian_superalgos/superalgos-protocol-v0-1-the-long-version-for-beginner-traders-f293f1cc6c13).

## Workspace

The workspace is a concept that refers to all the information available about:

* Trading Systems, their Strategies, and their configurations.
* Personal Definitions, which may include API Keys.
* The position and status of all elements within the Designer.

Backing up your workspace is the best way to store trading systems, ready to be deployed.

## Interface

The Designer features a visual interface in which all elements encompassing strategies and other concepts are represented by icons organized in a hierarchical structure, as defined by the protocol. The hierarchy starts with My Definition, which in the future may have any number of Trading Systems, which in turn may have any number of Strategies.

Elements are bound to each other in a tree-like structure, and tend to self-organize along the workspace. 

### Element's Menu

Hoovering the mouse pointer over elements causes a menu to pop up.

![Designer-Element-Menu](https://user-images.githubusercontent.com/13994516/63047274-621e2e00-bed4-11e9-90ff-614b279c9910.gif)
<br/><br/>

The following menu options are tools that will help you manipulate the arrangement of elements, overriding the physics that affect their default floating nature.

| Icon | Status / Action |
| --- | --- |
| ![fix-pinned](https://user-images.githubusercontent.com/13994516/63041034-2df04080-bec7-11e9-88d3-8b7c1d42a666.png) | The element is pinned on a specific X-Y coordinate on the workspace. |
| ![menu-fix-unpinned](https://user-images.githubusercontent.com/13994516/63041045-35afe500-bec7-11e9-8f21-c8b3b66d3a0b.png) | The element is free, not pinned. |
| ![menu-mobility-freeze](https://user-images.githubusercontent.com/13994516/63041051-39436c00-bec7-11e9-8194-7cdd113147e4.png) | The element's connections with its parent and children are frozen. Connecting lines are blue. | 
| ![menu-mobility-unfreeze](https://user-images.githubusercontent.com/13994516/63041053-3b0d2f80-bec7-11e9-8b6f-ebe50dcb4d25.png) |  The element's connections are unfrozen. | 
| ![menu-tensor-fixed-angles](https://user-images.githubusercontent.com/13994516/63041062-3fd1e380-bec7-11e9-814f-e8cabc90fd12.png) | The element is locked to a rotational symmetry in relation with the rest of the elements at the same level of the hierarchy, thus all angles between elements are equal. Connection lines are orange.| 
| ![menu-tensor-free-angles](https://user-images.githubusercontent.com/13994516/63041066-42343d80-bec7-11e9-828e-b2d9a191fea2.png)  | The element is not locked in a rotational symmetry; instead, angles are free. Connection lines are yellow.| 
| ![menu-tree-minus](https://user-images.githubusercontent.com/13994516/63041070-44969780-bec7-11e9-9a42-3f13264b3ed2.png) | Clicking the _minus_ button contracts the branch of child elements. | 
| ![menu-tree-plus](https://user-images.githubusercontent.com/13994516/63041077-45c7c480-bec7-11e9-965c-38e4fd706c38.png) | Clicking the _plus_ button expands the branch of child elements. | 

The rest of the menu options available in most elements are the following:

| Icon | Action |
| --- | --- |
| ![menu-backup](https://user-images.githubusercontent.com/13994516/63045559-e66eb200-bed0-11e9-8f4d-6385147161fb.png) | **Backup**: Backs up the element along with all its children, including sensitive information such as API keys (in case of the Workspace and Personal Data elements), by downloading to the user's machine a JSON file containing the element's description. |
| ![menu-delete](https://user-images.githubusercontent.com/13994516/63045560-e66eb200-bed0-11e9-8b67-feb72b4ab253.png) | **Delete**: Deletes the element and all it's children. A confirmation is required (an additional click). |
| ![menu-share](https://user-images.githubusercontent.com/13994516/63045561-e7074880-bed0-11e9-88a2-cf99a0ede94e.png) | **Share**: Downloads a JSON file—in a similar manner as with the Backup operation—with one big difference: no personal information is included in the description of the element, so that the file may be freely shared. |

### Detachment and Attachment of Elements

Elements in the workspace may be detached from its parent, carrying all children with it. When an element is detached, it is no longer taken into account in simulations or live trading. This feature enables testing different parameters, keeping alternatives handy in the same workspace.

![Designer-Attach-Detach](https://user-images.githubusercontent.com/13994516/63227849-6d7e9b80-c1eb-11e9-9a02-6f760f383751.gif)
<br/><br/>

To detach an element, right-click on it and drag it away from the parent element. To attach an element, right-click on it and move it closer to the element you wish to attach it to. 

Elements may be attached only to conceptually related parents. For instance, a *condition* may be attached to a *situation*, but it can not be attached to a *formula*.

## Trading System

A trading system is a collection of strategies that conform to certain parameters. The one parameter that needs to be defined at this point in time is the Base Asset (refer to the [Superalgos Protocol articles above](#strategy-designer) for the definition of Base Asset).

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
| name | SDT or BTC |
| initialBalance | the amount of capital you wish to allocate to the whole trading system. |
| minimumBalance | when your overall balance combined (balanceAssetA + balanceAssetB) reaches this value, all trading stops; think of this a general safety switch. |
| maximumBalance | a similar concept as the minimumBalance, but on the higher side of the _initialBalance_. |

## Working with Strategies

As the Superalgos Protocol indicates, the definition of strategies is done in stages: trigger >> open >> manage >> close.

The Designer provides a Graphic User Interface for traders to input the _rules_ and _formulas_ that determine the behavior of strategies. Traders need to define the rules to _trigger on_ and _trigger off_ each strategy, to _take a position_, to manage _take profit_ targets and _stops_.

### Situations and Conditions

The protocol calls these sets of rules _situations_, in the sense that you are trying to determine what is going on with the market and, if the 'situation' is right, certain _actions_ or _events_ should be triggered.

In other words, you define _situations_ in which you wish a certain _event_ to happen (i.e.: trigger on the strategy, take a position, etc.) and each situation is described as a set of _conditions_ that need to be met in order for the _event_ to be triggered.

![Designer-Situation-Condition-Code](https://user-images.githubusercontent.com/13994516/63052184-fe4d3280-bede-11e9-87b0-7fb67964450c.gif)
<br/><br/>

The type of _statements_ you will use to define _conditions_ need to evaluate to _true_ or _false_.

When **all** _conditions_ within a _situation_ evaluate _true_, then the _situation_ evaluates _true_. This means that multiple _conditions_ within a situation are evaluated with the _AND_ operator (_e.g. condition 1 AND condition 2 AND condition 3 are either true or false; that is, if one condition is false, then the situation is false_).

On the other hand, when a certain event has multiple _situations_, then _situations_ are evaluated with the _OR_ operator (e.g. if either _situation 1_ OR _situation 2_ are true, then the event will be triggered.

This set up of _conditions_ and _situations_ allows to take the same kind of action (trigger a certain event) upon the occurrence of different desireable scenarios, each described by one _situation_.

Put in other words, events may be triggered in different circumstance, meaning that you are free to define different _situations_ upon which the event would be triggered. In such case, when **any** of the _situations_ evaluate _true_, then the event shall be triggered.

#### Comparison and Logical Operators

In order to define _conditions_ you will use _statements_ using any of the [available variables](#available-variables) that describe what is happening with the market. Remember, _conditions_ need to evaluate either _true_ or _false_.

To create such statements you will use comparison and logical operators:

| Operator | Description |
| :---: | --- |
| === | equal value and equal type |
| != | not equal |
| > | greater than |
| < | less than |
| >= | greater than or equal to |
| <= | less than or equal to |
| && | and |
| &#8739;&#8739; | or |

**For example:**

**Situation 1**

* Condition A: candle.close > bollingerBand.MovingAverage
* Condition B: candle.previous.max > bollingerBand.MovingAverage
  
In the example above, conditions A and B are comparison statements that may evaluate either _true_ or _false_. In the case both would evaluate _true_ then Situation 1 would be true as well.

**Situation 2**

* Condition C: candle.max <= 2000 && candle.min >= 1000

In the example above, _condition C_ would be _true_ if the whole candle falls within the range between 1000 and 2000. If this is _true_, then _situation 2_ is true as well, as there is only one condition to check.

### Starting a Strategy from Scratch

> In addition to the explanations available here, [a comprehensive video tutorial for building strategies](https://youtu.be/ZlkGkxSMsio) is available in our YouTube channel.

Strategies within a specific Trading System respond to the parameters set for the Trading System. This means they all have the same Base Asset, and they all share the _initialCapital_.

To start a brand new strategy, go to the Trading System icon and click _Add Strategy_ on the menu. Several icons will pop up on the screen. As you work on each stage (trigger, open, manage, close), you may need to add the missing items corresponding to certain elements.

![Designer-New-Strategy](https://user-images.githubusercontent.com/13994516/63052412-8df2e100-bedf-11e9-9ee9-9f4f4f61eeb3.gif)
<br/><br/>

The following are the minimum requirements to have a working strategy:

**Trigger Stage**: 
* **Trigger On Event**: at least one situation with one condition.
* **Trigger Off Event**: at least one situation with one condition.
* **Take Position Event**: at least one situation with one condition.

**Open Stage**, Initial Definition:
* **Position Size**: formula (any mathematical expression or number).
* **Position Rate**: formula (any mathematical expression or number).
* **Stop**: 
  * Phase 0:  formula (any mathematical expression or number).
* Take Profit: 
  * Phase 0:  formula (any mathematical expression or number).

### Using an Existing Strategy

Thanks to the implementation of the Superalgos Protocol, all strategies built within the Superalgos Desktop App are portable. This means that people may use strategies built by other people or groups of people.

You may import any element—formulas, conditions, situations, phases, stages, complete strategies, complete trading systems and even complete workspaces—simply by dragging and dropping them on the workspace.

![Designer-Drag-Drop](https://user-images.githubusercontent.com/13994516/63052820-a283a900-bee0-11e9-99b3-67273cba96a0.gif)

## Available Variables

### Ticker

**ticker.last:** The latest price discovered at the exchange at the time of execution.

**ticker.bid:** The highest bid in the order book at the time of execution.

**ticker.ask:** The lowest ask in the order book at the time of execution.

> IMPORTANT: The *ticker* variables may only be used in formulas. They are not to be used in *conditions*. Using ticker variables in conditions may result in unexpected behaviors.

> NOTE ON SIMULATIONS: When running in simulation mode, the three *ticker* variables are assigned the same value as  *candle.close* (the actual values are only available during live trading).

### Candles

**candle.min:** The minimum price of the last closed candle (low).

**candle.max:** The maximum price of the last closed candle (high).

**candle.open:** The price at which the last closed candle opened.

**candle.close:** The price at which the last closed candle closed.

**candle.direction:** 
* Down: candle.close < candle.open (bearish candle)
* Up: candle.close > candle.open (bullish candle)
* Side: candle.close = candle.open (neutral candle)

**candle.previous:** Refers to the previous candle. You may use _candle.previous_ to fetch any of the variables of the previous candle (i.e.: _candle.previous.close_). You may also use as many _.previous_ modifiers as required to fetch values of more than one period behind the current one (i.e.: _candle.previous.previous.max_ returns the maximum value of two candles before the current one).

### Bollinger Band

**bollingerBand.movingAverage:** The value of the current moving average (20 periods).

**bollingerBand.standardDeviation:** The value of current the [standard deviation](https://en.wikipedia.org/wiki/Standard_deviation).

**bollingerBand.deviation:** bollingerBand.standardDeviation * 2

**bollingerBand.direction:**  
* Down: bollingerBand.previous.movingAverage > bollingerBand.movingAverage 
* Up: bollingerBand.previous.movingAverage < bollingerBand.movingAverage
* Side: bollingerBand.previous.movingAverage = bollingerBand.movingAverage)

**bollingerBand.previous:** Use _.previous_ like with candles (see _candle.previous_ above).

>Learn more about the [Bollinger Band](https://en.wikipedia.org/wiki/Bollinger_bands)

### Percentage Bandwidth

**percentageBandwidth.value:** The current value of the percentage bandwidth.

**percentageBandwidth.movingAverage:** The current value of the percentage bandwidth moving average.

**percentageBandwidth.bandwidth:** The current bandwidth.

**percentageBandwidth.direction:** 
* Down: percentageBandwidth.previous.movingAverage > percentageBandwidth.movingAverage
* Up: percentageBandwidth.previous.movingAverage < percentageBandwidth.movingAverage
* Side: percentageBandwidth.previous.movingAverage = percentageBandwidth.movingAverage)

**percentageBandwidth.previous:** Use _.previous_ like with candles (see _candle.previous_ above).

### Bollinger Channels

**bollingerChannel.direction (Down | Up | Side):** 

**bollingerChannel.period:** The number of periods the channel spans at the moment the variable is being read. For instance, if a channel spans 10 candles and the variable is checked on the fourth candle, then _bollingerChannel.period_ = 4. Put in other words, it is the current span of the channel.

### Bollinger SubChannels

**bollingerSubChannel.direction (Down | Up | Side):** 

**bollingerSubChannel.period:** The number of periods the sub channel spans at the moment the variable is being read. For instance, if a sub channel spans 10 candles and the variable is checked on the fourth candle, then _bollingerChannel.period_ = 4. Put in other words, it is the current span of the subchannel.

### Internal

**strategyStage:** No Stage | Trigger Stage | Open Stage | Manage Stage | Close Stage.

**stopLoss:** The value of your Stop in the active phase.

**stopLossPhase (0 | 1 | ...):** The number of the active Stop phase.

**takeProfit:** The value of the Take Profit in the active phase.

**takeProfitPhase:** The number of the active Stop phase.

**positionRate:** The price at which the position was taken.

**positionSize:** The size of the position.

**balanceAssetA:** The balance of your _base asset_.

**balanceAssetB:** The balance of the second asset.

**lastTradeProfitLoss:** The P&L value for the latest completed trade (roundtrip).

**lastTradeROI:** The ROI of your latest trade.

**profit:** The total P&L during the current execution period.

**roundtrips:** The total number of trades in the current execution.

**fails:** The number of trades resulting in losses in the current execution.

**hits:** The number of trades resulting in profits in the current execution.

**periods:** The number of candles evaluated in the current execution.

# Simulation

A simulation is a combined backtesting plus paper trading operation, meaning that the simulation may run over both historic and up-to-date, live data. All actions performed by strategies are plotted directly over the charts, as explained in the [Private Layers](#private-layers) section.

## Running the First Simulation

In order to run a first simulation, you need to have a strategy in working order, as described in the [Starting a Strategy from Scratch](https://github.com/Superalgos/DesktopApp/blob/master/README.md#starting-a-strategy-from-scratch) section.

## Simulation Datetime Range

There are two ways to define the datetime in which a simulation starts. However, in both cases, the simulation never ends, and keeps running until the present time.

1. **With a parametric datetime starting point**: This method is used to always run the simulation starting from the same datetime. In this case, you need to add a definition to the Base Asset parameter described in the [Trading System](#trading-system) chapter:

```
{ 
"name": "USDT",
"initialBalance": 10,
"minimumBalance": 1,
"maximumBalance": 20000,
"initialDatetime": "2019-08-15T20:00:00.000Z"
}
```

2. **With a dynamic starting point**: If you don't set a datetime at the Trading System level, the simulation starts wherever the charts are positioned.

## Simulation Time Period

Simulations run in the time period active at the moment of clicking the RESTART BOTS button. Only one time period may be active at any point in time: if you run a simulation in a different time period than a previous simulation, the previous one stops—however,  the previous simulation data is conserved and may be accessed again by going back to the corresponding time period.

## Simulation Processes

Once you run a simulation, it keeps running for as long as the node.js process are running at the console. If you click RESTART BOTS, processes are stopped and restarted. The simulation should catch up from the point it stopped, all the way to the present time. It may take some time.

## Simulation Layers

Back on the Charts, the following layers plot strategies' actions over the market data, providing a comprehensive set of visual clues showing how strategies would behave when trading.

### Trading Simulation

The Trading Simulation layer displays a backtest + forward test (paper trading) of whatever strategies you have created in the system. At sign up, you are provided with an initial set of strategies so that you can be up and running as quickly as possible. By activating the Trading Simulation layer you should be able to see something like this:

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

### Simulation Conditions

The Trading Conditions layer helps identify which _conditions_ are met at each candle. Notice how _conditions_ are highlighted as the cursor moves through different candles.

![Trading-Simulation-Conditions](https://user-images.githubusercontent.com/13994516/58564448-3e304200-822d-11e9-967b-8c74fb8532fe.gif)

### Simulation Strategies

The Simulation Strategies layer identifies trigger on and trigger off events, signaling the activation and deactivation of strategies.

![Trading-Simulation-Strategies](https://user-images.githubusercontent.com/13994516/58565955-fd85f800-822f-11e9-9f95-9d0a477a4460.gif)

### Simulation Trades

The Simulation Trades layer marks trades with a triangle whose hypotenuse connects the price at the _take position_ event with the _exit_ price. When the trade is profitable, the triangle is green; when the _exit_ happens at a loss, the triangle is red.

![Trading-Simulation-Trades](https://user-images.githubusercontent.com/13994516/58574801-1a76f700-8241-11e9-9144-0db81636dace.gif)

# Live Trading

Once you are happy with your strategy, running it as a fully automated bot to trade live is quite simple. Truth be told, your strategy running as a simulation is pretty much a trading bot already—only that orders don't go to the exchange.

## Getting Started

All you need to do to start live-trading is:

1. Get your API Keys from the exchange (see instructions for [Poloniex](#poloniex-api-keys)).

2. Enter the public key and secret in the *Account Key* element attached to the *Exchange Account* element. Simply replace the *New Key* title with the *public key*, and enter the *secret* as the *Key Value*.<br/><br/>![Live-Trading-API-Key](https://user-images.githubusercontent.com/13994516/63278457-94020c80-c2a7-11e9-9436-340f2c60c999.gif)
<br/><br/>

3. Go back to the Charts and make sure they are positioned in the *time period* you wish to trade in.

> WARNING: The Superalgos Desktop App is at a very early stage of development. As such, errors may occur at any point, including errors that can cause you to lose money. You are responsible for taking all precautions before starting trading live. Make sure you test with small amounts of money, the kind you can afford losing. Trade live at your own risk.

4. Click RESTART LIVE TRADING.

## Live Trading Process

As soon as you click RESTART LIVE TRADING, your bot will be trading live. What happens is that you are still running a simulation—thus all the simulation layers keep plotting the same kind of information over the charts.

The difference is that orders will now go to the exchange.

Your trading bot is executed every 30 to 60 seconds, depending on the capacity of your machine. This is something you need to consider when picking a time period to trade, as the time lag between the moment the candle closes at the exchange and the time your trading bot is executed, will be more or less significant.

## Live Trading History Layer

In addition to the simulation layers, you will now be able to use the Live Trading History layer to get information about your trades. 

The layer plots tiny orange circles to indicate the precise point in time and price of each execution of the bot.

When a buy order is successfully placed at the exchange, a white triangle pointing up is drawn on the screen. The lower tip of the triangle signals the point in time and rate of the order. If the order is filled, a new—green—tringle is plotted on the screen.

A white triangle pointing down means a sell order has been placed at the exchange. When the sell order fills, a new—red—triangle is drawn over the charts.

## Poloniex API Keys

This is how you create an API Key in Poloniex:

Go to the tools menu and select *API KEYS*...

![image](https://user-images.githubusercontent.com/13994516/63279745-da586b00-c2a9-11e9-9eaa-fd94c5cd96a5.png)
<br/><br/>

If you have never used the API before, chances are it is disabled at the exchange. So before actually creating an API Key you will need to enable them...

![image](https://user-images.githubusercontent.com/13994516/63279823-fcea8400-c2a9-11e9-929e-0b090ad6f31c.png)
<br/><br/>

You will need to follow the validation process involving checking your email and confirming your choice. Once that is taken care of, go back to the tools menu and click *API KEY* again. You should now see a screen offering to create a new key...

![image](https://user-images.githubusercontent.com/13994516/63279901-1e4b7000-c2aa-11e9-8439-d05b96aa175b.png)
<br/><br/>

Once you create your key, the system will present it as follows...

![image](https://user-images.githubusercontent.com/13994516/63279980-45a23d00-c2aa-11e9-8740-8783b62c1ce8.png)
<br/><br/>

**Make sure you DO NOT enable withdrawals nor IP access restrictions.**

Copy the *secret* to use it in the Superalgos Desktop App. Once you leave this screen, recovering your secret requires an email validation process.

# Troubleshooting

## On-screen Errors and Warnings

It may happen that your simulation or live trading is not working as expected. The first thing to do in such case is look around within your workspace. Errors are signaled with a red circle surrounding the relevant element of the workspace. Hoover the mouse pointer over the element and you should get a description of what may be that is causing the unexpected behavior.

![On-screen-errors](https://user-images.githubusercontent.com/13994516/63213696-b52ff500-c10f-11e9-9bc1-741ecb0858ef.gif)
<br/><br/>

Bear in mind that when the split tab is fully closed, errors will no longer show up in the Designer, as shown in the below video:

![Error](https://user-images.githubusercontent.com/13994516/63213579-528a2980-c10e-11e9-8464-76cb4b369db4.gif)

## Market Data / Indicators Seem to be Outdated

If you are running the app for the first time or you stopped running the app for some time, data will not be up to date. Every time you start the app, it will take some time for data to catch up with the present time. If you wish to make sure your bots are running, simply click RESTART BOTS, check if the processes are running in your console and eventually, refresh the concerned layers.

![Troubleshooting-Refresh-Layers](https://user-images.githubusercontent.com/13994516/63114415-18494c80-bf95-11e9-8755-0fb2cb293ea0.gif)

## New Simulation Doesn't Seem to Match My New Settings

When you are working with a strategy, changing conditions, formulas or any other parameters, you will likely be re-running simulations (RESTARTING BOTS) so that the bots take on the new settings. Every time you RESTART BOTS, the system waits for a little while and automatically refreshes the Simulation Layers. However, it may happen that the auto-refresh happens before the new data is made available by the bots, so you may wish to refresh the Simulation Layers manually if that seems to be the case.

# Reporting Bugs

We highly appreciate bug reports. This is what you need to do:

1. Make sure you are running the latest release and that you have upgraded to the latest patch. You may find information about releases and patches in the [releases](https://github.com/Superalgos/DesktopApp/releases) page. If you are not running the latest patch, please upgrade and test your issue again before reporting anything.

2. Go to the [Issues](https://github.com/Superalgos/DesktopApp/issues) page in this repository and take a moment to search for similar existing open issues. If you find someone has the same issue as you, you may find helpful to follow the thread and comment if you have any new information about the issue.

3. If there are no similar issues, then open a new one. Do your best to describe the problem as thoroughly as possible.<br/><br/>Developers will be interested in knowing how to reproduce the issue in their own systems, so please describe the process that leads to the issue as clearly as possible. Capturing a GIF video showing the steps that lead to the issue would be of great help! [LICEcap](https://www.cockos.com/licecap/) is a lightweight, simple app that can help you with that. If developers can reproduce the issue, half of the problem is solved already.<br/><br/>Please make sure you enable Github notifications when someone responds to the issue, as developers may want to ask questions.<br/><br/>If the issue happens while using the app at the browser, then please include a screen capture of Chrome's Console. Open DevTools with the F12 key (when the browser is in focus) and click the Console tab, then go back and reproduce the issue. Take a screen capture of the Console and paste it along with your report.<br/><br/>Feel free to also include screen captures of the app itself if there is anything relevant you wish to show to developers.<br/><br/>![image](https://user-images.githubusercontent.com/13994516/63112941-c18e4380-bf91-11e9-95e2-6fb064d5aead.png)
<br/><br/>

