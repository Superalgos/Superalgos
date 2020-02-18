---
title:  Working with Strategies
summary: ""
sidebar: suite_sidebar
permalink: suite-working-with-strategies.html
---

## Introduction

| Definition | Trading System | Strategy |
| :---: | :---: | :---: |
| ![definition](https://user-images.githubusercontent.com/13994516/70050815-236dca00-15d0-11ea-9c8d-304edd640c8d.png) | ![trading-system](https://user-images.githubusercontent.com/13994516/70053113-07205c00-15d5-11ea-9618-819cf2e5a0e9.png) | ![strategy](https://user-images.githubusercontent.com/13994516/70053683-3be0e300-15d6-11ea-8ac9-6dba0ee0dfbb.png) |

As the Superalgos Trading Protocol indicates, the definition of strategies is done in stages:

* <a href="suite-trading-system-hierarchy.html#trigger-stage" data-toggle="tooltip" data-original-title="{{site.data.trading_system.trigger_stage}}">Trigger Stage</a>
* <a href="suite-trading-system-hierarchy.html#open-stage" data-toggle="tooltip" data-original-title="{{site.data.trading_system.open_stage}}">Open Stage</a>
* <a href="suite-trading-system-hierarchy.html#manage-stage" data-toggle="tooltip" data-original-title="{{site.data.trading_system.manage_stage}}">Manage Stage</a>
* <a href="suite-trading-system-hierarchy.html#close-stage" data-toggle="tooltip" data-original-title="{{site.data.trading_system.close_stage}}">Close Stage</a>

We will review each stage, one by one, but let's first discuss the common nodes among them.

Becoming familiar with the Superalgos Trading Protocol will significantly increase your understanding of how to build strategies, so we highly recommend reading either of the following articles:

* [Superalgos Trading Protocol V0.1 - the Short Version, for Experienced Traders](https://medium.com/superalgos/superalgos-protocol-v0-1-the-short-version-for-experienced-traders-86c3fa43f1c0).

* [Superalgos Trading Protocol V0.1 - the Long Version, for Beginner Traders](https://medium.com/superalgos/superalgos-protocol-v0-1-the-long-version-for-beginner-traders-f293f1cc6c13).

The design space provides a graphic user interface (GUI) for traders to input the _rules_ and _formulas_ that determine the behavior of strategies. Traders need to define the rules to _trigger on_ and _trigger off_ each strategy, to _take a position_, to manage _take profit_ targets and _stops_.

## Situations and Conditions

| Situations | Conditions | Code |
| :---: | :---: | :---: |
| ![situations](https://user-images.githubusercontent.com/13994516/63511799-72409980-c4e2-11e9-8f2a-5bc4a8d9d6ed.png) | ![conditions](https://user-images.githubusercontent.com/13994516/63511800-72d93000-c4e2-11e9-98a2-259c7f0edca2.png) | ![code](https://user-images.githubusercontent.com/13994516/63511802-72d93000-c4e2-11e9-9cbf-df75cc9bbe0b.png) |

The protocol calls these sets of rules _situations_, in the sense that you are trying to determine what is going on with the market and, if the 'situation' is right, certain _actions_ or _events_ should be triggered.

In other words, you define _situations_ in which you wish a certain _event_ to happen (i.e.: trigger on the strategy, take a position, etc.) and each situation is described as a set of _conditions_ that need to be met for the _event_ to be triggered.

[![Design-Space-Situation-Condition-Code](https://user-images.githubusercontent.com/13994516/63052184-fe4d3280-bede-11e9-87b0-7fb67964450c.gif)](https://user-images.githubusercontent.com/13994516/63052184-fe4d3280-bede-11e9-87b0-7fb67964450c.gif)

The type of _statements_ you will use to define _conditions_ need to evaluate to _true_ or _false_.

When ***all conditions*** within a _situation_ evaluate _true_, then the _situation_ evaluates _true_. This means that multiple _conditions_ within a situation are evaluated with the _AND_ operator (_e.g. condition 1 AND condition 2 AND condition 3 are either true or false; that is, if one condition is false, then the situation is false_).

On the other hand, when a certain event has multiple _situations_, then _situations_ are evaluated with the _OR_ operator (e.g. if either _situation 1_ OR _situation 2_ are true, then the event will be triggered.

This set up of _conditions_ and _situations_ allows taking the same kind of action (trigger a certain event) upon the occurrence of different desirable scenarios, each described by one _situation_.

Put in other words, events may be triggered in different circumstances, meaning that you are free to define different _situations_ upon which the event would be triggered. In such a case, when **any** of the _situations_ evaluate _true_, then the event shall be triggered.

> **NOTE:** The specific way in which conditions and formulas are written is covered further down this User Manual.

## Using an Existing Strategy

Thanks to the implementation of the Superalgos Trading Protocol, all strategies built within Superalgos are portable. This means that people may use strategies built by other people or groups of people.

You may import any node—formulas, conditions, situations, phases, stages, complete strategies, complete trading systems, and even complete workspaces—simply by dragging and dropping them on the workspace.

[![Design-Space-01-Drop-Workspace](https://user-images.githubusercontent.com/13994516/67271115-34e49200-f4ba-11e9-9309-e9e7046384a0.gif)](https://user-images.githubusercontent.com/13994516/67271115-34e49200-f4ba-11e9-9309-e9e7046384a0.gif)

## Working with Multiple Strategies

When you have more than one strategy under the same trading system, all strategies share the *parameters* defined at the trading system level. This means that all strategies will work with the same *base asset* and share the same *initialCapital*.

As a consequence, strategies within a trading system may never be triggered-on at the same time. Under such a setting, when a strategy is triggered on, it blocks the triggering of the rest of the strategies within the trading system until the strategy is triggered off.

If you wish to have multiple strategies that work independently from each other, then you need to place them on different trading systems. The system supports only one trading system per definition. As a result, if you wish to have multiple independent strategies, then you need to have multiple definitions, each with one trading system. Learn how to do that in the [Working with multiple definitions](Working-with-Multiple-Definitions) section.
