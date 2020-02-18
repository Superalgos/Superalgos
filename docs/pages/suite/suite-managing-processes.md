---
title:  Managing Processes
summary: ""
sidebar: suite_sidebar
permalink: suite-managing-processes.html
---

| Task Manager | Task | Sensor Bot | Indicator Bot | Trading Bot | Process |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ![task](https://user-images.githubusercontent.com/13994516/66308205-ca9eef80-e906-11e9-8864-f7dba886bc7d.png) | ![timeline](https://user-images.githubusercontent.com/13994516/67079956-73b1d980-f194-11e9-89e0-9c8d1ea2ad1d.png) | ![bot-sensor](https://user-images.githubusercontent.com/13994516/67079734-000fcc80-f194-11e9-911d-2b537e4cb8f2.png) | ![bot-indicator](https://user-images.githubusercontent.com/13994516/67079733-000fcc80-f194-11e9-98d7-3426dd956d65.png) | ![trading-engine](https://user-images.githubusercontent.com/13994516/67079740-00a86300-f194-11e9-8609-793f66dd7378.png) | ![process](https://user-images.githubusercontent.com/13994516/67079738-00a86300-f194-11e9-9f59-a4cc4ce6d56c.png) |

A *task manager* is an entity that controls any number of *tasks*, and tasks are used to control *bots*, which in turn may run any number of *processes*. 

In other words, a task manager starts and stops tasks, and tasks are the devices you will use to start and stop bots.

Each task is an independent process at the *operating system* level, which handles its own memory allotment, and may be controlled and killed independently.

One task manager may have several tasks under its control, but each task should control only one bot instance.

Each bot may perform more than one job, thus, a bot instance may run one or more processes. Bots and processes are preconfigured so that you don't need to worry about their technical intricacies. 

**All you need to do is the basic operation: starting and stopping them via the corresponding tasks whenever you need them.**

There currently are three kinds of bots that you will run to provide you with the data and functions you need:

* **Sensor Bots:** they extract raw data from external sources (*i.e.: exchanges, Twitter, etc.*);

* **Indicator Bots:** they process data to produce elaborate datasets;

* **Trading Bot:** based on datasets exposed as products by other bots (counting sensors, indicators and even other trading bots), a trading bot applies the trading logic defined on a trading system to, on one side, generate a complete trading simulation (outputting datasets that include trades, the action of strategies, validation of conditions, etc.), and on the other side, manages the execution of orders when on a live-trading session.

## Current Task Managers

All workspaces in the ```Quick-Start-Examples``` folder include the Superalgos Network, a network node representing your local machine, and four different task managers. 

Each task manager has a name, which becomes visible only upon hovering the mouse pointer.

### Masters Datasets

Hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>D</kbd> (*D* for *Datasets*) to quickly find the *Masters Datasets* task manager, named after the *team* that created the bots in it.

This task manager has several tasks, each controlling one of the bot instances required to keep the datasets you downloaded with the data release up-to-date. 

Having all data your strategy consumes up-to-date is a requirement for paper trading, forward testing, and live trading sessions. If you wish to have the data up-to-date, you need to *Start All Tasks* using the menu. 

### Sparta Indicators

Hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>I</kbd> (*I* for *Indicators*) to quickly find the *Sparta Indicators* task manager. Again,Sparta is the name of the *team* that created this particular set of indicators.

If you wish to use these indicators in your strategies, please follow the guide about [Using indicators not included in the data release](Using-Indicators-Not-Included-in-the-Data-Release).


### Testing Sessions

Hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd> (*T* for *Testing*) to find the *Testing Sessions* task manager.

This is the task manager you will use to run the trading bot instances in charge of running both backtesting and paper-trading sessions.

### Live Sessions

Hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd> (*L* for *Live trading*) to find the *Live Trading Sessions* task manager.

We keep the forward testing and live trading sessions separate from the backtesting and paper-trading sessions as there is money involved in the former. Keeping live sessions apart may help avoid unpleasant mistakes, turning on or off live sessions inadvertently.

> **PRO TIP:** The Getting Started guide instructed you to start all tasks on the *Masters Datasets* task manager, but only the required task to start a backtesting session on the *Testing Sessions* task manager. Once you become proficient with the system, you may want to start only individual tasks according to your specific needs.