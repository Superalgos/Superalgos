---
title:  Telegram Announcements
summary: ""
sidebar: suite_sidebar
permalink: suite-telegram-announcements.html
---

## Overview

The announcements feature allows users to set up notifications tied to specific events, and triggered once the events become active within a strategy. 

You may use this feature to stay informed about the actions of your strategies while trading live, or to broadcast signals over a Telegram group while paper trading, for instance.

Supported events are:

* Trigger-on event
* Trigger-off event
* Take position event
* Stop and take profit next-phase events

> **NOTE:** In addition, you can implement announcements at the level of stop and take profit *phases*, a particular case that shall be discussed later on.

The current implementation is based on broadcasting announcements via Telegram bots.

The platform uses Telegram's bots API to interact with a Telegram bot you will create. The bot will be added as a user in the Telegram group of your choice in which it will deliver the announcements as per the configuration you will set up in the platform.

Announcements may be triggered within any of the running modes available, including backtesting, paper trading, forward-testing, and live trading.

## Setting Up a Telegram Bot and Telegram Group

Telegram's documentation features the page [Bots: An introduction for developers](https://core.telegram.org/bots), where you may find all the details on how to use Telegram bots.

For your convenience, the following steps will guide you through the basic process:

**1.** Go to Telegram and find the user [@BotFather](https://telegram.me/botfather), type and send ```/newbot```. BotFather will ask  you to pick a name for your bot. Once the name is set, it will respond with the token (a text string) to access the HTTP API:

![image](https://user-images.githubusercontent.com/13994516/68201429-0d192200-ffc2-11e9-9adc-c510b71e216a.png)

You will need this token at a later time.

**2.** Go to or create the desired Telegram group in which your bot will broadcast announcements. Add both your bot and user [@myidbot](https://telegram.me/myidbot) to the group. Then type and send ```/getgroupid``` in the group. IDBot will answer with the group's ID. You will need this ID at a later time.

## Setting Up the Telegram Bot in the Platform

**1.** You will set up your bot in a backtesting session, so that you may easily test the announcements. Go to any of your backtesting sessions and add the *Social Bot* node using the menu.

**2.** On the Social Bots menu click add a *Telegram Bot*, open the menu and click *Edit Telegram Bot*. Now replace the placeholder text with the actual *botToken* and *chatId* you got earlier:

For example:

```json
{ 
"botToken": "927642627:2B1QkNX2620C2B1ZTp9JrQUV04YKtJrQ2t4",
"chatId":-388158765
}
```

[![Telegram-bot-01-Create-in-platform](https://user-images.githubusercontent.com/13994516/68231138-c09e0880-fffa-11e9-8ed2-b2fdcb76afe9.gif)](https://user-images.githubusercontent.com/13994516/68231138-c09e0880-fffa-11e9-8ed2-b2fdcb76afe9.gif)

The platform now has everything it needs to communicate with your Telegram bot.

## Create Your Announcements

You will create an original announcement by clicking *Add Announcement* on the Telegram bot menu.

> **NOTE:** You may create as many announcements as you wish. Each announcement carries the ID of the Telegram Bot node in which it is created. This means you can have multiple Telegram Bots with any number of announcements each.

There are two different ways in which you can customize announcements:

* Plain text
* Dynamic content

### Plain Text

To set a plain text announcement, click *Edit Announcement* on the announcement menu and customize the field *text*.

For example:

```json
{ 
"text": "Bull run rider has triggered!",
"botType": "Telegram Bot",
"botId": "1a3d3416-3691-36a1-a885-c1e99c66d57b"
}
```

Or...

```json
{ 
"text": "Bull run rider is taking a position!",
"botType": "Telegram Bot",
"botId": "1a3d3416-3691-36a1-a885-c1e99c66d57b"
}
```

Remember you may set up announcements for any of the events listed in the [Overview](#overview) section above.

### Dynamic Content

To broadcast more elaborate messages that may include dynamic values of any of the current indicators or internal variables, use the announcement menu to *Add Formula*.

The typical set up for a dynamic message consists of building a string by alternating "text between double quotes" with variables, separating them with plus signs (+).

For example, a typical announcement formula for the take position event may look like this:

```
"Selling BTC at $" + candle.close.toFixed(0) + ", with stop at $" + stopLoss.toFixed(0) + " and TP target at $" +  takeProfit.toFixed(0)
```

```.toFixed(0)``` rounds the number to zero decimal places. The above formula would result in something like:

```
Selling BTC at $9703, with stop at $9896 and TP target at $9115
```
> **NOTE:** If your formula is valid, the platform will ignore the plain text version you may have set up. If for any reason the formula results in an error, then the plain text version will be used.

#### Announcements on Stop and Take Profit Phases

We mentioned earlier that—beyond events—you may also implement announcements at the level of a stop or take profit phase.

In such cases, the announcement is triggered every time the value of the underlying variable changes. This is an important difference, as you will likely be using dynamic formulas for your stop and take profit phases, and the value may change at every candle.

This could result in too many announcements being generated in relatively short intervals.

You may use the ```valueVariation``` parameter to filter out announcements until a certain threshold is achieved. The value you enter will set the percentage of variation that needs to occur before a new announcement is broadcasted.

For instance, ```"valueVariation": 0.5``` means a new announcement will be broadcasted every time the value of the underlying variable changes by 0.5%.

```json
{ 
"text": "Write here what you want to announce.",
"botType": "Telegram Bot",
"botId": "1a3d3416-3691-4b1e-a885-a4ed9c66d57b",
"valueVariantion": 0.5
}
```

## Placing and Testing Announcements

Every announcement you create needs to be attached to the event it is intended for. You will detach the announcement from the Telegram Bot node, drag it to the vicinity of the target event, and attach it to the event.

If you prefer, instead of dragging the announcement across the workspace which may be inconvenient, you may simply back it up and drop a copy right next to the target event.

[![Telegram-bot-02-Place-announcement](https://user-images.githubusercontent.com/13994516/68232209-e1fff400-fffc-11e9-8dd6-5866cf9f2d0d.gif)](https://user-images.githubusercontent.com/13994516/68232209-e1fff400-fffc-11e9-8dd6-5866cf9f2d0d.gif)

It's now time to test your set up. Run your backtesting session and you should start seeing the announcement in the corresponding Telegram group.

## Finishing the Setup

It is unlikely that you will want to use the announcements feature from within a backtesting session. A more likely scenario is you will want to use it with a paper-trading session (to generate signals) or from your live trading session, to monitor the activity of your strategy.

All you need to do to finish your set up is detach the Social Bot node from the backtesting session where it originated, and attach it to the session you wish to use. Make sure the corresponding tasks are stopped before detaching and attaching it.

That's it!


