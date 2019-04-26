# Welcome to the Canvas App

The Canvas App is the in-house charting system of Superalgos. It is the software capable of running the Plotters that can represent datasets graphically.

![image](https://user-images.githubusercontent.com/9479367/56820881-520f0f80-684d-11e9-9f47-4b3ca38370e9.png)

## Installation 

To install the Canvas App, you need to install AAWeb. Please follow this guide:

https://github.com/Superalgos/AAWeb/blob/develop/README.md

## Usage

First time you enter you will see this screen, with no chart displayed, since the app exects you to select one of the available layers at the left panel:

![image](https://user-images.githubusercontent.com/9479367/56821029-a3b79a00-684d-11e9-8226-2471e32b70e7.png)

### Layers Panel

This panel includes different layers you can visualize just by turning them on with a mounse click. A second click would turn them off.
The layer title bar can have 3 possibles colors:

1. Red: layer is off.
2. Green: layer is on.
3. Yellow: layer is loading or can not completelly load if it stay in this color/state.

Click on the first layer "Candles" and wait a few second to load the data and plot the candles chart. At that point you should see something like this:

![image](https://user-images.githubusercontent.com/9479367/56821266-1fb1e200-684e-11e9-9492-8bcbc3ed84d8.png)

As you can see, the candles belong to the market BTC/USDT @ Poloniex. Even though the app already support other markets and other exchanges, for us is better to have only this one active while the codebase matures. 

You need to notice these 3 things on your screen:

### Main Elements

1. The current datetime at the top. This is the date and time at the mouse pointer position.
2. The current rate at the right. This is the current rate (in this case USDT per BTC) at the mouse pointer position.
3. The current time period (or candle size if you wish) at the bottom. This is the currently diplayed time period, not only for candles but for any other object plotted across any of the available layers.

### Mouse Wheel Operations

There are many things you can do with your mouse wheel. 

1. Use your mouse wheel next to the datetime to produce an horizontal scaling.
2. Use your mouse wheel at the displayed rate to produce a vertical scaling.
3. Use your mouse wheel next to the time period to change it amoung all the possible available time periods. 
4. User you mouse wheel over the Layers panel to scroll up or down the layers (in case they are not all already displayed).
5. User your mouse wheel overt the chart, and not close to the previous elements to zoom in and out the chart. The App will not only zoom in and out but also automatically adjust the time period to the most convinient for the zoom level you are in.

After zooming in the main elements stay at the top, left and bottom of the viewport as you can see in the next screenshot:

![image](https://user-images.githubusercontent.com/9479367/56822037-30635780-6850-11e9-8d1c-1c58959f46e9.png)

### Hiding Panels

There are two ways to hide the panels on the screen:

1. Drag them from their title bar with the right mouse button.
2. Click over the small triangle at the left of their title bar. This will automatically position them at the bottom of the screen. Clicking again restores its previous position.

Here I gragged the Layers panel to the left, and I clicked at the Current Candle Panel:

![image](https://user-images.githubusercontent.com/9479367/56822276-db741100-6850-11e9-9e23-d3fabb82754c.png)

### Available Layers

Superalgos is an open system, that means anyone can build more layers for this chart app. So far with our current limited manpower we managed to create these ones:

1. Candles: tipical candlesticks.

![image](https://user-images.githubusercontent.com/9479367/56822785-6acdf400-6852-11e9-98d9-0bd19ca98d61.png)

2. Volumes: here I innovated a little bit, putting the buy volume down and in green, and the sell volume up and red.

![image](https://user-images.githubusercontent.com/9479367/56822811-8638ff00-6852-11e9-9f25-6b97720a9d1b.png)

3. Candle Stairs Patterns: this is an unusual pattern to prove anything can be added to the system. A Stair Pattern is defined as a set of candles going in the same direction, either up or down. You can think about this patterns as "Candle Channels" as are channels with direction up or down based on underlaying candles direction.

![image](https://user-images.githubusercontent.com/9479367/56822884-b6809d80-6852-11e9-999a-bccddfb68229.png)

4. Volume Stairs Patterns: similar concept but with volumes. Whenever we find a sequence of volume bars each one bigger than the previous one, they are bundled together in a "Stair". The same when they are going down (or the next is smaller than the previous one). In this way you can ask easily ask from a trading bot: is sell volume going up? is buy volume going down?

![image](https://user-images.githubusercontent.com/9479367/56822975-f34c9480-6852-11e9-9175-19d397b89441.png)


