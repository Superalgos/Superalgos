---
title:  Update Datasets
summary: ""
sidebar: suite_sidebar
permalink: suite-update-datasets.html
---

To trade live, strategies need to be able to access up-to-date information to make trading decisions.

The bot that extracts raw trades data from the exchange and those which process the raw data to generate elaborate datasets, like indicators and other technical studies, need to be running at all times while trading live.

When you ran your first backtesting session, you first had to run a task that controls the trading bot and the specific process involved in calculating the backtests.

The bots that keep your datasets up to date are too controlled by a task manager and tasks, within the Network hierarchy.

| Superalgos Network | Network Node | Task Manager | Task | Sensor | Indicator |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ![network](https://user-images.githubusercontent.com/13994516/66855353-59ed7800-ef83-11e9-8de9-db40971faa7b.png) | ![network-node](https://user-images.githubusercontent.com/13994516/66855357-5a860e80-ef83-11e9-917d-95cd8394588b.png) |![task](https://user-images.githubusercontent.com/13994516/66308205-ca9eef80-e906-11e9-8864-f7dba886bc7d.png) | ![timeline](https://user-images.githubusercontent.com/13994516/67079956-73b1d980-f194-11e9-89e0-9c8d1ea2ad1d.png) | ![bot-sensor](https://user-images.githubusercontent.com/13994516/67079734-000fcc80-f194-11e9-911d-2b537e4cb8f2.png) | ![bot-indicator](https://user-images.githubusercontent.com/13994516/67079733-000fcc80-f194-11e9-98d7-3426dd956d65.png) |

Open up the design space section of the system by dragging the horizontal bar upwards. You may also use <kbd>Alt</kbd> + <kbd>&#8593;</kbd> on your keyboard. This shortcut closes the Charts and opens the design space.

Hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>D</kbd> (*D* for *Datasets*) to go to the *Masters Datasets* task manager that controls the aforementioned bots. Open the menu and click *Run All Tasks*.

[![Update-datasets-01-Run](https://user-images.githubusercontent.com/13994516/70341428-304e2000-1853-11ea-8158-8c59b56995fb.gif)](https://user-images.githubusercontent.com/13994516/70341428-304e2000-1853-11ea-8158-8c59b56995fb.gif)

You just started the *sensors* that extract live data from the exchange and the *indicators* that process raw trades data.

The data you downloaded spans from the date of the start of the market to the date of the release. Before you start trading live, the bots need to run for a while so as to catch up with the present time.

You will not see any immediate effect in your browser, but notice how your console application is buzzing with activity:

[![Getting-Started-Guide-05-Console](https://user-images.githubusercontent.com/13994516/67233532-b8af6780-f443-11e9-98e0-8efec4a305fe.gif)](https://user-images.githubusercontent.com/13994516/67233532-b8af6780-f443-11e9-98e0-8efec4a305fe.gif)

> **NOTE:** To know when datasets are up to date, you may find Paula under the Masters Datasets task manager, click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on its menu and notice the date displayed under the *Daily* process. When this date reaches the present time, chances are all other datasets will be up to date as well. You may also check your console and study the logs to see if all bots are processing the current date-time.

[![Update-datasets-02-Paula](https://user-images.githubusercontent.com/13994516/70341574-89b64f00-1853-11ea-8552-109bb90989ac.gif)](https://user-images.githubusercontent.com/13994516/70341574-89b64f00-1853-11ea-8552-109bb90989ac.gif)

In our experience, it may take from 5 to 20 minutes per day's worth of Poloniex data to be processed. The time it will take for these processes to complete the job depends on several things:

* The date of the release tells you how many days you are behind with the dataset you just downloaded.

* The speed and processing power of your machine will make a difference too.

* The average number of trades per day at the exchange determines the volume of data the system needs to retrieve and process.

* The number of trades the exchange returns per each request determines the size of the pipeline the exchanges allow API users to use.

These bots will keep running for as long as you keep the browser tab running the system open.

> **NOTE:** Remember no to close the console before closing the browser and allowing enough time for all processes to finish the current execution. Failing to do so may corrupt your data.