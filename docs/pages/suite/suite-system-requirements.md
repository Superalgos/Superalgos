---
title:  System Requirements
summary: "The Superalgos Suite is a robust, cross-platform, browser-based system. It's capacity to run indefinite numbers of processes means that your hardware will set the limits of what you may or may not do with it."
sidebar: suite_sidebar
permalink: suite-system-requirements.html
---

## Cross-Platform

Superalgos is a web app, therefore, it is cross-platform. The dev team is testing mostly on Windows systems, but users are running the system on Mac OS and Linux systems as well.

## Chrome is the Only Tested Browser

Chrome is highly recommended so that you have a similar environment as the dev team in case you need help. We are not testing on any other browsers, and it is a well-known fact that browsers behave differently.

## Processing Power

One of the first and foremost design goals is to develop the most powerful trading automation and data processing system. There is no intention to limit or cut functionality short in an attempt to cope with less powerful hardware. It is a fact that your hardware will set the limits as of what you may or may not do with the system.

The system's processing capacity is based on running independent, specialized processes. No single process is as intensive as to require any special hardware, and all processes may run on basic&mdash;even outdated&mdash;laptop computers. That means that, regardless of the limitations of your current hardware, you should be able to use all of the features in the system.

What will vary depending on your hardware is the capacity to run a determinate number of processes simultaneoulsy. That is where you will find the limits of your hardware. In other words, you will find your system starts getting slow when it's doing many things at the same time. How many depends on your hardware.

The app has very little requirements for active, hands-on use, that is, for creating strategies, running backtests, or interacting with light-weight charts, for instance. We believe any cheap laptop should cope with such use.

Processing requirements increase in a roughly linear fashion with every process added to the mix. For instance processes that fetch data from exchanges and calculate indicators.

These are a few examples of use cases demanding significant processing power:

* Monitoring multiple markets in multiple exchanges, using multiple indicators on each chart, at the same time.  

* Backtesting multiple strategies in multiple exchanges or multiple periods, at the same time. 

* Running multiple live-trading sessions which depend on multiple indicators, at the same time. 

## RAM Memory

The system is not RAM-intensive. One dedicated gigabyte should be enough for intensive use, and two gigabytes may be required for extreme charting. Those are ball-park, non-scientific figures.

## Console/Command Line

Processes started from the system log their activity on the default console application, or the console used to fire up the app. Windows Command Prompt is particularly bad. It is recommended to install and use a decent application, such as <a href="https://cmder.net/" rel="nofollow" rel="noopener" target="_blank">Console Emulator Cmder<a/> This will save you time and hassle in the long run.

## Deploying a Linux VPS to Trade Live

You may want to read an article about <a href="https://medium.com/superalgos/trading-live-from-a-cheap-linux-vm-3edbe0c7ca42" rel="nofollow" rel="noopener" target="_blank">Trading Live from a Cheap Linux VM</a>.

