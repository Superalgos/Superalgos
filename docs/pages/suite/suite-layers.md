---
title:  Layers Panel
summary: ""
sidebar: suite_sidebar
permalink: suite-layers-panel.html
---

## Indicators Included in the Data Release

### Candles

Typical candlesticks.

[![Charts-03-Layers-Candles](https://user-images.githubusercontent.com/13994516/67269992-0a91d500-f4b8-11e9-9c67-a2bf3607d913.gif)](https://user-images.githubusercontent.com/13994516/67269992-0a91d500-f4b8-11e9-9c67-a2bf3607d913.gif)

### Volumes

We innovated a bit placing the buy volume at the bottom (in green), and the sell volume at the top (in red).

[![Charts-04-Layers-Volumes](https://user-images.githubusercontent.com/13994516/67269993-0b2a6b80-f4b8-11e9-8951-a1fbf12652b8.gif)](https://user-images.githubusercontent.com/13994516/67269993-0b2a6b80-f4b8-11e9-8951-a1fbf12652b8.gif)

### Candle Stairs Patterns

This is an unusual pattern proving any dataset may be plotted on the charts (and by extension, that anything can be added to the system). A Stair Pattern is defined as a set of candles going in the same direction, either up or down. You can think of these patterns as "Candle Channels", as they represent channels with an up or down direction based on underlying candles direction.

[![Charts-05-Layers-Candle-Stairs](https://user-images.githubusercontent.com/13994516/67270464-05815580-f4b9-11e9-8a8d-7d18b8c470d7.gif)](https://user-images.githubusercontent.com/13994516/67270464-05815580-f4b9-11e9-8a8d-7d18b8c470d7.gif)

### Volume Stairs Patterns

A similar concept, this time with volumes. Whenever a sequence of volume bars is found where each one is bigger than the previous one, they are bundled together in a "Stair". The same applies when they are going down (the next is smaller than the previous one). For a trading bot, this serves to identify if sell or buy volumes are rising or declining.

[![Charts-06-Layers-Volume-Stairs](https://user-images.githubusercontent.com/13994516/67270466-0619ec00-f4b9-11e9-8f62-8c227696c0fc.gif)](https://user-images.githubusercontent.com/13994516/67270466-0619ec00-f4b9-11e9-8f62-8c227696c0fc.gif)

### Bollinger Bands

This is the traditional [Bollinger Bands indicator](https://en.wikipedia.org/wiki/Bollinger_Bands). Bollinger Bands have a moving average, in our case calculated with the last 20 periods (the line in the middle of the bands). We are plotting the moving average with one color when it is going up, and with a different color when it's going down. The upper band is at 2 Standard Deviations from the moving average, pretty much like the lower band, also at 2 Standard Deviations. These are the most widely used Bollinger Bands settings.

[![Charts-07-Bollinger-Bands](https://user-images.githubusercontent.com/13994516/67270467-0619ec00-f4b9-11e9-9482-fbec44f0bf83.gif)](https://user-images.githubusercontent.com/13994516/67270467-0619ec00-f4b9-11e9-9482-fbec44f0bf83.gif)

### Percentage Bandwidth

This is a well-known indicator that derives from the Bollinger Bands. In a nutshell, it tells you how close the price is either to the upper band or the lower band at any point in time. When the price is in the middle of the bands (it is calculated with the close value of each candle), then %B is in the middle of its chart, at value 50. When the price touches the upper band, then %B is at 100, and finally when the price is at the lower band, then %B is at 0. 

[![Charts-08-Percentage-Bandwidth](https://user-images.githubusercontent.com/13994516/67270468-0619ec00-f4b9-11e9-9dd5-e1def0d8c246.gif)](https://user-images.githubusercontent.com/13994516/67270468-0619ec00-f4b9-11e9-9dd5-e1def0d8c246.gif)

The chart features lines at %B values 30 and 70 since those are the most common values for traders to forecast when a reversal may happen. In our chart, %B is the one represented at #1. We've found useful to add a moving average to smooth volatility a bit and to be able to ask—at any time—if it is going up or down. The moving average calculated with the last 5 %B values is plotted as line #2. Finally, we've also added a property called Bandwidth, which represents the separation of the upper band from the lower band. It is a measure of volatility and is plotted at #3.  

[![Charts-09-Percentage-Bandwidth-Lines](https://user-images.githubusercontent.com/13994516/67270469-0619ec00-f4b9-11e9-8334-135bb54db1bf.gif)](https://user-images.githubusercontent.com/13994516/67270469-0619ec00-f4b9-11e9-8334-135bb54db1bf.gif)

### Bollinger Channels

This is a non-standard indicator derived from the Bollinger Bands. These types of channels are calculated using the Bollinger Bands moving average. Essentially an upward channel begins when the moving average changes _direction_ from going down to going up, and the channel finishes when it turns from going up to down. A downward channel starts when the Bollinger Band moving average turns from going up to down, and it finishes when it starts going up again. Upward channels are plotted in green, while downward channels in red. Additional information can be found at the indicator's panel, like the number of periods contained at the channel.

[![Charts-10-Bollinger-Channels](https://user-images.githubusercontent.com/13994516/67271113-34e49200-f4ba-11e9-8365-070738856f2a.gif)](https://user-images.githubusercontent.com/13994516/67271113-34e49200-f4ba-11e9-8365-070738856f2a.gif)

### Bollinger Sub-Channels

If we consider that one Bollinger Channel can have sub-channels in the same direction (up or down) but different slopes, then we get to the concept of Bollinger Sub-Channels. The most important property of a sub-channel is its slope. The possible values are Side, Gentle, Medium, High and Extreme. With this information, a trading bot could easily ask if it is in a sub-channel with a certain slope and for how many periods. The slope or inclination of the moving average may be an indication of momentum.

[![Charts-11-Bollinger-SubChannels](https://user-images.githubusercontent.com/13994516/67271114-34e49200-f4ba-11e9-90c8-77623de1dd04.gif)](https://user-images.githubusercontent.com/13994516/67271114-34e49200-f4ba-11e9-90c8-77623de1dd04.gif)

## Indicators Not Included in the Data Release

**The following list of indicators are not included in the data release, therefore, they will show nothing when you switch the corresponding layer on, until you get the appropriate bots to calculate the data.**

To learn how to get ready to use these indicators, please refer to the [Using indicators not included in the data release](Using-Indicators-Not-Included-in-the-Data-Release) page.

Most of the indicators listed here come with several *products*, each with different settings for the said indicator. To learn all the details, check the [Indicators not included in the data release](Indicators-Not-Included-in-the-Data-Release) page under the *Writing Conditions & Formulas* section of this User Manual.

### Relative Strength Index (RSI 14)

[According to Investopedia](https://www.investopedia.com/terms/r/rsi.asp), "The relative strength index (RSI) is a momentum indicator that measures the magnitude of recent price changes to evaluate overbought or oversold conditions in the price of a stock or other asset. The RSI is displayed as an oscillator (a line graph that moves between two extremes) and can have a reading from 0 to 100."

[![Layers-04-RSI](https://user-images.githubusercontent.com/13994516/71260426-2213ff80-233b-11ea-8a1f-447e00da3ec7.gif)](https://user-images.githubusercontent.com/13994516/71260426-2213ff80-233b-11ea-8a1f-447e00da3ec7.gif)

The chart for this indicator shows the RSI oscillating in a scale ranging from 0 at the bottom to 100 at the top. The bottom section of the chart shows a blue background covering the range from 0 to 20, also marked by a dotted line. When the RSI value falls below the 20 mark, the RSI line turns red, for easier viasualization. Also in the bottom section, there is a second dotted line signaling the 30 mark.

The equivalent (although reversed) effect is featured on the top half of the charts, with dotted lines signaling the 70 and 80 levels, and a blue background above 80.

There is also a dotted line at the 50 mark, signaling the median of the chart.

For the time being, the chart is fixed on the screen and the user may not move it.

### Simple Moving Average (SMA)

[According to Investopedia](https://www.investopedia.com/terms/e/ema.asp), "A simple moving average (SMA) is an arithmetic moving average calculated by adding recent closing prices and then dividing that by the number of time frames in the calculation average. Short-term averages respond quickly to changes in the price of the underlying asset, while long-term averages are slow to react."

[![Layers-01-SMA](https://user-images.githubusercontent.com/13994516/71260423-217b6900-233b-11ea-9229-d838f8a071da.gif)](https://user-images.githubusercontent.com/13994516/71260423-217b6900-233b-11ea-9229-d838f8a071da.gif)

You will find several layers with different settings for SMAs, calculated on different periods. Each layer corresponds to a *product* made available by the indicator.

The information panel shows the numeric value for each SMA in the layer, in ascending order (i.e. SMA 20, SMA 50, SMA 100, etc.).

### Exponential Moving Average (EMA)

[According to Investopedia](https://www.investopedia.com/terms/e/ema.asp), "An exponential moving average (EMA) is a type of moving average (MA) that places a greater weight and significance on the most recent data points. The exponential moving average is also referred to as the exponentially weighted moving average. An exponentially weighted moving average reacts more significantly to recent price changes than a simple moving average (SMA), which applies an equal weight to all observations in the period."

[![Layers-02-EMA](https://user-images.githubusercontent.com/13994516/71260424-217b6900-233b-11ea-830d-e445a01aca65.gif)](https://user-images.githubusercontent.com/13994516/71260424-217b6900-233b-11ea-830d-e445a01aca65.gif)

The same explanations offered for SMAs apply to EMAs.

## Simulation Layers

Simulation layers are those resulting from the graphic representation of strategies' actions, and are explained further down this User Manual, when discussing [Simulation layers](Simulation-Layers) and the [Live trading history layer](Live-Trading-History-Layer).