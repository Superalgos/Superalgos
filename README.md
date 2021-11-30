# Superalgos 1.0.0

![contributors](https://img.shields.io/github/contributors-anon/Superalgos/Superalgos?label=Contributors)
![pull-activity](https://img.shields.io/github/issues-pr-closed-raw/Superalgos/Superalgos?color=blueviolet)
![last-commit](https://img.shields.io/github/last-commit/Superalgos/Superalgos/develop?label=last%20commit%20to%20develop)
![bot-friendliness](https://img.shields.io/badge/Bot%20Friendliness%20Level-119%25-yellow)

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Getting Started Guide](#getting-started-guide)
  - [Packaged Application Installation](#packaged-application-installation)
  - [Docker Installations](#docker-installations)
  - [Contributors Installation](#contributors-installation)
    - [Installation Notes](#installation-notes)
  - [Uninstall](#uninstall)
- [Usage](#usage)
  - [Run the Client and GUI](#run-the-client-and-gui)
    - [Using the shortcuts](#using-the-shortcuts)
    - [Using the Command Line](#using-the-command-line)
  - [Usage Notes](#usage-notes)
  - [Running Superalgos on a Headless Linux Server as a Daemon](#running-superalgos-on-a-headless-linux-server-as-a-daemon)
    - [Using Systemd](#using-systemd)
- [Welcome Tutorial](#welcome-tutorial)
- [What is the Superalgos Platform?](#what-is-the-superalgos-platform-)
  - [Superalgos Platform Features](#superalgos-platform-features)
  - [Superalgos Development Pipeline](#superalgos-development-pipeline)
  - [Superalgos is User-centric](#superalgos-is-user-centric)
  - [Superalgos Platform Allows You To](#superalgos-platform-allows-you-to)
  - [Superalgos Platform for Developers](#superalgos-platform-for-developers)
  - [Superalgos Platform Saves You Time](#superalgos-platform-saves-you-time)
  - [Superalgos Platform is Permissionless](#superalgos-platform-is-permissionless)
  - [Superalgos Platform for Algo-Traders](#superalgos-platform-for-algo-trders)
  - [Superalgos Platform Saves You Money](#superalgos-platform-saves-you-money)
  - [Superalgos Platform Minimizes Risks](#superalgos-platform-minimizes-risks)
  - [Superalgos Platform for Companies](#superalgos-platform-for-companies)
- [Support](#support)
- [Other Resources](#other-resources)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Superalgos is not just another open-source project. We are an open and welcoming community devised, nurtured, and incentivized with the project's native [Superalgos (SA) Token](https://superalgos.org/token-overview.shtml) to build an [open trading intelligence network](https://superalgos.org/).

You will notice the difference as soon as you join the [Telegram Community Group](https://t.me/superalgoscommunity) or the new [Discord Server](https://discord.gg/CGeKC6WQQb)!

> Can't wait to contribute? Start by giving a star to this repository in the top-right corner of this page!

![superalgos-readme](https://user-images.githubusercontent.com/13994516/106380124-844d8980-63b0-11eb-9bd9-4f977b6c183b.gif)

## Getting Started Guide

Superalgos is an ever growing ecosystem of tools and applications.  This guide will walk you through the main ways to install the Superalgos Platform (which is the flagship application of the ecosystem).  Other applications, such as a mobile app, and a p2p networking app, are currently under development.  

There are a variety of methods to install the Superalgos Platform ranging from docker installations and packaged application installations, to fine grained technical installations.  The following instructions will present each type of installation from easiest to most technical.  

> **Note**: 
> 
> If you would like to try out Superalgos without any installation, you can check out our online demo [here](https://superalgos.org/crypto-trading-bots-platform-demo.shtml).


### Packaged Application Installation

This is by far the easiest way to get started with Superalgos! 

These packages contain the source code for the Superalgos platform wrapped together in one convinent file.  To find these files you can go to Superalgos' [releases page](https://github.com/Superalgos/Superalgos/releases). The releases are organized using two main categories.  First are the stable releases that comes out roughly once a month and are the most tested and bug free.  Second are the nightly development snapshots that offer the most up to date code, but have not under gone the same rigorous testing. 

> **Note**: 
> 
> If you are just getting started, it is recommended to begin with installing the most recent stable release before trying out one of the development snapshots.

Once you have chosen which type of release you would like to install, you can then find the proper package for your operating system. Each operating system has it's own packaged application to work natively within your operating system.  The following list highlights the currently available packages:  

> **IMPORTANT:**
> 
> These installers are not code signed (this costs money and Superalgos is completely free for everyone). Therefore, antivirus will probably flag the file as unsecure. You can force the installation to allow the packages to run.  A more detailed explanation of this can be found in this [medium article](https://medium.com/superalgos/superalgos-packaged-application-release-8befd2895102). If this makes you uncomfortable, it is recommended you look into some of the other installation methods that do not suffer from this limitation.


#### Windows Portable Application

This package requires zero installation! Simply download the package (Superalgos-win-{version}.exe) and you’re good to go. All the exchange data that is downloaded and the workspaces you save are stored in your default documents folder (My Documents on Windows) under the Superalgos_Data folder. This way it is easier for you to backup data and not lose it between reinstallation.

#### Windows Setup Package

Also on windows, there is a more traditional installer that installs the application and sets up the correct icons and shortcuts for you. This way you have a nice entry on the programs list. The downloaded data is stored in your documents folder under the Superalgos_Data folder. This way it is easier for you to backup data and not lose it between reinstallation.

#### MacOS Image

Users of MacOS have the option of downloading a DMG package. Installation is as simple as downloading the DMG file and copying it into your Applications folder!

Currently, there are two types of DMG packages. The x64 variant (for Intel based Mac only), as well as the ARM64 variant for the newer Apple Silicon (M1) based machines. All data is stored in the documents folder under the Superalgos_Data folder. This way it is easier for you to backup data and not lose it between reinstallation.

For a more detailed walk through of the ins and outs of Superalgos packaged installations see this [medium article](https://medium.com/superalgos/superalgos-packaged-application-release-8befd2895102).

#### Pros and Cons of Packaged Installations

The packaged applications are by far the easiest way to install the Superalgos Platform. All of the day to day functionality of the platform is readily available, as well as the ability to create and submit a User Profile to the Governance system! 

The main draw back for this type of installation comes with limitations on the ablity to add contributions.  Submitting a review, editing and translating the docs, or any kind of code contribution is not possible from a packaged installation.   

> **Important Development Notes:**
> 
> - Please note that the ARM64 release is currently an alpha release (not fully tested). If you have one of these machines, do join us on our [developer channel](https://t.me/superalgosdevelop) to help us fully test this release! 

### Docker Installations

Docker installations are another avenue that allows for an easy and clean installation of the Superalgos Platform. While a little more techincal than the packaged applications, it offers the ability to install the platform in a clean and isolated enviroment. 

You can find a walk through for docker installations in our [Docker Guide](Docker/README.md).

Traditional docker installations are not meant to be development environments. Meaning that you cannot submit a review, edit and translate the docs, or any kind of code contribution.  That being said, there is a custom docker image that will allow you to install the platform in a development compatible configuration.  You can find the image and a walk through for installing it [here](https://hub.docker.com/r/martinb78/superalgos-docker-develop).

> **IMPORTANT:**
> 
> Please note that the development compatible docker image is not the standard meathod to install Superalgos for contributing. If you are new to contributing, or are not an expereinced developer, it is recommended that you follow the steps for a standard techincal installation.

#### Pros and Cons of Docker Installations

The main purpose of docker installations are for production instances.  This is because the Superalgos Platform will be installed in a nice and clean environment that can be controlled separately from the rest of your computer. This makes it a perfect candidate for users who wish to set up an instance of the platform to run dependably without interruption.

Being aimed at production, this means that standard docker installations are not a good option for users looking to contribute to the ecosystem. Youw will not be able to create a User Profile for the Governance system, submite a review, edit and translate the docs, or contribute any kind of code.     

The development compatible docker installation is for special use cases. For example, using a local NAS to host the platform while still being able to add contributions. This is a nonstandard way of installing Superalgos and is only recommended for users who are comfortable using docker and dealing with potential pitfalls of installing using his method. 

### Contributors Installation

It is also possible to install the Superalgos Platfrom from source code. This is the most pure (albeit more techincal) way of installing Superalgos. There are no limitations to contributing (highly appreciated and rewarded with SA tokens) and gives the user the most freedom for custom configurations.

> **Note**: 
> 
> If you are just starting out and want to contribute, this is the recommended meathod of installation to follow.

All procedures (other than pre-requisites) are the same for Windows, Linux, or Mac OS. Raspberry Pi terminal commands have been included for ease of use.

> **IMPORTANT:**
> 
> Remote installations and minimalist hardware — both virtual and physical — are better suited for production deployments, where the use of the GUI is minimal. We highly recommend learning Superalgos in a local installation. Mastering the system takes time, and the use of the GUI to go through in-app tutorials is crucial during the learning process. Your experience will be orders of magnitude better if you follow this advice: leave remote installations and minimalist hardware for when you are ready to start trading live.

#### Pre-Requisites

In order to run Superalgos on your computer, you will need the latest versions of Node JS and Git installed. You will also need a web browser to access the interface. Google Chrome is recommended because it is the most tested browser being used by the development team and power users.

Follow the installation wizards to install the latest NodeJS, and Git. If desired also install Chrome.
- [Node.js download page](https://nodejs.org/en/download/)
- [Git download page](https://git-scm.com/downloads)
- [Google Chrome download page](https://www.google.com/chrome/)

#### Windows Pre-Requisites (Optional)

For windows users interested in trying out the machine learning features of the platform (TensorFlow), Python will need to be installed.
- [install Python 3.9](https://www.python.org/downloads/release/python-390/).

For contributors that are Windows users, Github Desktop is a helpful tool to manage contributions.  You can install it using the following link.
- [GitHub Desktop download page](https://desktop.github.com/). Click the "Download for Windows" button and follow the wizard to install after the download completes.


#### Mac OS Pre-Requisites (Optional)

Rather than manually installing NodeJS, Git, and Python, [Homebrew](https://brew.sh/) can be used to install the requirements with minimal effort on Mac OS.  After you clone the repository, change directory to the Superalgos base and install the requirements using Homebrew. 

> **Note**: 
> 
> Python 3 is only required for running machine learning (TensorFlow).

There are two ways to use Homebrew.  The first is to type:

```sh
brew install git node npm python@3.9
```

The second is to use the `Brewfile` included in the code repository. After downloading, run this command in the same directory where the `Brewfile` resides:

```sh
brew bundle
```

> **Note**: 
> 
> You can use Safari or Google Chrome as your default browser. If you run into a bug in Safari, you will be asked to reproduce it in Chrome as the development team uses Chrome.

#### Linux (e.g. Ubuntu, or Raspberry Pi running Raspberry Pi OS/Raspbian) Pre-Requisites

[Follow the Node.js package manager install instructions](https://nodejs.org/en/download/package-manager/) for your distribution to ensure you are getting the latest version of Node.js. Many distributions only maintain an older version in their default repositories. Python 3 is only required for running machine learning (TensorFlow).

```sh
curl -sL https://deb.nodesource.com/setup_17.x | sudo -E bash - && sudo apt-get \
install -y \
nodejs npm git python3
```

You may verify the installed versions with this command string:

```sh
node \
-v && npm \
-v && git --version
```

If you are running headless (i.e. as a server without a monitor attached) then you do not need to install a web browser and you can follow the tutorial for information on connecting remotely to the server.

Alternatively, you can use [https://github.com/nymea/berrylan](https://github.com/nymea/berrylan) to setup a tool for using bluetooth to quickly assign WPA2 access on a WLAN on a Raspbian based Distro. Nymea also has tools for automation of IoT products to allow setting up SuperAlgos as a timed function without needing to learn how to code.

> **IMPORTANT**: 
> 
> If you are having node version errors there is a chance you may need to read the information in the Debian Pre-Requisites section and use NVM to handle node versions. This is due to some distributions having out of date repositories in the package manager lists.

#### Debian or Debian WSL/WSL2 Pre-Requisites
(NVM & NPM Fix)

Debian distributions have been found to have some additional issues with installing the right version of NodeJS needed to run Superalgos. What follows are the steps to fix this issue.

For this to work you will need to [use NVM to install and control node] (https://github.com/nvm-sh/nvm)

- You will need to remove any versions of node already installed on Debian due to the repositories currently being out of date.
- __This is necessary before proceeding.__ 

```sh
sudo apt \
remove nodejs -y && \
```

```sh
sudo apt \
update && apt upgrade \
-y sudo apt \
install npm -y
```

```sh
sudo apt \
autoremove -y && \
sudo apt autoclean -y
```

```sh
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

_Without running the next 3 commands, you will need to logout of your shell/WSL2 user account before you are to use NVM_
 
```sh
export NVM_DIR="$HOME/.nvm"
```

```sh
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

```sh
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

_Make sure things are up to date and packages not needed are removed_


```sh
sudo apt update \
sudo apt upgrade && \
apt autoremove -y
```

```sh
cd
```

into the directory of SuperAlgos
and __run the install commands as follows__:

```sh
nvm run node <command string/var>
```

> **Note**: 
> 
> This is for node.js/node only, npm should work fine with Debian.

### WSL2 VSCode IDE Environment Setup (Optional) 

VSCode is a poplular IDE used by contributors to develop Superalgos. This short section covers some helpful tips for setting up the IDE's development enviroment.

There are a few things that need configured to obtain full functionality from VSCode. These configurations will make it possible to run notebooks for ML/AI algos and turn VSCode and Windows into a development bench for working with Superalgos.

On windows:
- First you need to install WSL and WSL2 [https://docs.microsoft.com/en-us/windows/wsl/install](https://docs.microsoft.com/en-us/windows/wsl/install) then reboot if promoted.
  - You may want to review the Docker WSL2 Backend information for VSCode as well before proceeding. [https://aka.ms/vscode-remote/containers/docker-wsl2](https://aka.ms/vscode-remote/containers/docker-wsl2)
  - Install Debian or Ubuntu from the Windows Store, Setup the VM as instructed.
  
On windows and Debian:
To make managing these WSL instances a lot easier, we will now move to installing VSCode + Tools to allow for Dockerizing and rapidly deploying as well as editing and manging test/usage cases of SuperAlgos edit and forks you create and contribute.
- Install VSCode [https://code.visualstudio.com/docs/?dv=win64user](https://code.visualstudio.com/docs/?dv=win64user)
  - Install the remote container and remote docker plugins/extensions for Visual Studio Code [https://code.visualstudio.com/docs/remote/containers#_installation](https://code.visualstudio.com/docs/remote/containers#_installation) 
    - _You may want to spend time reading the specifics of this documentation on their website._ 
  - *When prompted* install shell shortcuts for right click options, this way you can open Superalgos really easy inside of VSCode.

> **IMPORTANT**: 
> 
> As mentioned above, you need to remove node.js/node from your system and install NVM if you are using Debian.
> Please refer to the information above for properly setting up node.js and npm on Debian systems with complications regarding versions of node.

Once the install finishes you can now use VSCode as an interactive IDE/Shell to access SuperAlgos, run Dockers for working with SuperAlgos and more.


## Superalgos Platform Client Installation

Now that you have all the pre-requisites and optional enviroment configurations set up, now we can get to the core installations of Superalgos!

### Fork the Superalgos Repository

- Scroll the page all the way to the top. Find and click the **Fork** button to create your fork/copy of this repository. To fork Superalgos you need a Github account. If you don't have one, go ahead and create it.

> **NOTE**
> 
> A Fork is required for your contributions to the project. The reason why Superalgos is free and open-source is that the project has set up a [collective business](https://superalgos.org) in which all users may participate. The way to participate is to [contribute](https://superalgos.org/community-contribute.shtml) to make Superalgos better. The project's [token](https://superalgos.org/token-overview.shtml) is distributed among contributors.

### Clone Your Fork

- Once the fork is created, you will land on the page of your fork. Copy the URL from your browser's address bar.
- In your computer/laptop/server, open a command prompt or terminal. Make sure you are in a directory where you have write permissions (on most systems the terminal will open in your user's home directory, so you're good). Clone the git repository using the command:

```sh
git clone <URL of your Superalgos fork>
```

For example, if your Github username is John, the command will look like this:

```sh
git clone https://github.com/John/Superalgos
```

This creates the `Superalgos` folder in the current directory, which contains the whole installation.

### Install Node Dependencies

After the Superalgos directory has been installed, the final step of installation is to set up the necessary node dependencies. In the same command prompt or terminal you just used, type the following:

```sh
cd Superalgos
```

That should take you inside the Superalgos folder created by the `git clone` command earlier. Now type `node setup` to install the dependencies.

```sh
node setup
```

By default, desktop shortcuts are created if they can be. Currently, Mac OS shortcuts are not created. Linux installations may require extra steps to view and use the shortcuts.

Available Options:

```sh
usage: node setup <options>
```

| Option | Description |
| --- | --- |
| `noShortcuts` | Do not install desktop shortcuts |
| `tensorflow` | Include the TensorFlow dependencies |

> **NOTE FOR WINDOWS USERS INSTALLING TENSORFLOW DEPENDENCIES:**
> 
> You may get an error at the end of the set up process. If you do, please follow the instructions following the error message.

> **NOTE FOR USERS INSTALLING MULTIPLE INSTANCES OF SUPERALGOS ON THE SAME MACHINE:**
> 
> In order to avoid name conflicts between shortcuts, make sure to rename each Superalgos directory before running `node setup`.

Congratulations your installation is complete! Follow the "Running the Application" directions below.

#### Troubleshooting Dependency Installation

If you are having difficulty running the node setup command here are a few common issues that may be getting in the way.

1. Check the version of node and npm you have installed. Make sure that you are running an updated version of node greater than version 12 and npm greater than version 5. You can check which version you have by typing `node -v` and `npm -v` into a command prompt or terminal. If your version numbers are below these, you can update your installation by following the instructions outlined in the "Node JS Installation" step above.
2. If you are installing Superalgos in an administratively protected directory you will need to do one of the following:
   - For Windows start your command prompt as an administrator.
   - For Linux and Mac Systems make sure to add the sudo command to node setup.  This will look like `sudo node setup`.
3. For Windows it is important that you have C:\Windows\System32 added to your global PATH.  For instructions on how to do this google "add to the path on Windows 10."

#### Enable Desktop Shortcut in Ubuntu

The majority of shortcuts that are automatically installed will work out of the box. Desktop shortcuts on Ubuntu, however, require a few additional steps to set up. First, desktop icons need to be enabled within the Tweaks app.

- Check if Tweaks is installed.
- If not go to Ubuntu Software.
- Install Tweaks.
- Open Tweaks.
- Under extensions turn on Desktop Icons

![enable-ubuntu-shortcut](https://user-images.githubusercontent.com/55707292/117553927-f0780300-b019-11eb-9e36-46b509653283.gif)

> **TIP:** If you do not see the desktop shortcut appear right away you may need to restart your computer.

Finally, you will need to enable the desktop shortcut. Right click Superalgos.desktop and select Allow Launching.

![allow-launching](https://user-images.githubusercontent.com/55707292/117553933-fcfc5b80-b019-11eb-872c-4fad81b184d2.gif)

Now both launcher and desktop shortcuts will launch Superalgos like any other program on your computer.

### Installation Notes

- You need to make a fork so that you may contribute work. Superalgos is a Community project and you are expected to contribute, like everyone else. You don't need to be a technical person to contribute. Fixing a typo in the docs or translating a paragraph into your native language are valuable contributions too. Superalgos has built-in features that make contributing easy. Help make Superalgos better and Superalgos will better serve you! Free-riding is not cool, particularly on free, open-source, Community-driven projects.
- The software includes an in-app self-update command / feature. It will help you stay up-to-date with the latest version of the software. Updates are on-demand, so don't worry about undesired updates. The project moves very fast and new features become available regularly, particularly if you choose to run the software in the `develop` branch (you may switch branches from within the app).
- It is a good idea to periodically run the `node setup` command to keep the underlying dependencies for your Superalgos installation up to date.
- Before installing the client on a remote computer in an attempt to access the UI from a different machine, we highly recommend you do a standard installation on your PC / laptop first. Leave your Raspberry Pi or VPS for later, once you have done all available tutorials. This single tip will save you a lot of time: you don't need to add complexity before you learn how to handle the app, and the GUI performs best in a local installation.

### Uninstall

Superalgos writes nothing outside of the `Superalgos` folder other than shortcut files. In order to quickly remove the shortcut files, open a terminal or command prompt, navigate to your main Superalgos directory, and type the following command:

```sh
node uninstall
```

Then simply delete the `Superalgos` folder to completely remove the application.

## Usage

### Run the Client and GUI

#### Using the shortcuts

If you ran `node setup` with no options above, then you should see a desktop icon which you can double click to launch the Superalgos application. A terminal window will show the server is running, and a browser window will open with the WebUI.

#### Using the Command Line

To run Superalgos, go to the Superalgos directory/folder and run this command:

```sh
node platform
```

Available Options:

```sh
usage: node platform <options>
```

| Option | Description |
| --- | --- |
| `minMemo` | Run with minimal memory footprint. This is critical for running on platforms with less than 8GB of ram, like a Raspberry Pi. |
| `noBrowser` | Do not attempt to open the WebUI in a browser. This is useful on headless servers where a UI is not available. |

The Client will run on your terminal and the GUI will launch on your default browser. If Chrome/Safari is not your default browser, copy the URL, close the browser, open Chrome/Safari, and paste the URL. Be patient... it takes a few seconds to fully load the GUI.

A Welcome Tutorial pops-up automatically. You must do this Tutorial to finish the setup and to learn the basics. It's the ultimate onboarding experience, superior to all other resources available, including videos and the Docs.

![run-the-system-01](https://user-images.githubusercontent.com/13994516/107037804-e5fc6200-67bb-11eb-82f2-d0f40247fa14.gif)

### Usage Notes

We are testing the UI on Google Chrome and Safari on macOS only. It may work on other browsers as well &mdash; or not. If you are running on a different browser and ever need support, make sure you mention that fact upfront, or even better, try on Chrome/Safari first.

> **TIP:**
> 
> If your computer has 8 GB of RAM or less, use `node platform minMemo` to run the system with minimal RAM requirements.

### Running Superalgos on a Headless Linux Server as a Daemon

If you're running Superalgos on a headless linux server like a Raspberry Pi, you might want to run it as a daemon so it isn't attached to your current login session. The easiest, most standard way to go about this is probably using `systemd`. Most linux distributions use it as default init system/service manager.

#### Using Systemd

Create a `superalgos.service` file looking like this (change `<user>` to your user name and `/path/to/Superalgos` to your Superalgos folder, for instance `/home/John/Superalgos`):

```ini
[Unit]
Description=Superalgos Platform Client

[Service]
Type=simple
User=<user>
WorkingDirectory=/path/to/Superalgos
ExecStart=/usr/bin/node platform minMemo noBrowser

[Install]
WantedBy=multi-user.target
```

There is no need to run Superalgos as root so we're running it as a user. The `minMemo` option assumes you're running on a small machine like a Raspberry Pi, while `noBrowser` makes sense for running daemonized. Now, you'll need to move the file to `/etc/systemd/system/` in order for it to be recognized. You'll need then to enable and start the service.

```sh
sudo mv superalgos.service /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl enable superalgos
sudo systemctl start superalgos
```

To see the output of Superalgos, use:

```sh
journalctl -u superalgos
```

or to follow the output with `-f`:

```sh
journalctl -u superalgos -f
```

### Workspace Refactoring for Version 1

Verion 1.0.1 carries with it a reorganization of the codebase where several projects where extracted from Foundations : Data-Mining, Algorithmic Trading, Machine Learning and Community Plugins.

This means that these projects can now have a project leader and a team working on them.

In order to get your custom workspace upgraded to be compatible with beta 13 you will need to make a few changes:

Project nodes need to be present at the workspace for things to work. The presence of the node of a project, somehow, enables that projects features at a workspace. Go to the workspace node and click add missing projects.

At the Plugins hierarchy, new guys appear, each one with their own type of plugins. Meaning that every workspace needs to be manually fixed, because currently all plugins are loaded from Foundations node there. The fix is easy though, it takes 2 - 3 min to delete the child nodes from the foundation node, and add the same plugins from the project they actually belong now.


## Welcome Tutorial

Once the app finishes loading, an interactive tutorial takes you by the hand and walks you all around the system while you learn the basic skills required to use the interface, mine data, backtest strategies, and even run a live trading session. It is highly recommended you follow the tutorial until the end, as it is carefully crafted to make your onboarding as easy as possible. Tutorials are the absolute best way to tackle the learning curve. You should do all tutorials before you start exploring other avenues on your own.

![welcome-tutorial-00](https://user-images.githubusercontent.com/13994516/107038771-4a6bf100-67bd-11eb-92e0-353525a972a9.gif)

> **NOTE:**
> 
> The tutorial uses Binance or Binance US as the exchange of choice. If you don't have an account with Binance or Binance US, you will still be able to follow 100% of the tutorial. When you get to the live trading section, keep going even if you don't intend to run the session. You may learn how to work with other exchanges later on.

## What is the Superalgos Platform?

Superalgos Platform is a set of tools to automate crypto-trading. It is implemented as a Node JS Client + Web App that runs on your hardware and scales from a single Raspberry Pi to a Trading Farm. The Platform is fully functional and has been used for trading live since 2020.

At a future version, trading signals will be able to be sent to the Suerpalgos Network from the Superalgos Platform.

### Superalgos Platform Features

- A Visual Scripting Designer.
- Integrated Charting System.
- A Visual Strategy Debugger.
- Data Mining Tools.
- Coordinated Task Management across a Trading Farm.
- Community-built strategies to learn and start from.
- TensorFlow Machine Learning integration.
- In-App Tutorials.
- Complete In-App Documentation.
- SA Token / Project Governance System.
  
### Superalgos Development Pipeline

- **Superalgos P2P Network:** Will allow the project to distribute trading intelligence produced by algo-traders.
- **Trading Signals:** Will allow providers to broadcast trading signals and be rewarded with SA Tokens.
- **Superalgos Mobile:** Will allow users to consume trading signals for free and autonomously execute trades from their mobile phones.
- **Ethereum Integration:** Will allow mining data from an Ethereum network node, and bring it into the Superalgos workflow.

### Superalgos is User-centric

- No ads, anywhere.
- No sign-up / logins.
- No user/usage data collection of any kind.
- No user trading information collected or sold.
- Runs 100% on uncompiled code anyone can read and audit.

### Superalgos Platform Allows You To

- Visually design your trading strategies.
- Visually debug your trading strategies.
- Visually design your indicators.
- Visually design your plotters to visualize indicators or mined data.
- Visually design your data-mining operations.
- Download historical market data from crypto exchanges.
- Backtest your strategies against historical data.
- Run live trading sessions.
- Run arbitrary data-mining operations of any size.
- Feed your trading strategies with the data mined.
- Use your token holdings to vote and influence the direction of the project development.
- Produce real-time trading signals and send them via the p2p network. (under development)

### Superalgos Platform for Developers

- You may use Superalgos as a platform or as a component of a larger system.
- No proprietary code/libraries. All open-source and free.
- Superalgos features a library of community-contributed plugins (workspaces, strategies, indicators, plotters, tutorials, etc.).

### Superalgos Platform Saves You Time

- No need to code the download of historical data from crypto exchanges.
- No need to code the streaming of market data from crypto exchanges.
- No need to hardcode strategies. Use the visual designer for a more flexible approach.
- No need to debug what went wrong, line by line, or dive into log files with tons of data. You can see each variable of the state of the Trading Engine at every candle by hovering the mouse over the charts.
- No need to integrate a charting library, Superalgos features an integrated Charting System.
- No need to manage task data or execution dependencies. Superalgos allows you to define Tasks and distribute them across a Trading Farm and takes care of the data and execution dependencies so that each task automatically starts when their dependencies are ready.

### Superalgos Platform is Permissionless

- Don't like the UI?
- Don't like the icons used?
- Don't like the Charting System?
- Don't like the Visual Designer?
- Don't like the Visual Debugger?
- Don't like the Docs?
- Don't like the Trading Bot?
- Don't like the Indicators?
- Don't like the Plotters?
- Don't like any other part of the system?

No problem, code or integrate libraries with your own version of any component and we promise we will merge your work and provide it as an alternative to users. We believe in Permissionless Innovation and that users, not team members, are the final judges and the ones who decide what they prefer to use. You are free to create an alternative for any part of the system that you believe that should work or should have been done in a different way. We will help you integrate your vision into the next release and enable a way for users to choose between different implementations of the same functionality. You will also be granted the title of maintainer of the functionality you provide and have decision power on how it evolves in the future.

### Superalgos Platform for Algo-Traders

- Superalgos is easy to install/uninstall.
- Superalgos is easy to run.
- Superalgos is easy to use.
- Superalgos is easy to learn.
- Superalgos is easy to debug.
- Superalgos is well documented.
- You have free online support via Telegram and Discord.

### Superalgos Platform Saves You Money

- There are no paid plans or anything that costs you money.
- There is no locked functionality. You may use the full capacity of the software.
- There is no limit to the number of backtests you may run.
- There is no limit to the number of live sessions you may run.
- There is no limit to the number of historical data you may download.
- There is no limit to the volume of data you may process.
- You may use all the plugins available (indicators, plotters, strategies, etc.)
- You may install Superalgos in as many machines as you wish.
- Your installations may be used by as many people as required.
- You may connect to as many crypto exchanges as you wish.

### Superalgos Platform Minimizes Risks

- No one can know what strategies you design/run.
- No one can front-run you.
- No one can steal your trading ideas.
- No one knows how much capital you trade.
- No one can see your exchange keys.

### Superalgos Platform for Companies

- No need to buy expensive software for monitoring crypto markets or trading execution.
- No need to hire your own developers.
- All your employees can use Superalgos for free.
- You can use Superalgos to its full capacity or just the features you are currently interested in.
- Superalgos may be integrated into your existing operation, feeding to and from other systems.
- You've got a growing community of algo-traders constantly improving the software at zero cost for you.
- You've got free online customer support via Telegram or Discord.

## Support

We just opened a brand new [Discord server for Support and the Community](https://discord.gg/CGeKC6WQQb).

We also meet on several Telegram groups, where it all started!

> **BEWARE OF IMPERSONATORS — SCAMMERS ARE LURKING!**
> 
> Superalgos Admins, the Core Team, and Community Mods will never contact you directly unless you contact them first. We will never ask you for API keys, coins, or cash. In fact, we will never ask you to trust us in any way. Our [Community Safety Policy](https://superalgos.org/community-safety-policy.shtml) explains why. In short, we want to make it clear that if someone contacts you directly claiming to work with or for the project, it is a scam. Please report scammers in the Community group so that they may be banned, and to increase awareness of the problem, but also block them and report them to Telegram if the option is available.

- Via Telegram
  - Online support through our [Superalgos User's Support Group](https://t.me/superalgossupport).
- In-App Integrated Documentation
  - Superalgos features interactive documentation built-in the system.
- Video Tutorials
  - Subscribe to the [Superalgos YouTube Channel](https://www.youtube.com/channel/UCmYSGbB151xFQPNxj7KfKBg).
- In-App Tutorials
  - There are many interactive tutorials you may do and learn from.

## Other Resources

- Web Site
  - For an overview of what Superalgos can do for you, check the [Superalgos Website](https://superalgos.org/).
- Telegram
  - For official news, join the [Superalgos Announcements Channel](https://t.me/superalgos).
  - Meet other users in the [Superalgos Telegram Community Group](https://t.me/superalgoscommunity).
  - Meet developers in the [Superalgos Telegram Developer's Group](https://t.me/superalgosdevelop).
  - Users meet in other topic-specific Telegram Groups. There's a [complete list of groups](https://superalgos.org/community-join.shtml) on the website.
- Blog
  - Find official announcements and various articles on the [Superalgos Blog](https://medium.com/superalgos).
- Twitter
  - To stay in the loop, follow [Superalgos on Twitter](https://twitter.com/superalgos).
- Facebook
  - Or follow [Superalgos on Facebook](https://www.facebook.com/superalgos).

## Contributing

Superalgos is a Community Project built by users for users. Learn [how you may contribute](https://superalgos.org/community-contribute.shtml).

## License

Superalgos is open-source software released under [Apache License 2.0](LICENSE).
