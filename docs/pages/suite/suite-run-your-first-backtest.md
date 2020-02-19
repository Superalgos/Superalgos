---
title:  Run Your First Backtest
summary: ""
sidebar: suite_sidebar
permalink: suite-run-your-first-backtest.html
---

To run your first backtest you will need a functional strategy. 

## Available Quick-Start Examples

* **```Share - Workspace - Combined Bull-run rider and Weak-hands buster.json```** features the [*Bull-run Rider*](https://github.com/Superalgos/Strategy-USDT-BullRunRider) strategy (USDT) and the [*Weak-hands Buster*](https://github.com/Superalgos/Strategy-BTC-WeakHandsBuster) strategy (BTC), combined on a single workspace. Use this template if you wish to use or learn about either or both of these strategies. You may delete the one you don't need if that is the case.

* **```Share - Workspace - Empty Strategy Structure.json```** features a template containing the minimum set of structure of nodes required to build your own strategy. Nodes are empty (undefined). This structure will guide you through the process of building your strategy. You will not be able to run a backtest or trade live with this template until you set up your own strategy.

## Import a Workspace

Go to the ```Superalgos/Quick-Start-Examples``` folder, drag ```Share - Workspace - Combined Bull-run rider and Weak-hands buster.json``` and drop it on the _design space_ to start with a workspace with functioning strategies.

[![Getting-Started-Guide-02-Drop-Workspace](https://user-images.githubusercontent.com/13994516/67231208-2907ba00-f43f-11e9-82b4-d78c0ace4d0a.gif)](https://user-images.githubusercontent.com/13994516/67231208-2907ba00-f43f-11e9-82b4-d78c0ace4d0a.gif)

## Run Your First Backtest

| Task Manager | Task | Trading Bot | Process | Backtesting Session |
| :---: | :---: | :---: | :---: | :---: |
|![task](https://user-images.githubusercontent.com/13994516/66308205-ca9eef80-e906-11e9-8864-f7dba886bc7d.png) | ![timeline](https://user-images.githubusercontent.com/13994516/67079956-73b1d980-f194-11e9-89e0-9c8d1ea2ad1d.png) | ![trading-engine](https://user-images.githubusercontent.com/13994516/69948042-2f358f80-14ef-11ea-9193-f49eeb67b51c.png) | ![process](https://user-images.githubusercontent.com/13994516/67079738-00a86300-f194-11e9-9f59-a4cc4ce6d56c.png) | ![session-backtesting](https://user-images.githubusercontent.com/13994516/66318052-e7452280-e91a-11e9-94a7-90ebe6ee6e62.png) |

Once in the design space, hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd> (*T* for *Testing*). This shortcut will take you to the *Network* hierachy of the design space, where you will start the process to run a backtesting session. More precisely, it takes you to *Testing Sessions*, the *task manager* that controls testing sessions.

Look around the task manager by clicking and dragging the black background of the design space. You may also use the following keyboard key combinations to move around:

1. <kbd>Ctrl or &#8984;</kbd> + <kbd>&#8592;</kbd> to pan to the left.
1. <kbd>Ctrl or &#8984;</kbd> + <kbd>&#8594;</kbd> to pan to the right.
1. <kbd>Ctrl or &#8984;</kbd> + <kbd>&#8593;</kbd> to pan upwards.
1. <kbd>Ctrl or &#8984;</kbd> + <kbd>&#8595;</kbd> to pan downwards.

Notice how each *task* is followed by an instance of the *trading bot*, an instance of the trading bot *process*, and a *session*. 

[![Backtesting-01-Testing-Sessions](https://user-images.githubusercontent.com/13994516/70341072-650da780-1852-11ea-9940-60bd619ac266.gif)](https://user-images.githubusercontent.com/13994516/70341072-650da780-1852-11ea-9940-60bd619ac266.gif)


Locate either of the backtesting sessions named *Back HWB* or *Back BRR*. To run a session, you first need to run the corresponding task. To do this, hover the mouse over the task that controls the backtesting session and click *Run* on the menu, then go to the backtesting session and click *Run* on the menu as well.

[![Backtesting-02-Run](https://user-images.githubusercontent.com/13994516/70341073-650da780-1852-11ea-80ac-f879be1d559e.gif)](https://user-images.githubusercontent.com/13994516/70341073-650da780-1852-11ea-80ac-f879be1d559e.gif)


You just started a backtesting session with a series of pre-configured parameters, including, for instance, the date range on which the backtesting session runs. Later on, you will learn how to adjust these parameters (if you can't wait, click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the backtesting session menu and you will find the parameters of the particular session). 

Notice the date progress notification displayed below the backtesting session node. The session is configured to run starting on January 1st, 2019. It will run up to the latest date of your current datasets, or up to the present time if your datasets are up-to-date.

It may take anything between 2 to 10 minutes (depending on your machine's processing power) to finish. You can tell the process finished calculating the backtesting session once the progress date stops, and—eventually—disappears.

To see the backtest simulation on the charts, you first need to make sure that the *Layers Manager* for the corresponding session is visible in the design space. This is what enables the corresponding simulation layers on the Layers Panel. 

To do that, go back to the backtesting session and click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the left-hand side.

[![Backtesting-03-Layers](https://user-images.githubusercontent.com/13994516/70341075-65a63e00-1852-11ea-9ae4-3b58a26b3c8c.gif)](https://user-images.githubusercontent.com/13994516/70341075-65a63e00-1852-11ea-9ae4-3b58a26b3c8c.gif)

Then, you may pull down the horizontal bar to go to the charts and see the simulation. Make sure you are standing on the 1-hour time frame. Notice the time box at the bottom of the charts:

[![Getting-Started-Guide-06-Go-to-Charts](https://user-images.githubusercontent.com/13994516/67237146-fc599f80-f44a-11e9-8da4-c95fc6295d52.gif)](https://user-images.githubusercontent.com/13994516/67237146-fc599f80-f44a-11e9-8da4-c95fc6295d52.gif)

If you are not at the 1-hour time frame use the wheel of your mouse while pointing at the charts to zoom in until you reach the 1-hour time frame. You do this so that you may see the results of the backtesting session, which in the case of the example strategies, are calculated and plotted over the 1-hour charts.

[![Getting-Started-Guide-07-Zoom-In](https://user-images.githubusercontent.com/13994516/67237088-d7fdc300-f44a-11e9-8ae5-d3fd394ffc22.gif)](https://user-images.githubusercontent.com/13994516/67237088-d7fdc300-f44a-11e9-8ae5-d3fd394ffc22.gif)

Now go the *Layers Panel* on the left-hand side of the screen and use the wheel of your mouse to scroll down until you find the layers starting with *Back BRR* or *Back WHB*, depending on your previous choice of strategy. Turn each of the layers on with a single click.

[![Getting-Started-Guide-08-Turn-on-Layers](https://user-images.githubusercontent.com/13994516/67237090-d8965980-f44a-11e9-86ba-3eb1e6980ae2.gif)](https://user-images.githubusercontent.com/13994516/67237090-d8965980-f44a-11e9-86ba-3eb1e6980ae2.gif)

You may now navigate the charts by clicking and dragging, or by zooming in and out with the wheel of your mouse. If you change the time frame, you will not see the simulated data, as each time frame may hold its own set of simulations.

[![Getting-Started-Guide-09-Navigate](https://user-images.githubusercontent.com/13994516/67237276-3e82e100-f44b-11e9-977f-a02da0857b38.gif)](https://user-images.githubusercontent.com/13994516/67237276-3e82e100-f44b-11e9-977f-a02da0857b38.gif)

Congratulations! You've run your first backtesting session!

To learn more about how to interpret the information in the simulations, please refer to the [Simulation layers](Simulation-Layers) page on this User Manual.