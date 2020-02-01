---
title:  Indicators Included in the Data Release
summary: ""
sidebar: suite_sidebar
permalink: suite-indicators-included-in-the-data-release.html
---

The following indicators are those readily available as soon as you fire up the platform, as the corresponding datasets are included in the data release.

## Candles

The product ```candle``` features five different properties that you may use.

| Product Name | Product Variable | Property Variables |
| :---: | :---: | :--- | 
| Candles | ```candle``` | ```min```, ```max```, ```open```, ```close```, ```direction``` |

```candle.min```: The minimum price of the last closed candle (low).

```candle.max```: The maximum price of the last closed candle (high).

```candle.open```: The price at which the last closed candle opened.

```candle.close```: The price at which the last closed candle closed.

```candle.direction```: 
* ```"Down"```: candle.close < candle.open (bearish candle)
* ```"Up"```: candle.close > candle.open (bullish candle)
* ```"Side"```: candle.close = candle.open (neutral candle)

## Bollinger Bands (BB)

The product ```bollingerBand``` features four different properties that you may use.

| Product Name | Product Variable | Property Variables |
| :---: | :---: | :--- | 
| Bollinger Bands | ```bollingerBand``` | ```movingAverage```, ```standardDeviation```, ```deviation```, ```direction``` |

```bollingerBand.movingAverage```: The value of the current moving average (20 periods).

```bollingerBand.standardDeviation```: The value of current the [standard deviation](https://en.wikipedia.org/wiki/Standard_deviation).

```bollingerBand.deviation```: bollingerBand.standardDeviation * 2

```bollingerBand.direction```:  
* ```"Down"```: bollingerBand.previous.movingAverage > bollingerBand.movingAverage 
* ```"Up"```: bollingerBand.previous.movingAverage < bollingerBand.movingAverage
* ```"Side"```: bollingerBand.previous.movingAverage = bollingerBand.movingAverage)

## Percentage Bandwidth (%B)

The product ```percentageBandwidth``` features four different properties that you may use.

| Product Name | Product Variable | Property Variables |
| :---: | :---: | :--- | 
| Percentage Bandwidth | ```percentageBandwidth``` | ```value```, ```movingAverage```, ```bandwidth```, ```direction``` |

```percentageBandwidth.value```: A numeric value between 0 and 100; the current value of the percentage bandwidth.

```percentageBandwidth.movingAverage```: A numeric value between 0 and 100; the current value of the percentage bandwidth moving average.

```percentageBandwidth.bandwidth```: A numeric value between 0 and 100; the current bandwidth.

```percentageBandwidth.direction```: 
* ```"Down"```: percentageBandwidth.previous.movingAverage > percentageBandwidth.movingAverage
* ```"Up"```: percentageBandwidth.previous.movingAverage < percentageBandwidth.movingAverage
* ```"Side"```: percentageBandwidth.previous.movingAverage = percentageBandwidth.movingAverage)

## Bollinger Channels (BC)

The product ```bollingerChannel``` features two different properties that you may use.

| Product Name | Product Variable | Property Variables |
| :---: | :---: | :--- | 
| Bollinger Channels | ```bollingerChannel``` | ```direction```, ```period``` |

```bollingerChannel.direction```: Possible values are ```"Down"```, ```"Up"```, and ```"Side"```.

```bollingerChannel.period```: The number of periods the channel spans at the moment the variable is being read. For instance, if a channel spans 10 candles and the variable is checked on the fourth candle, then _bollingerChannel.period_ = 4. Put in other words, it is the current span of the channel.

## Bollinger SubChannels (BSC)

The product ```bollingerSubChannel``` features three different properties that you may use.

| Product Name | Product Variable | Property Variables |
| :---: | :---: | :--- | 
| Bollinger SubChannels | ```bollingerSubChannel``` | ```direction```, ```period```, ```slope``` |

```bollingerSubChannel.direction```: Possible values are ```"Down"```, ```"Up"```, and ```"Side"```.

```bollingerSubChannel.period```: The number of periods the subchannel spans at the moment the variable is being read. For instance, if a subchannel spans 10 candles and the variable is checked on the fourth candle, then _bollingerChannel.period_ = 4. Put in other words, it is the current span of the subchannel.

```bollingerSubChannel.slope```: Indicates how steep the slope of the subchannel is. Possible values are ```"Side"```, ```"Gentle"```, ```"Medium"```, ```"Steep"```, ```"Extreme"``` (in order from lowest to highest).