---
title:  Sparta indicators
summary: "A set of indicators built in the Sparta data mine including Simple Moving Average (SMA), Exponential Moving Averege (EMA), Relative Strenght Index (RSI), and Moving Average convergence Divergence (MACD)."
sidebar: suite_sidebar
permalink: suite-sparta-indicators.html
---

{% include note.html content="The following indicators are available under the Sparta task managers in the data mining section of the network hierarchy." %}

## Simple Moving Average (SMA)

There are three products pre-configured to start calculating as soon as you start the corresponding task, each with different period configurations:

| Product Name | Product Variable | Period Variables |
| :---: | :---: | :--- | 
| Popular SMAs | ```popularSMA``` | ```sma20```, ```sma50```, ```sma100```, ```sma200``` |
| Base 7 | ```base7SMA``` | ```sma7```, ```sma14```, ```sma21```, ```sma28```, ```sma35```, ```sma70```, ```sma140```, ```sma210```, ```sma280```, ```sma350```, ```sma700```, ```sma1400```|
| Base 11 | ```base11SMA``` | ```sma11```, ```sma22```, ```sma33```, ```sma55```, ```sma111``` |

There are four more products available but they will not be calculated unless you create the corresponding data outputs and reference them to the corresponding data sets:

| Product Name | Product Variable | Period Variables |
| :---: | :---: | :--- | 
| Base 5 | ```base5SMA``` | ```sma5```, ```sma10```, ```sma15```, ```sma20```, ```sma25```, ```sma50```, ```sma100```, ```sma150```, ```sma200```, ```sma250```, ```sma500```, ```sma1000``` |
| Base 6 | ```base6SMA``` | ```sma6```, ```sma12```, ```sma18```, ```sma24```, ```sma30```, ```sma60```, ```sma120```, ```sma180```, ```sma240```, ```sma300```, ```sma600```, ```sma1200``` |
| Base 12 | ```base12SMA``` | ```sma12```, ```sma24```, ```sma36```, ```sma48```, ```sma60```, ```sma120```, ```sma240```, ```sma360```, ```sma480```, ```sma600```, ```sma1200``` |
| Base 30 | ```base30SMA``` | ```sma30```, ```sma60```, ```sma90```, ```sma120```, ```sma150```, ```sma300```, ```sma600```, ```sma900```, ```sma1200```, ```sma1500``` |

**Examples:**

1. ```chart.at24hs.popularSMA.sma50 > chart.at24hs.popularSMA.sma200``` — An indication of a bull market? Is the 50-day moving average above the 200-day moving average?

1. ```chart.at24hs.popularSMA.sma200 > chart.at24hs.base7SMA.sma350``` — Looking even further in the past, comparing a 200-day with a 350-day moving average. Notice how the two MA belong to different products.

## Exponential Moving Average (EMA)

The products and periods available in EMA map exactly the products and periods available in SMA. To use EMA you simply need to replace the S with an E. That said, for your reference, this is the complete list...

Like with SMAs, there are three products pre-configured to start calculating as soon as you start the corresponding task, each with different period configurations:

| Product Name | Product Variable | Period Variables |
| :---: | :---: | :--- | 
| Popular EMAs | ```popularEMA``` | ```ema20```, ```ema50```, ```ema100```, ```ema200``` |
| Base 7 | ```base7EMA``` | ```ema7```, ```ema14```, ```ema21```, ```ema28```, ```ema35```, ```ema70```, ```ema140```, ```ema210```, ```ema280```, ```ema350```, ```ema700```, ```ema1400```|
| Base 11 | ```base11EMA``` | ```ema11```, ```ema22```, ```ema33```, ```ema55```, ```ema111``` |

There are four more products available but they will not be calculated unless you create the corresponding data outputs and reference them to the corresponding data sets:

| Product Name | Product Variable | Period Variables |
| :---: | :---: | :--- | 
| Base 5 | ```base5EMA``` | ```ema5```, ```ema10```, ```ema15```, ```ema20```, ```ema25```, ```ema50```, ```ema100```, ```ema150```, ```ema200```, ```ema250```, ```ema500```, ```ema1000``` |
| Base 6 | ```base6EMA``` | ```ema6```, ```ema12```, ```ema18```, ```ema24```, ```ema30```, ```ema60```, ```ema120```, ```ema180```, ```ema240```, ```ema300```, ```ema600```, ```ema1200``` |
| Base 12 | ```base12EMA``` | ```ema12```, ```ema24```, ```ema36```, ```ema48```, ```ema60```, ```ema120```, ```ema240```, ```ema360```, ```ema480```, ```ema600```, ```ema1200``` |
| Base 30 | ```base30EMA``` | ```ema30```, ```ema60```, ```ema90```, ```ema120```, ```ema150```, ```ema300```, ```ema600```, ```ema900```, ```ema1200```, ```ema1500``` |

**Examples:**

1. ```chart.at01hs.base5EMA.ema5 < chart.at01hs.base5EMA.ema25``` — May the trend be reversing? Checking if a fast 5-hours exponential moving average goes below the slower 25-hours EMA.

## Moving Average Convergence/Divergence (MACD)

There are four different products, each configured with a specific setting for the fast and slow moving avarages and the MACD Signal line.

| Product Setting | Product Variable | EMAs |
| :---: | :---: | :--- |
| MACD (12, 26, 9) | ```macd122609``` | ```ema12```, ```ema26``` |
| MACD (3, 10, 16) | ```macd031016``` | ```ema3```, ```ema10``` |
| MACD (8, 17, 9) | ```macd081709``` | ```ema8```, ```ema17``` |
| MACD (24, 52, 9) | ```macd245209``` | ```ema24```, ```ema52``` |

The first few variables you may use from these products are those corresponding to the EMAs used to calculate the MACD line and the MACD signal line, as shown in the table above.

Also, each of the products in the above table feature the following properties:

| Property | Description |
| :---: | :--- |
| ```line``` | The MACD line, that is, the fast EMA minus the slow EMA. |
| ```signal``` | The Signal line, that is, the *n-period* EMA of the MACD line (*n* is the last setting) |
| ```histogram``` | The value of the histogram, that is, the difference between the MACD line and the MACD signal line. |

**Examples:**

1. ```chart.at30min.macd122609.line <= 0 && chart.at30min.macd122609.previous.line >= 0``` — A centerline crossover at the 30-minutes chart.

1. ```chart.at15min.macd031016.line >= chart.at15min.macd031016.signal && chart.at15min.macd031016.previous.line <= chart.at15min.macd031016.previous.signal``` — A signal line crossover at the 15-minutes chart.


## Relative Strength Index (RSI)

The RSI product currently available uses the standard setting of 14 periods, and features a single property: ```rsi14.value```

**Examples:**

1. ```chart.at24hs.rsi14.value >= 70``` — How's the trend going at the 24-hours chart?