# Quick Getting Started Guide

All procedures are the same for Windows, Linux, or Mac OS. Note: tested only on Google Chrome.

![Superalgos video capture (16)](https://user-images.githubusercontent.com/9479367/77251218-76d25980-6c4d-11ea-8e47-be7db2e8abdb.gif)

# Pre-Requisites

## Node JS

If you don't have it yet, download and install Node.js.

Node JS is an open-source server environment required to run Superalgos.

**a.** Go to the Node JS [download page](https://nodejs.org/en/download/).

**b.** Download your system’s installer. Select *LTS Recommended for Most Users* and click the big Windows or macOS Installer button. If you are on Linux, the installer is listed further down the page.

**c.** Run the installer with the default configuration — just click Next until Node.JS is fully installed.

## Git

If you don't have it yet, download and install Git.

Git is an open-source distributed version control system required to download and stay up to date with Superalgos.

**a.** Go to the Git [download page](https://git-scm.com/downloads).

**b.** Download the version for your Operating System.

**c.** Run the installer and go through the process until Git is fully installed.

## Google Chrome

Use Chrome, the only tested browser.

**a.** Go to the Chrome [download page](https://www.google.com/chrome/).

**b.** Run the installer.

Before you begin, it is recommended that you set up Chrome as your default browser.

**Important:** Use Chrome so that you have a similar environment as the dev team in case you need help. We are not testing on any other browsers, and it is a well-known fact that browsers behave differently.

# Superalgos App Installation

**1.** If you are not there already, go to [https://github.com/Superalgos/Superalgos](https://github.com/Superalgos/Superalgos)

**2.** Scroll the page all the way to the top. Find and click the **Star** button on the top-right corner of the page to like Superalgos! Thank you! This helps developers find the project, which makes Superalgos better for you through their contributions. This step is in fact, your first contribution.

**3.** Next to the Star button, find and click the **Fork** button to create your fork/copy of this repository. To fork Superalgos you need a GitHub account. If you don't have one, go ahead and create one. A Fork is required for your contributions to the project and to stay up to date with the latest version of the software (more on this later).

**4.** Once the fork is created, you will land on the page of your fork. Copy the URL from your browser's address bar.

**5.** In your computer/laptop/server, open a command prompt or terminal as an administrator (to avoid issues with permissions) and type:

```
git clone 
```

**5.** Don't hit Enter yet! Complete the command by pasting the URL of your fork!

```
git clone + URL of your Superalgos fork.
```

For example, if your Github username is John, the command will look like this:

```
git clone https://github.com/John/Superalgos
```

## Instalation Notes

**1.** You need to make a fork so that you may contribute work. Superalgos is a Community project and you are expected to contribute, like everyone else. You don't need to be a technical person to contribute. Fixing a typo in the docs or translating a paragraph into your native language are valuable contributions too. Superalgos has built-in features that make contributing easy. Help make Superalgos better and Superalgos will better serve you! [Free-riding is not cool](https://en.wikipedia.org/wiki/Free-rider_problem), particularly on free, open-source, Community-driven projects.

**2.** You also need a fork to use the in-app self-update features. These will help you stay up-to-date with the latest version of the software. Updates are on-demand, so don't worry about undesired updates. The project moves very fast and new features become available regularly.

**3.** You are better off running the git clone command as an administrator to avoid permission issues while creating the Superalgos folder and downloading the repository. It may work without admin powers depending on your setup, particularly if you are running the command on a folder where you've got write permissions.

**4.** Before installing the client on a remote computer in an attempt to access the UI from a different machine, we highly recommend you do a standard installation on your PC / laptop first. Leave your Raspberry Pi or server for later, once you have done all available tutorials. This single tip will save you a lot of time: you don't need to add complexity before you learn how to handle the app. 

# Usage

![Run the system](https://docs.superalgos.org/images/how-to/run-the-system-01.gif)

**1.** To run the Superalgos client, change to the Superalgos directory/folder.

**2.** Switch to the develop branch running this command: 

```
git checkout develop
```

**3.** Run this command:

```
node run
```

**4.** The command launches your default browser to load the UI. If Chrome is not your default browser, copy the URL, close the browser, open Chrome, and paste the URL. Be patient... it takes a few seconds to fully load the UI.

**5.** A Welcome Tutorial pops-up automatically. You must do this Tutorial to finish the setup and to learn the basics. It's the ultimate onboarding experience, superior to all other resources available, including videos and the docs.

## Usage Notes

**1.** We are testing the UI on Google Chrome only. It may work on other browsers as well &mdash; or not. If you are running on a different browser and ever need support, make sure you mention that fact upfront, or even better, try on Chrome first.

 **Tip:** If your computer has 8 GB of RAM or less, use ```node run minMemo``` to run the system with minimal RAM requirements.

# Uninstall

Superalgos writes nothing out of the ```Superalgos``` folder. To completely uninstall the software, just delete the folder. 

# Welcome Tutorial

Once the app finishes loading, an interactive tutorial takes you by the hand and walks you all around the system while you learn the basic skills required to use the interface, mine data, backtest strategies, and even run a live trading session. It is highly recommended you follow the tutorial until the end, as it is carefully crafted to make your onboarding as easy as possible. Tutorials are the absolute best way to tackle the learning curve. You should do all tutorials before you start exploring other avenues on your own.

![Welcome Tutorial](https://docs.superalgos.org/images/how-to/tutorial-welcome-00.png)

 **Note:** The tutorial uses Binance or Binance US as the exchange of choice. If you don’t have an account with Binance or Binance US, you will still be able to follow 85% of the tutorial. The remaining 15% involves running a live trading session, which requires an account with the exchange. You may learn how to work with other exchanges later on.

# Docker Deployments

We haven't tested containerized deployments, but many people in the community have. Worth noting is the fact that Superalgos doesn't touch anything outside the Superalgos folder. To uninstall, delete the folder.

# What is Superalgos?

Superalgos is a platform to automate crypto-trading. It is implemented as a Node JS Client + Web App that runs on your hardware and scales from a single Raspberry Pi to a Trading Farm. Superalgos is **Free** and **Open-Source**.

## Superalgos Features

* A Visual Scripting Designer.
* Integrated Charting System.
* A Visual Strategy Debugger.
* Coordinated Task Management across a Trading Farm.
* Community-built strategies to learn and start from.
* In-App Tutorials.
* Complete In-App Documentation.

## Superalgos Allows You to...

* Visually design your trading strategies.
* Visually debug your trading strategies.
* Visually design your indicators.
* Visually design your plotters to visualize indicators or mined data.
* Visually design your data-mining operations.
* Download historical market data from crypto exchanges.
* Backtest your strategies against historical data.
* Run live trading sessions.
* Run arbitrary data-mining operations of any size.
* Feed your trading strategies with the data mined.

## Superalgos Development Pipeline

* Ethereum Integration: will allow you to data mine your own Ethereum node and use the mined data in your strategies.

* Machine Learning: will allow you to run a Reinforcement Learning Algorithm and feed it with mined data for it to learn how to make decisions relevant to your strategies.

## Superalgos is User-centric

* No ads, anywhere.
* No sign up / logins.
* No user/usage data collection of any kind.
* Runs 100% on uncompiled code anyone can read and audit.

# Superalgos for Developers

* You are free to customize Superalgos for your customers. No royalties, no license fees.
* Everything extra your customers may need may be coded by yourself or requested as new features.
* You may use Superalgos as a platform or as a component of a larger system.
* No proprietary code/libraries. All open-source and free.
* Superalgos features a library of community-contributed plugins (workspaces, strategies, indicators, plotters, tutorials, etc.).

## Superalgos Saves You Time

* No need to code the download of historical data from crypto exchanges.
* No need to code the streaming of market data from crypto exchanges.
* No need to hardcode strategies. Use the visual designer for a more flexible approach.
* No need to debug what went wrong, line by line, or dive into log files with tons of data. You can see each variable of the state of the Trading Engine at every candle by hovering the mouse over the charts.
* No need to integrate a charting library, Superalgos features an integrated Charting System.
* No need to manage task data or execution dependencies. Superalgos allows you to define Tasks and distribute them across a Trading Farm and takes care of the data and execution dependencies so that each task automatically starts when their dependencies are ready.

# Superalgos for Individuals

* Superalgos is easy to install/uninstall.
* Superalgos is easy to run.
* Superalgos is easy to use.
* Superalgos is easy to learn.
* Superalgos is easy to debug.
* Superalgos is well documented.
* You have free online support via Telegram.

## Superalgos Saves You Money

* There are no paid plans or anything that costs you money.
* There is no locked functionality. You may use the full capacity of the software.
* There is no limit to the number of backtests you may run. 
* There is no limit to the number of live sessions you may run.
* There is no limit to the number of historical data you may download.
* There is no limit to the volume of data you may process.
* You may use all the plugins available (indicators, plotters, strategies, etc.)
* You may install Superalgos in as many machines as you wish.
* Your installations may be used by as many people as required.
* You may connect to as many crypto exchanges as you wish.

## Superalgos minimizes your risks

* No one can know what strategies you design/run.
* No one can front-run you.
* No one can steal your trading ideas.
* No one knows how much capital you trade.
* No one can see your exchange keys.

# Superalgos for Companies

* No need to buy expensive software for monitoring crypto markets or trading execution.
* All your employees can use Superalgos for free.
* You can use Superalgos to its full capacity or just the features you are currently interested in.
* Superalgos may be integrated into your existing operation, feeding to and from other systems.

# Support

## Via Telegram

Online support through our [Superalgos User's Support Group](https://t.me/superalgossupport).
 
## In-App Integrated Documentation

Superalgos features interactive documentation.

## Video Tutorials

Subscribe to the [Superalgos YouTube Channel](https://www.youtube.com/channel/UCmYSGbB151xFQPNxj7KfKBg).

## In-App Tutorials

There are many interactive tutorials you can use to learn from.

# Other Resources

## Web Site

For an overview of what Superalgos can do for you, check the [Superalgos Website](https://superalgos.org/).

## Telegram

Meet other users in the [Superalgos Telegram Community Group](https://t.me/superalgoscommunity).

Meet the developers in the [Superalgos Telegram Developer's Group](https://t.me/superalgosdevelop).

Spanish speaking users hang out in the [Superalgos en Español Telegram Group](https://t.me/superalgos_es).

## Blog

Find official announcements and various articles on the [Superalgos Blog](https://medium.com/superalgos).

## Twitter

To stay in the loop, follow [Superalgos on Twitter](https://twitter.com/superalgos).

## Facebook

Or follow [Superalgos on Facebook](https://www.facebook.com/superalgos).

# Contributing

Superalgos is a Community Project built by Contributors for Contributors. Learn [how to become a Contributor](https://docs.superalgos.org/contributing-to-superalgos.html).

## Top Contributors 

Luis Fernando Molina, Julian Molina, Andreja Cobeljic, Matías Benitez, Ira Miller, Eduardo Remis, Jeff Braun, rico4dev, 9808us, Barry Low, Nikola Bjelogrlic, Hirajin Koizuko, Francisco J. Santillán, Norman, Viktoria B., Guillermo V., Daniel J., Javier A., Gustavo J., Romina GS, Pedro P., Thais M., Andrey M., Loui M., Natalia M., Bashar A., Carlos V., Diego M., Sebastian E., Bogdan P., Marko V., Igor S., Niksa K., Rodrigo M., Nicanor M., Alejandro P., Mateo H., Lan T., Leon A., Uroš R., Filip M., Vladimir J. and Pavle B.

# License

Superalgos is open-source software released under [Apache License 2.0](LICENSE).