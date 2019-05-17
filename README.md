# Welcome to the Canvas App

The Canvas App is the built-in charting system of Superalgos. It is the software capable of running the Plotters that represent datasets graphically.

![image](https://user-images.githubusercontent.com/9479367/56820881-520f0f80-684d-11e9-9f47-4b3ca38370e9.png)

## Installation 

To install the Canvas App, you need to install AAWeb, following this guide:

https://github.com/Superalgos/AAWeb/blob/develop/README.md

## Usage

The first time you access the Canvas App, you will see the following screen with no chart displayed, since the app expects you to select one of the available layers at the Layers Panel on the left:

![image](https://user-images.githubusercontent.com/9479367/56821029-a3b79a00-684d-11e9-8226-2471e32b70e7.png)

### Layers Panel

This panel includes different layers you may visualize by toggling them on and off with a single mouse clicks.
The layer title bar can have 3 possible background colors:

1. **Red**: layer is off.
2. **Green**: layer is on.
3. **Yellow**: layer is loading. If it stays yellow, it means it can't load fully.

Click on the "Candles" layer and wait a few seconds date is loaded and candles are plotted. You should see something like this:

![image](https://user-images.githubusercontent.com/9479367/56821266-1fb1e200-684e-11e9-9492-8bcbc3ed84d8.png)

As you may see, the candles belong to the BTC/USDT market @ Poloniex. Even though the app supports other markets and exchanges, it is better for us to have only this one active, while the codebase matures. 

Notice the following 3 elements relative to the position of the mouse pointer:

### Main Elements

1. Above, the current datetime. This is the date and time at the mouse pointer position.
2. To the right, the current rate. This is the rate (in this case USDT per BTC) at the mouse pointer position.
3. Below, the current time period (or candle size if you wish). This is the currently displayed time period—not only for candles, but for any other object plotted across available layers.

### Mouse Wheel Operations

There are many things you can do with your mouse wheel. 

1. Scroll on top of or next to the datetime to produce a horizontal scaling.
1. Scroll on top of or next to the displayed rate to produce a vertical scaling.
1. Scroll on top of or next to the time period to change the time period to available values. 
1. Scroll elsewhere over the chart to zoom in and out. The App will not only zoom in and out of the chart, but also automatically adjust the time period to the most convenient one (for the current zoom level).
1. Scroll over the Layers Panel to access layers that may be out of reach downwards.

After zooming in the main elements stay at the top, left and bottom of the viewport as you can see in the next screenshot:

![image](https://user-images.githubusercontent.com/9479367/56822037-30635780-6850-11e9-8d1c-1c58959f46e9.png)

### Moving Panels

Drag and drop right-clicking on the title bar.

### Minimizing Panels

Click on the small triangle on the right of their title bar. This will automatically position the panel at the bottom of the screen. Clicking again restores the panel to its previous position.

In the following image, the Layers Panel was dragged to the left and the Current Candle Panel was minimized:
 
![image](https://user-images.githubusercontent.com/9479367/56822276-db741100-6850-11e9-9e23-d3fabb82754c.png)

### Layers

Superalgos is an open system, meaning anyone can build layers for this charting app. So far—with our current limited manpower—we have created 8 public layers (available without logging in) and 2 private layers (available to logged-in users):

#### Public Layers

1. **Candles**: Typical candlesticks.

![image](https://user-images.githubusercontent.com/9479367/56822785-6acdf400-6852-11e9-98d9-0bd19ca98d61.png)

2. **Volumes**: I innovated a bit placing the buy volume at the bottom (in green), and the sell volume at the top (in red).

![image](https://user-images.githubusercontent.com/9479367/56822811-8638ff00-6852-11e9-9f25-6b97720a9d1b.png)

3. **Candle Stairs Patterns**: This is an unusual pattern proving any dataset may be plotted on the charts (and by extension, that anything can be added to the system). A Stair Pattern is defined as a set of candles going in the same direction, either up or down. You can think of these patterns as "Candle Channels", as they represent channels with an up or down direction based on underlying candles direction.

![image](https://user-images.githubusercontent.com/9479367/56822884-b6809d80-6852-11e9-999a-bccddfb68229.png)

4. **Volume Stairs Patterns**: A similar concept, this time with volumes. Whenever a sequence of volume bars is found where each one is bigger than the previous one, they are bundled together in a "Stair". The same applies when they are going down (the next is smaller than the previous one). For a trading bot, this serves to identify if sell or buy volumes are raising or declining, if any.

![image](https://user-images.githubusercontent.com/9479367/56822975-f34c9480-6852-11e9-9175-19d397b89441.png)

5. **Bollinger Bands**: This is the traditional (Bollinger Bands indicator)[https://en.wikipedia.org/wiki/Bollinger_Bands]. Bollinger Bands have a moving average, in our case calculated with the last 20 periods (the line in the middle of the bands). We are plotting the moving average with one color when it is going up, and with a different color when it's going down. The upper band is at 2 Standard Deviations from the center, pretty much like the lower band, also at 2 Standard Deviations. These are the most widely used Bollinger Bands settings.

![image](https://user-images.githubusercontent.com/9479367/56833341-82b37100-686e-11e9-8b17-55b3bf7a8fdb.png)

6. **Percentage Bandwidth or %B**: This is a well-known indicator that derives from the Bollinger Bands. In a nutshell it tells you how close the price is either to the upper band or the lower band at any point in time. When the price is in the middle of the bands (it is calculated with the close value of each candle), then %B is in the middle of its chart, at value 50. When the price touches the upper band, then %B is at 100, and finally when the price is at the lower band, then %B is at 0. The chart contains lines at %B value 30 and 70 since those are the most common values for traders to forecast when a reversal may happen. In our chart, %B is the one represented at #1. I've found useful to add a moving average in order to smooth volatility a bit, and to be able to ask—at any time—if it is going up or down. The moving average calculated with the last 5 %B values is plotted as line #2. Finally I also added a property called Bandwidth, which represents the separation of the upper band from the lower band. It is a measure of the volatility and is plotted at #3.  

![image](https://user-images.githubusercontent.com/9479367/56834223-1c7c1d80-6871-11e9-9687-ae5dc12d0336.png)

7. **Bollinger Channels**: This is a non-standard indicator derived from the Bollinger Bands. These types of channels are calculated using the Bollinger Bands moving average. Essentially an upward channel begins when the moving average turns from going down to going up, and the channel finishes when it turns from going up to down. A downward channel starts when the Bollinger Band moving average turns from going up to down, and it finishes when it starts going up again. Upward channels are plotted in green, while downward channels in red. Additional information can be found at the indicator's panel, like the number of periods contained at the channel.

![image](https://user-images.githubusercontent.com/9479367/56834955-30c11a00-6873-11e9-8601-9d8abc8fab84.png)

8. **Bollinger Sub-Channels**: If we consider that one Bollinger Channel can have sub-channels with the same direction (up or down) but different slopes, then we get to the concept of Bollinger Sub-Channels. The most important property of a sub-channel is its slope. The possible values are: side, gentle, medium, high and extreme. With this information, a trading bot could easily ask if it is in a sub-channel with a certain slope and for how many periods. 

![image](https://user-images.githubusercontent.com/9479367/56835528-c610de00-6874-11e9-8431-3cfe0c515f3e.png)

#### Private Layers

1. **Trading Simulation**: The Trading Simulation layer displays a backtest + fordwardtest (paper trading) of whatever strategies you have created in the system. At sign up, you are provided with an initial set of strategies so that you can be up and running as quickly as possible. By activating the Trading Simulation layer you should be able to see something like this:

![image](https://user-images.githubusercontent.com/9479367/56860461-0799aa00-6997-11e9-9c2d-5ace122a5c25.png)

Let's take a moment to analyze what you see on the chart:

A. This shows you when you entered into one of your strategies (think of it as if the strategy was activated because when activation conditions were met). The first icon represents the moment when you entered into that particular strategy, and the second icon represents the moment you left the strategy.

