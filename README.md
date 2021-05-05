# Superalgos Beta 9 - Getting Started Guide

All procedures are the same for Windows, Linux, or Mac OS. Raspberry Pi terminal commands have been included for ease of use.

> **IMPORTANT:** Minimalist hardware —both virtual and physical— is better suited for production deployments, where the use of the GUI is minimal. We highly recommend learning Superalgos in a local installation. Mastering the system takes time, and the use of the GIU to go through in-app tutorials is crucial during the learning process. Your experience will be orders of magnitude better if you follow this advice: leave minimalist hardware for when you are ready to start trading live.

![superalgos-readme](https://user-images.githubusercontent.com/13994516/106380124-844d8980-63b0-11eb-9bd9-4f977b6c183b.gif)

# Pre-Requisites

## 1. Node JS

If you don't have it yet, download and install Node.js.

Node JS is an open-source server environment required to run Superalgos.

**a.** Go to the Node JS [download page](https://nodejs.org/en/download/).

**b.** Download your system’s installer. Select *LTS Recommended for Most Users* and click the big Windows or macOS Installer button. If you are on Linux, the installer is listed further down the page.

**c.** Run the installer with the default configuration — just click Next until Node.JS is fully installed.

**NOTE FOR RASPBERRY PI USERS:** You may install Node.JS just like you would on any other machine as per the above instructions. As an alternative, you may also try the following from the SSH Terminal. **NOTE:** It is best to use the most current and updated version of the FULL PiOS image.

```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
```
followed by
```
sudo apt-get install -y nodejs
```
It is recommended to install the Node Package Manager
```
sudo apt install npm
```
you may also type the following to verify the Node.js installation and version.
```
node -v
```

## 2. Git

Download and install Git.

Git is an open-source distributed version control system required to download and stay up to date with Superalgos.

**a.** Go to the Git [download page](https://git-scm.com/downloads).

**b.** Download the version for your Operating System.

**c.** Run the installer with the default configuration — just click Next until Git is fully installed.

**IMPORTANT:** The latest version of Git is required to handle the authentication with GitHub.com.

**NOTE FOR MAC USERS:** Depending on your setup, installing Git may be optional. The native XCode Command Line Developer Tools seems to work well. If you do install Git, we have tested Tim Harper's binary installer successfully.

**NOTE FOR RASPBERRY PI USERS:** Just like with Node.JS, you may follow the above instructions to install Git, or us the SSH Terminal command. The most recent version of PiOS has Git already installed, so this may give you an error. The error will not affect your installation.
```
sudo apt-get install git
```

## 3. Google Chrome or Safari

Use Chrome, or Safari on Mac. These are the only tested browsers.

**a.** Go to the Chrome [download page](https://www.google.com/chrome/).

**b.** Run the installer.

Before you begin, it is recommended that you set up Chrome/Safari as your default browser.

**IMPORTANT:** Use Chrome/Safari so that you have a similar environment as the dev team in case you need help. We are not testing on any other browsers, and it is a well-known fact that browsers behave differently.

# Superalgos Client Installation

## 1. Fork the Superalgos Repository

**A.** Scroll the page all the way to the top. Find and click the **Fork** button to create your fork/copy of this repository. To fork Superalgos you need a Github account. If you don't have one, go ahead and create it.

**NOTE:** A Fork is required for your contributions to the project. The reason why Superalgos is free and open-source is that the project has set up a <a href="https://superalgos.org/community-business.shtml" target="_blank">Collective Business</a> in which all users may participate. The way to participate is to <a href="https://superalgos.org/community-contribute.shtml" target="_blank">contribute</a> to make Superalgos better. The project's <a href="https://superalgos.org/token-overview.shtml" target="_blank">token</a> is distributed among contributors.

## 2. Clone Your Fork

**A.** Once the fork is created, you will land on the page of your fork. Copy the URL from your browser's address bar.

**B.** In your computer/laptop/server, open a command prompt or terminal. Make sure you are in a directory where you have write permissions (on most systems the terminal will open in your user’s home directory, so you’re good). Clone the git repository using the command:

```
git clone <URL of your Superalgos fork>
```

For example, if your Github username is John, the command will look like this:

```
git clone https://github.com/John/Superalgos
```

This creates the `Superalgos` folder in the current directory, which contains the whole installation.

> **The Usage section below explains how to run the app.**

## 3. Installation Notes

**A.** You need to make a fork so that you may contribute work. Superalgos is a Community project and you are expected to contribute, like everyone else. You don't need to be a technical person to contribute. Fixing a typo in the docs or translating a paragraph into your native language are valuable contributions too. Superalgos has built-in features that make contributing easy. Help make Superalgos better and Superalgos will better serve you! [Free-riding is not cool](https://en.wikipedia.org/wiki/Free-rider_problem), particularly on free, open-source, Community-driven projects.

**B.** The software includes an in-app self-update command / feature. It will help you stay up-to-date with the latest version of the software. Updates are on-demand, so don't worry about undesired updates. The project moves very fast and new features become available regularly, particularly if you choose to run the software in the ```develop``` branch (you may switch branches from within the app).

**C.** Before installing the client on a remote computer in an attempt to access the UI from a different machine, we highly recommend you do a standard installation on your PC / laptop first. Leave your Raspberry Pi or VPS for later, once you have done all available tutorials. This single tip will save you a lot of time: you don't need to add complexity before you learn how to handle the app, and the GUI performs best in a local installation.

## 4. Migrating from Superalgos Beta 8

### Refactorings 

In order to migrate your own workspaces to Beta 9, you will need to open My Workspaces folder with an IDE like VS Code and do some refactorings. This is what you need to find and replace:

| Find | Replace With |
| :---: | :---: |
| Current | Trading Current |
| current | tradingCurrent |
| Last | Trading Last |
| last | tradingLast |
| Episode | Trading Episode |
| episode | tradingEpisode |
| Episode Counters | Trading Episode Counters |
| episodeCounters | tradingEpisodeCounters |
| Episode Statistics | Trading Episode Statistics |
| episodeStatistics | tradingEpisodeStatistics |
| Distance To Event | Distance To Trading Event |
| distanceToEvent | distanceToTradingEvent |

### Renaming of Exchange Folders

In Beta 9, the `exchange id` is used at the code and folder names instead of the exchange name. To migrate to Beta 9 users running on case sensitive Operating Systems (like Linux) must rename their Data-Storage Exchange folders using the Id of the exchange (in the case of Binance, it's the same name, but with lower-case b: binance). If you are using a different exchange, look at its node configuration and use the value at the property `codeName` to name the folder.

# Usage

## 1. Run the Client and GUI

**A.** To run Superalgos, go to the Superalgos directory/folder and run this command:

```
node run
```

The Client will run on your terminal and the GUI will launch on your default browser. If Chrome/Safari is not your default browser, copy the URL, close the browser, open Chrome/Safari, and paste the URL. Be patient... it takes a few seconds to fully load the GUI.

A Welcome Tutorial pops-up automatically. You must do this Tutorial to finish the setup and to learn the basics. It's the ultimate onboarding experience, superior to all other resources available, including videos and the Docs.

![run-the-system-01](https://user-images.githubusercontent.com/13994516/107037804-e5fc6200-67bb-11eb-82f2-d0f40247fa14.gif)

If you are running a headless Raspberry Pi (one without a screen) you may need to change directories first and run Superalgos with the `minMemo` and `noBrowser` options.
```
cd Superalgos
```
then
```
node run minMemo noBrowser
```

## 2. Usage Notes

We are testing the UI on Google Chrome and Safari on macOS only. It may work on other browsers as well &mdash; or not. If you are running on a different browser and ever need support, make sure you mention that fact upfront, or even better, try on Chrome/Safari first.

 **TIP:** If your computer has 8 GB of RAM or less, use ```node run minMemo``` to run the system with minimal RAM requirements.
 
# Running Superalgos on a Headless Linux Server as a Daemon

If you’re running Superalgos on a headless linux server like a Raspberry Pi, you might want to run it as a daemon so it isn’t attached to your current login session. The easiest, most standard way to go about this is probably using `systemd`. Most linux distributions use it as default init system/service manager.

## Using `systemd`

Create a `superalgos.service` file looking like this (change `<user>` to your user name and `/path/to/Superalgos` to your Superalgos folder, for instance `/home/John/Superalgos`):
```
[Unit]
Description=Superalgos client

[Service]
Type=simple
User=<user>
WorkingDirectory=/path/to/Superalgos
ExecStart=/usr/bin/node run minMemo noBrowser

[Install]
WantedBy=multi-user.target

```
There is no need to run Superalgos as root so we’re running it as a user. The `minMemo` option assumes you’re running on a small machine like a Raspberry Pi, while `noBrowser` makes sense for running daemonized.

Now, as root (or using `sudo`), put the file `superalgos.service` you just created in `/etc/systemd/system/` and issue the command
```
systemctl enable superalgos
```
This will install the service so that Superalgos is started on boot. To start it manually, do (again as root or with `sudo`)
```
systemctl start superalgos
```

To see the output of Superalgos, use
```
journalctl -u superalgos
```
or to follow the output,
```
journalctl -u superalgos -f
```

# Uninstall

Superalgos writes nothing outside of the ```Superalgos``` folder. To completely uninstall the software, just delete the folder.

# Welcome Tutorial

Once the app finishes loading, an interactive tutorial takes you by the hand and walks you all around the system while you learn the basic skills required to use the interface, mine data, backtest strategies, and even run a live trading session. It is highly recommended you follow the tutorial until the end, as it is carefully crafted to make your onboarding as easy as possible. Tutorials are the absolute best way to tackle the learning curve. You should do all tutorials before you start exploring other avenues on your own.

![welcome-tutorial-00](https://user-images.githubusercontent.com/13994516/107038771-4a6bf100-67bd-11eb-92e0-353525a972a9.gif)

 **NOTE:** The tutorial uses Binance or Binance US as the exchange of choice. If you don’t have an account with Binance or Binance US, you will still be able to follow 100% of the tutorial. When you get to the live trading section, keep going even if you don't intend to run the session. You may learn how to work with other exchanges later on.

# Docker Deployments

Docker container images can be found at https://github.com/users/Superalgos/packages/container/package/superalgos

If you wish to run Superalgos over docker platform, follow these steps.

## 1. Install Docker

Follow the link to [install docker](https://docs.docker.com/engine/install/).

## 2. Run

You will need to create local storage directories beforehand, by example with `mkdir Data-Storage Log-Files My-Workspaces`

```
docker run \
  -d \
  --rm \
  --name superalgos \
  -p 18041:18041 \
  -p 34248:34248 \
  -v $(pwd)/Data-Storage:/app/Data-Storage \
  -v $(pwd)/Log-Files:/app/Log-Files \
  -v $(pwd)/My-Workspaces:/app/My-Workspaces \
  ghcr.io/superalgos/superalgos:latest
```

Now you can access to the Superalgos UI at http://127.0.0.1:34248

To see console logs you can use `docker logs superalgos -f`

When you're done just exec `docker kill superalgos`

**Note:** This has not been extensively tested yet. If you run into troubles, please contact us at the [Superalgos Support Group](https://t.me/superalgossupport).

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

## Superalgos Allows You To...

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

## Superalgos is Permisionless

* Don't like the UI?
* Don't like the icons used?
* Don't like the Charting System?
* Don't like the Visual Designer?
* Don't like the Visual Debugger?
* Don't like the Docs?
* Don't like the Trading Bot?
* Don't like the Indicators?
* Don't like the Plotters?
* Don't like any other part of the system?

No problem, code or integrate libraries with your own version of any component and we promise we will merge your work and provide it as an alternative to users. We believe in Permissionless Innovation and that users, not team members, are the final judges and the ones who decide what they prefer to use. You are free to create an alternative for any part of the system that you believe that should work or should have been done in a different way. We will help you integrate your vision into the next release and enable a way for users to choose between different implementations of the same functionality. You will also be granted the title of maintainer of the functionality you provide and have decision power on how it evolves in the future.

# Superalgos for Individuals

* Superalgos is easy to install/uninstall.
* Superalgos is easy to run.
* Superalgos is easy to use.
* Superalgos is easy to learn.
* Superalgos is easy to debug.
* Superalgos is well documented.
* You have free online support via Telegram and Discord.

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

## Superalgos Minimizes Risks

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

We just opened a brand new [Discord server for Support and the Community](https://discord.gg/CGeKC6WQQb).

We also meet on several Telegram groups, where it all started!

> **BEWARE OF IMPERSONATORS — SCAMMERS ARE LURKING!**
Superalgos Admins, the Core Team, and Community Mods will never contact you directly unless you contact them first. We will never ask you for API keys, coins, or cash. In fact, we will never ask you to trust us in any way. Our [Community Safetey Policy](https://superalgos.org/community-safety-policy.shtml) explains why. In short, we want to make it clear that if someone contacts you directly claiming to work with or for the project, it is a scam. Please report scammers in the Community group so that they may be banned, and to increase awareness of the problem, but also block them and report them to Telegram if the option is available.

## Via Telegram

Online support through our [Superalgos User's Support Group](https://t.me/superalgossupport).

## In-App Integrated Documentation

Superalgos features interactive documentation built-in the system.

## Video Tutorials

Subscribe to the [Superalgos YouTube Channel](https://www.youtube.com/channel/UCmYSGbB151xFQPNxj7KfKBg).

## In-App Tutorials

There are many interactive tutorials you may do and learn from.

# Other Resources

## Web Site

For an overview of what Superalgos can do for you, check the [Superalgos Website](https://superalgos.org/).

## Telegram

For official news, join the [Superalgos Announcements Channel](https://t.me/superalgos).

Meet other users in the [Superalgos Telegram Community Group](https://t.me/superalgoscommunity).

Meet developers in the [Superalgos Telegram Developer's Group](https://t.me/superalgosdevelop).

Users meet in other topic-specific Telegram Groups. There's a [complete list of groups](https://superalgos.org/community-join.shtml) on the website.

## Blog

Find official announcements and various articles on the [Superalgos Blog](https://medium.com/superalgos).

## Twitter

To stay in the loop, follow [Superalgos on Twitter](https://twitter.com/superalgos).

## Facebook

Or follow [Superalgos on Facebook](https://www.facebook.com/superalgos).

# Contributing

Superalgos is a Community Project built by users for users. Learn [how you may contribute](https://superalgos.org/community-contribute.shtml).


## Top Contributors

Luis Fernando Molina, Julian Molina, Andreja Cobeljic, Ira Miller, matbenitez, bearcanrun, nikolabjelo, 9808us, pmmax, suttridge, Basalt09, Mhnramin, 0xperez, infin1t3, benitezme, whtv, cozed-gh, Eduardo678-dotcom, Smidy13, teehanming, 64bittuning, joenij, apronotti, Noeljarillo, ssplatt, rico4dev, DougJCook, mane, Cordo-van-Saviour, CarnivalBen, Sil3ntLight, pisukesoramame, Edodi, harrellbm, CaptainJeff, Jeff Braun, Francisco J. Santillán, Norman, Viktoria B., Guillermo V., Daniel J., Javier A., Gustavo J., Romina GS, Pedro P., Thais M., Andrey M., Loui M., Natalia M., Bashar A., Carlos V., Diego M., Sebastian E., Bogdan P., Marko V., Igor S., Niksa K., Rodrigo M., Nicanor M., Mateo H., Lan T., Leon A., Uroš R., Filip M., Vladimir J. and Pavle B.

# License

Superalgos is open-source software released under [Apache License 2.0](LICENSE).
