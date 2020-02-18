---
title:  Syntax Overview
summary: "The syntax for writing conditions and formulas combine references to the data product name, the name of the property, and the time frame."
sidebar: suite_sidebar
permalink: suite-sysntax-overview.html
---

## Introduction

Different bots running within the system produce data products that others may consume. These products are available for you to use within your strategies.

Datasets are stored as a collection of sequential records and you may access any of the properties (fields) of each record.

To do that, you will use the following syntax: ```.productName``` + ```.propertyName```. 

The above syntax returns the value of the property of the declared product at the latest closed candle. This is common throughout all available datasets.

## Specifying the Time Frame

When building conditions and formulas, you may want to use analysis concerning different time frames. This is perfectly possible.

The variables explained further down this section, written as described for each indicator, are not valid unless they are preceeded by the declaration of the time frame they refer to.

To do that, you need to preceed the above syntax with the following:

```chart.at``` + ```time frame```

Therefore, the complete syntax to build a valid statement is:

```chart.at``` + ```time frame``` + ```.productName``` + ```.propertyName```

For example:

```chart.at04hs.candle.close > chart.at04hs.candle.previous.close```

The above statement compares the current 4 hours candle to the previous 4 hours candle.

The complete list of time frames available is:

| Time Frame | Syntax |
| :---: | :---: |
| 1 min | ```chart.at01min``` |
| 2 min | ```chart.at02min``` |
| 3 min | ```chart.at03min``` |
| 4 min | ```chart.at04min``` |
| 5 min | ```chart.at05min``` |
| 10 min | ```chart.at10min``` |
| 15 min | ```chart.at15min``` |
| 20 min | ```chart.at20min``` |
| 30 min | ```chart.at30min``` |
| 40 min | ```chart.at40min``` |
| 45 min | ```chart.at45min``` |
| 1 h | ```chart.at01hs``` |
| 2 hs | ```chart.at02hs``` |
| 3 hs | ```chart.at03hs``` |
| 4 hs | ```chart.at04hs``` |
| 6 hs | ```chart.at06hs``` |
| 8 hs | ```chart.at08hs``` |
| 12 hs | ```chart.at12hs``` |
| 24 hs | ```chart.at24hs``` |

## Previous Property

The ```previous``` property is a property common to all products that allows you to retrieve the value of the candle that closed previous to the last one. 

The property is used with the following syntax: ```chart.at``` + ```time frame``` + ```.productName``` + ```.previous``` + ```.propertyName```. You may use the property on any of the indicators in a similar way. 

In addition, you may use the ```previous``` property more than once, to retrieve values further in the past: ```chart.at``` + ```time frame``` + ```.productName``` + ```.previous.previous... ...previous``` + ```.propertyName```

For example, ```chart.at1hs.candle.previous.previous.max``` returns the maximum value of two candles before the last closed candle at the 1-hour chart.

## Alternative to the Previous Property

There is a cool alternative to the *previous* property, that you can use to fetch the value of a property beyond the last closed candle.

The syntax is ```productName.[currentCandleIndex-n].propertyName``` where *currentCandleIndex* represents the last closed candle and *n* may be replaced by any integer number.

For example, ```chart.at1hs.candle.[currentCandleIndex-5].max``` retrieves the maximum value of the fifth candle previous to the last closed candle at the 1-hour chart.

{% include note.html content="There is a technical limitation by which you may retrieve the value of a  property up to a maximum of 24 hours in the past, whatever number of periods that may represent, depending on the time frame you may be working on. For instance, if you are working on the 1 hour time frame, you may fetch up to 23 candles before the last one. If you are working on the 1 minute time frame, you may retrieve 1439 candles." %}

## Comparison and Logical Operators

To define _conditions_ you will use _statements_ using the syntax described above. You will use the properties of indicators that will be introduced later on. The data behind those indicators describe what is happening with the market. 

Remember, _conditions_ need to evaluate either _true_ or _false_.

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

* Condition A: ```chart.at01hs.candle.close > chart.at01hs.bollingerBand.MovingAverage``` (the latest candle at the 1 hour chart closed above the Bollinger Bands moving average).

* Condition B: ```chart.at01hs.candle.previous.max > chart.at01hs.bollingerBand.previous.MovingAverage``` (the maximum value of the candle before the last one, was higher than the Bollinger Bands moving average)
  
In the example above, conditions A and B are comparison statements that may evaluate either _true_ or _false_. In the case both would evaluate _true_ then Situation 1 would be true as well.

**Situation 2**

* Condition C: ```chart.at04hs.candle.max <= 10000 && chart.at04hs.candle.min >= 9000``` (the entire candle at the 4 hours chart fits within the price range between 9000 and 10000)

In the example above, _condition C_ would be _true_ if the whole 4-hour candle falls within the range between 9000 and 10000. If this is _true_, then _situation 2_ is true as well, as there is only one condition to check.

