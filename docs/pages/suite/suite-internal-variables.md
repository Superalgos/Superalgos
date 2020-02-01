---
title:  Internal Variables
summary: ""
sidebar: suite_sidebar
permalink: suite-internal-variables.html
---

These are properties managed internally by the platform that are made available for using within strategies.

```strategyStage```: Possible values are ```"No Stage"```, ```"Trigger Stage"```, ```"Open Stage"```, ```"Manage Stage"```, and ```"Close Stage"```.

```stopLoss```: The value of your Stop in the active phase.

```stopLossPhase```: The number of the active Stop phase (0, 1, 2, ...).

```takeProfit```: The value of the Take Profit in the active phase.

```takeProfitPhase```: The number of the active Stop phase (0, 1, 2, ...).

```positionRate```: The price at which the position was taken.

```positionSize```: The size of the position.

```balanceAssetA```: Your BTC balance.

```balanceAssetB```: Your USDT balance.

```lastTradeProfitLoss```: The P&L value for the latest completed trade (roundtrip).

```lastTradeROI```: The ROI of your latest trade.

```profit```: The total P&L during the current execution period.

```roundtrips```: The total number of trades in the current execution.

```fails```: The number of trades resulting in losses in the current execution.

```hits```: The number of trades resulting in profits in the current execution.

```periods```: The number of candles evaluated in the current execution.

```positionPeriods```: The number of candles in the current open position.

```positionDays```: The number of days in the current open position.

```distanceToLast.triggerOn```: The number of periods between the last Trigger On and the current candle.

```distanceToLast.triggerOff```: The number of periods between the last Trigger Off and the current candle.

```distanceToLast.takePosition```: The number of periods between the last Take Position and the current candle.

```distanceToLast.closePosition```: The number of periods between the last Close Position and the current candle.
