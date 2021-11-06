# Superalgos测试版12

![贡献者](https://img.shields.io/github/contributors-anon/Superalgos/Superalgos?label=Contributors)
![拉动-活动](https://img.shields.io/github/issues-pr-closed-raw/Superalgos/Superalgos?color=blueviolet)
![最后提交](https://img.shields.io/github/last-commit/Superalgos/Superalgos/develop?label=last%20commit%20to%20develop)
![机器人友好度](https://img.shields.io/badge/Bot%20Friendliness%20Level-119%25-yellow)

## 目录

- [目录](#table-of-contents)
- [简介](#introduction)
- [入门指南](#getting-started-guide)
- [前提条件](#pre-requisites)
  - [Windows 安装](#windows-install)
  - [Mac OS  安装](#mac-os-install)
  - [Linux   安装 (例如：运行Raspberry Pi OS/Raspbian的Raspberry Pi)](#linux-install--eg-raspberry-pi-running-raspberry-pi-os-raspbian-)
- [Superalgos平台客户端的安装](#superalgos-platform-client-installation)
  - [Fork Superalgos资源库](#fork-the-superalgos-repository)
  - [克隆你的 Fork](#clone-your-fork)
  - [安装Node的依赖性](#install-node-dependencies)
    - [依赖性安装的故障排除](#troubleshooting-dependency-installation)
    - [在Ubuntu中启用桌面快捷方式](#enable-desktop-shortcut-in-ubuntu)
  - [安装说明](#installation-notes)
  - [卸载](#uninstall)
- [使用方法](#usage)
  - [运行客户端和GUI](#run-the-client-and-gui)
    - [使用快捷方式](#using-the-shortcuts)
    - [使用命令行](#using-the-command-line)
  - [使用说明](#usage-notes)
  - [在Linux服务器上以守护程序方式运行Superalgos](#running-superalgos-on-a-headless-linux-server-as-a-daemon)
    - [使用Systemd](#using-systemd)
  - [Docker部署](#docker-deployments)
- [欢迎使用教程](#welcome-tutorial)
- [什么是Superalgos平台？](#what-is-the-superalgos-platform-)
  - [Superalgos平台的特点](#superalgos-platform-features)
  - [超强的开发管道](#superalgos-development-pipeline)
  - [Superalgos是以用户为中心的](#superalgos-is-user-centric)
  - [Superalgos平台使您能够](#superalgos-platform-allows-you-to)
  - [面向开发者的Superalgos平台](#superalgos-platform-for-developers)
  - [Superalgos平台为您节省时间](#superalgos-platform-saves-you-time)
  - [Superalgos平台是无许可的](#superalgos-platform-is-permissionless)
  - [为交易商提供的Superalgos平台](#superalgos-platform-for-algo-trders)
  - [Superalgos平台为您省钱](#superalgos-platform-saves-you-money)
  - [Superalgos平台使风险最小化](#superalgos-platform-minimizes-risks)
  - [Superalgos平台使风险最小化](#superalgos-platform-for-companies)
- [支持](#support)
- [其他资源](#other-resources)
- [贡献](#contributing)
- [许可证](#license)

## 简介

Superalgos不只是另一个开源项目。我们是一个开放和欢迎的社区，通过项目原生的[Superalgos (SA) Token](https://superalgos.org/token-overview.shtml)设计、培养和激励，建立一个[开放的交易智能网络](https://superalgos.org/)。

只要你加入[Telegram社区小组](https://t.me/superalgoscommunity)或新的[Discord服务器](https://discord.gg/CGeKC6WQQb)，你就会发现它的不同之处!

> 迫不及待地想做出贡献？请在本页右上角给这个版本库打一颗星吧!

![superalgos-readme](https://user-images.githubusercontent.com/13994516/106380124-844d8980-63b0-11eb-9bd9-4f977b6c183b.gif)

## 入门指南

所有程序在Windows、Linux或Mac OS上都是一样的。为了便于使用，Raspberry Pi的终端命令已经包括在内。

> **重要提示:**
>
> 远程安装和最小化的硬件--包括虚拟的和物理的--更适合于生产部署，在这里对GUI的使用是最小的。我们强烈建议在本地安装中学习Superalgos。掌握这个系统需要时间，在学习过程中，使用GUI来浏览应用内的教程是非常重要的。如果你遵循这个建议，你的体验会好很多：把远程安装和最小化的硬件留给你准备开始现场交易的时候。

## 前提条件

为了在你的电脑上运行Superalgos，你需要安装最新版本的Node JS和Git。你还需要一个网络浏览器来访问界面。推荐使用谷歌浏览器，因为这是开发团队所使用和支持的。

- [Node.js download page](https://nodejs.org/en/download/)
- [Git download page](https://git-scm.com/downloads)
- [Google Chrome download page](https://www.google.com/chrome/)

### Windows安装

你可以使用windows安装程序（Setup文件），它将为你安装所有必要的依赖和文件，以运行该平台。同时放置快捷方式。这个应用程序将通知你，并在新版本到来时更新（即将发布）。

 **重要提示:**
 单一可执行文件和安装程序还没有激活Tensorflow。

> **注意事项**
> 有一个已知的问题，即屏幕保持白色。在这种情况下，进入 "查看/重新加载"，它应该可以工作。

> **注意事项**
> 该应用程序还没有签名。杀毒软件可能会将该文件标记为不安全。你可以强制安装和运行，或者寻找已签名的应用程序。

手动安装选项，专为有经验并希望为项目做出贡献的用户定制（高度赞赏并有SA代币的奖励）。按照安装向导来安装最新的NodeJS和Github桌面应用程序。

- [Node.js下载页面](https://nodejs.org/en/download/). 选择 "当前"，然后选择 "Windows安装程序"，然后在下载完成后按照向导进行安装。
- [GitHub桌面下载页面](https://desktop.github.com/). 点击 "为Windows下载 "按钮，下载完成后按照向导进行安装。
- [谷歌浏览器的下载页面](https://www.google.com/chrome/). 安装完成后，建议将Chrome设置为默认浏览器。
- 如果你打算运行机器学习功能（TensorFlow），你也必须[安装Python 2](https://www.python.org/downloads/release/python-2718/)。

### Mac OS安装

你可以使用MacOS安装程序（DMG文件），它将为你安装所有必要的依赖和文件，以运行该平台。同时还放置了快捷方式。这个应用程序将通知你，并在新版本到来时更新（待发布）。

> **注意事项**
> 该应用程序没有签名。为了能够运行，你必须在 "系统偏好">"安全与隐私">"常规">"无论如何都要打开 "中允许它。

[Homebrew](https://brew.sh/)可以用来在Mac OS上以最小的努力来安装需求。 克隆仓库后，改变目录到Superalgos基地，使用Brewfile安装需求。只有在运行机器学习（TensorFlow）时才需要Python 3。

```sh
brew install git node npm python@3.9
```

Or use the `Brewfile` 包括在代码库中。下载后，在`Brewfile`所在的同一目录下运行此命令。

```sh
brew bundle
```

你可以使用Safari或谷歌浏览器作为你的默认浏览器。如果你在Safari浏览器中遇到一个错误，你会被要求在Chrome浏览器中重现，因为开发团队使用Chrome浏览器。

### Linux安装（如运行Raspberry Pi OS/Raspbian的Raspberry Pi）。

[按照你的发行版的Node.js包管理器安装说明](https://nodejs.org/en/download/package-manager/)，以确保你得到最新版本的Node.js。许多发行版在其默认的仓库中只维护一个较旧的版本。Python 3仅在运行机器学习（TensorFlow）时需要。

```sh
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs npm git python3
```

你可以用这些命令验证已安装的版本。

```sh
node -v
npm -v
git --version
```

如果你正在运行无头程序（即作为一个没有连接显示器的服务器），那么你不需要安装网络浏览器，你可以按照教程了解远程连接到服务器的信息。

## Superalgos平台客户端的安装

### Fork Superalgos资源库

- 将页面一直滚动到顶部。找到并点击**Fork**按钮，创建你的Fork/拷贝的版本库。要Fork Superalgos，你需要一个Github账户。如果你没有，就去创建它吧。

> **注意事项**
>
> 你对项目的贡献需要一个Fork。Superalgos之所以是免费和开源的，是因为该项目建立了一个[集体事业](https://superalgos.org)，所有用户都可以参与其中。参与的方式是[贡献](https://superalgos.org/community-contribute.shtml)，使Superalgos变得更好。项目的[代币](https://superalgos.org/token-overview.shtml)会在贡献者之间分配。

### 克隆你的Fork

- 一旦创建了Fork，你将登陆到你的Fork页面。从你的浏览器的地址栏复制URL。
- 在你的电脑/笔记本/服务器上，打开一个命令提示符或终端。确保你在一个你有写权限的目录中（在大多数系统中，终端会在你的用户的主目录中打开，所以你很好）。使用命令克隆git仓库。

```sh
git clone <URL of your Superalgos fork>
```

For example, if your Github username is John, the command will look like this:

```sh
git clone https://github.com/John/Superalgos
```

这将在当前目录下创建`Superalgos'文件夹，其中包含整个安装。

###安装节点依赖

在Superalgos目录安装完毕后，安装的最后一步是设置必要的节点依赖关系。在你刚才使用的同一个命令提示符或终端中，输入以下内容。

```sh
cd Superalgos
```

这将使你进入先前由`git clone`命令创建的Superalgos文件夹。现在输入 "node setup "来安装依赖项。

```sh
node setup
```

默认情况下，如果可以的话，会创建桌面快捷方式。目前，Mac OS的快捷方式没有被创建。Linux安装可能需要额外的步骤来查看和使用快捷方式。

可用的选项:

```sh
usage: node setup <options>
```

| Option        | Description                         |
| ------------- | ----------------------------------- |
| `noShortcuts` | Do not install desktop shortcuts    |
| `tensorflow`  | Include the TensorFlow dependencies |

> **安装tensorflow依赖项的windows用户须知:**
>
> 在设置过程的最后，你可能会得到一个错误。如果你这样做，请按照错误信息后的说明进行操作。

> **在同一台机器上安装多个superalgos实例的用户须知:**
>
> 为了避免快捷方式之间的名称冲突，确保在运行`node setup'之前重新命名每个Superalgos目录。

恭喜你，你的安装已经完成 请按照下面的 "运行应用程序 "说明进行操作。

#### 依赖性安装的故障排除

如果你在运行节点安装命令时遇到困难，这里有几个常见的问题可能会妨碍你。

1. 检查你所安装的node和npm的版本。确保你运行的node版本大于12，npm版本大于5的更新版本。你可以通过在命令提示符或终端中输入`node -v`和`npm -v`来检查你的版本。如果你的版本号低于这些，你可以按照上面 "Node JS安装 "步骤中的说明来更新你的安装。
2. 如果你在一个受管理保护的目录下安装Superalgos，你将需要执行以下操作之一。
   - 对于Windows系统，以管理员身份启动你的命令提示符。
   - 对于Linux和Mac系统，确保在节点设置中添加sudo命令。 这将看起来像`sudo node setup`。
3. 对于Windows来说，重要的是你要把C:\Windows\System32添加到你的全局PATH中。 关于如何做到这一点的说明，谷歌 "添加到Windows 10的路径"。

#### 在Ubuntu中启用桌面快捷方式

大多数自动安装的快捷方式都是开箱即用的。然而，Ubuntu上的桌面快捷方式需要一些额外的步骤来进行设置。首先，桌面图标需要在Tweaks应用程序中被启用。

- 检查Tweaks是否已经安装。
- 如果没有，请进入Ubuntu软件。
- 安装Tweaks。
- 打开Tweaks。
- 在扩展项下打开桌面图标

![enable-ubuntu-shortcut](https://user-images.githubusercontent.com/55707292/117553927-f0780300-b019-11eb-9e36-46b509653283.gif)

> **提示：**如果你没有马上看到桌面快捷方式出现，你可能需要重新启动计算机。

最后，你将需要启用桌面快捷方式。右击Superalgos.desktop，选择允许启动。

![allow-launching](https://user-images.githubusercontent.com/55707292/117553933-fcfc5b80-b019-11eb-872c-4fad81b184d2.gif)

现在，启动器和桌面快捷方式都可以像电脑上的其他程序一样启动Superalgos。

### 安装说明

- 你需要建立一个fork，以便你可以贡献工作。Superalgos是一个社区项目，你应该像其他人一样作出贡献。你不需要是一个技术人员来做贡献。修正文档中的一个错别字或者把一段话翻译成你的母语也是有价值的贡献。Superalgos有内置的功能，使贡献变得容易。帮助Superalgos变得更好，Superalgos也会更好地服务于你。搭便车是不好的，尤其是在免费的、开源的、社区驱动的项目上。
- 该软件包括一个应用内的自我更新命令/功能。它将帮助你保持与软件的最新版本同步。更新是按需进行的，所以不用担心不需要的更新。该项目进展非常快，新的功能经常出现，特别是如果你选择在`develop`分支中运行该软件（你可以在应用程序中切换分支）。
- 定期运行 "node setup "命令以保持Superalgos安装的底层依赖性是一个好主意。
- 在远程计算机上安装客户端以试图从不同的机器上访问用户界面之前，我们强烈建议你先在你的PC/笔记本电脑上进行标准安装。把你的树莓派或VPS留到以后，一旦你完成了所有可用的教程。这个建议将为你节省很多时间：在你学会如何处理这个应用程序之前，你不需要增加复杂性，而且GUI在本地安装时表现最好。

### 卸载

Superalgos在 "Superalgos "文件夹之外没有写任何东西，只有快捷方式文件。为了快速删除快捷方式文件，请打开终端或命令提示符，导航到您的Superalgos主目录，并输入以下命令。

```sh
node uninstall
```

然后简单地删除 "Superalgos "文件夹以完全删除该应用程序。

## 使用方法

### 运行客户端和GUI

#### 使用快捷方式

如果你运行了`node setup`，上面没有任何选项，那么你应该看到一个桌面图标，你可以双击它来启动Superalgos应用程序。一个终端窗口将显示服务器正在运行，一个浏览器窗口将打开，并显示 WebUI。

#### 使用命令行

要运行Superalgos，请进入Superalgos目录/文件夹，运行这个命令。

```sh
node platform
```

Available Options:

```sh
usage: node platform <options>
```

| Option      | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `minMemo`   | 以最小的内存占用率运行。这对于在内存不足8GB的平台上运行至关重要，如Raspberry Pi。 |
| `noBrowser` | 不要试图在浏览器中打开 WebUI。这在没有用户界面的无头服务器上很有用。 |

客户端将在你的终端上运行，图形用户界面将在你的默认浏览器上启动。如果Chrome/Safari不是您的默认浏览器，请复制该URL，关闭浏览器，打开Chrome/Safari，并粘贴该URL。请耐心等待......需要几秒钟才能完全加载图形用户界面。

一个欢迎教程会自动弹出。你必须通过这个教程来完成设置和学习基本知识。这是最终的入职体验，优于所有其他可用资源，包括视频和文件。

![run-the-system-01](https://user-images.githubusercontent.com/13994516/107037804-e5fc6200-67bb-11eb-82f2-d0f40247fa14.gif)

### 使用说明

我们只在MacOS上的Google Chrome和Safari上测试用户界面。它可能在其他浏览器上也能运行，或者不能。如果你在不同的浏览器上运行，并且需要支持，请确保你事先提及这一事实，或者最好先在Chrome/Safari上试用。

> **技巧:**
>
> 如果你的电脑有8GB或更少的内存，使用`node platform minMemo`来运行系统，对内存的要求最小。

### 在无头的Linux服务器上作为一个守护程序运行Superalgos

如果你在Raspberry Pi这样的无头Linux服务器上运行Superalgos，你可能想把它作为一个守护程序来运行，这样它就不会与你当前的登录会话相连。最简单、最标准的方法可能是使用`systemd`。大多数Linux发行版都使用它作为默认的初始系统/服务管理器。

#### 使用Systemd

创建一个 "superalgos.service "文件，内容如下（将"<user>"改为你的用户名，"/path/to/Superalgos "改为你的Superalgos文件夹，例如"/home/John/Superalgos"）。

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

没有必要以root身份运行Superalgos，所以我们要以用户身份运行它。`minMemo`选项假定你是在Raspberry Pi这样的小型机器上运行，而`noBrowser`则对运行daemonized有意义。现在，你需要把文件移到`/etc/systemd/system/`，以便让它被识别。然后，你需要启用并启动该服务。

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

### Docker部署

参见[Docker Readme for more information](Docker/README.md)。

### 13版工作区重构

Beta 13对代码库进行了重组，其中几个项目从Foundations中提取出来。数据挖掘，算法交易，机器学习和社区插件。

这意味着这些项目现在可以有一个项目负责人和一个团队为其工作。

为了使你的自定义工作区升级到与测试版13兼容，你需要做一些改变。

项目节点需要在工作区存在，事情才能进行。一个项目的节点的存在，以某种方式，使该项目在工作区的功能。进入工作区节点，点击添加丢失的项目。

在插件的层次结构中，出现了新的家伙，每一个都有自己的插件类型。这意味着每个工作区都需要手动修复，因为目前所有插件都是从基础节点加载的。修复方法很简单，只需2-3分钟，从基础节点中删除子节点，然后从项目中添加相同的插件，它们现在实际上属于。


## 欢迎教程

一旦应用程序完成加载，一个交互式的教程就会牵着你的手，在你学习使用界面、挖掘数据、回测策略、甚至运行实时交易会话所需的基本技能时，带领你走遍整个系统。强烈建议你跟着教程走到最后，因为它是精心设计的，使你的入职尽可能容易。教程是解决学习问题的绝对最佳方式。在你开始自行探索其他途径之前，你应该做所有的教程。

![welcome-tutorial-00](https://user-images.githubusercontent.com/13994516/107038771-4a6bf100-67bd-11eb-92e0-353525a972a9.gif)

> **注意：**
>
> 本教程使用Binance或Binance US作为选择的交易所。如果您没有Binance或Binance US的账户，您仍然可以100%地学习本教程。当您进入实时交易部分时，即使您不打算运行该环节，也要继续下去。你以后可能会学到如何与其他交易所合作。

## 什么是Superalgos平台？

Superalgos平台是一套用于加密货币交易自动化的工具。它是以Node JS客户端+Web应用程序的形式实现的，在你的硬件上运行，可以从单个树莓皮扩展到一个交易农场。该平台功能齐全，自2020年以来一直用于现场交易。

在Beta 12，交易信号将能够从Superalgos平台发送到Suerpalgos网络。

### Superalgos平台的特点

- 一个可视化的脚本设计器。
- 综合图表系统。
- 可视化策略调试器。
- 数据挖掘工具。
- 整个交易场的协调任务管理。
- 社区建立的策略，可以学习和开始。
- TensorFlow机器学习集成。
- 应用内教程。
- 完整的应用内文档。
- SA代币/项目治理系统。

### Superalgos开发管道

- **Superalgos P2P网络：**将允许该项目分发由算法交易商产生的交易情报。
- **交易信号：**将允许提供者广播交易信号并获得SA代币的奖励。
- **Superalgos移动：**将允许用户免费消费交易信号，并从他们的手机上自主执行交易。
- **以太坊集成：**将允许从以太坊网络节点挖掘数据，并将其引入Superalgos工作流程。

### Superalgos是以用户为中心的

- 没有广告，任何地方。
- 没有注册/登录。
- 没有任何形式的用户/使用数据的收集。
- 不收集或出售用户的交易信息。
- 100%运行于任何人都可以阅读和审计的未编译的代码。

### Superalgos平台允许你

- 直观地设计您的交易策略。
- 可视化地调试您的交易策略。
- 可视化地设计你的指标。
- 可视化地设计你的绘图器，使指标或挖掘的数据可视化。
- 可视化地设计你的数据挖掘操作。
- 从加密货币交易所下载历史市场数据。
- 根据历史数据回测你的策略。
- 运行实时交易时段。
- 运行任何规模的任意数据挖掘操作。
- 用挖掘出来的数据为您的交易策略提供支持。
- 使用你的代币持有量来投票并影响项目的发展方向。
- 产生实时交易信号并通过p2p网络发送。(开发中)

### Superalgos平台的开发者

- 你可以把Superalgos作为一个平台或者作为一个更大的系统的组成部分。
- 没有专有的代码/库。所有的开源和免费。
- Superalgos有一个由社区贡献的插件库（工作空间、策略、指标、绘图仪、教程等）。

### Superalgos平台为您节省时间

- 不需要编码从加密货币交易所下载历史数据。
- 不需要对加密货币交易所的市场数据流进行编码。
- 不需要硬编码策略。使用可视化设计器以获得更灵活的方法。
- 不需要逐行调试出错的地方，也不需要潜入有大量数据的日志文件。你可以通过将鼠标悬停在图表上，看到交易引擎在每个蜡烛上的状态的每个变量。
- 不需要集成一个图表库，Superalgos的特点是集成了图表系统。
- 不需要管理任务数据或执行依赖性。Superalgos允许你定义任务，并将其分配到整个交易农场，并负责处理数据和执行的依赖关系，以便每个任务在其依赖关系准备好后自动启动。

### Superalgos平台是无权限的

- 不喜欢用户界面？
- 不喜欢使用的图标？
- 不喜欢图表系统？
- 不喜欢视觉设计器？
- 不喜欢可视化调试器？
- 不喜欢文档？
- 不喜欢交易机器人？
- 不喜欢指标？
- 不喜欢绘图仪？
- 不喜欢系统的任何其他部分？

没问题，用你自己版本的任何组件进行编码或集成库，我们承诺我们将合并你的工作，并作为替代方案提供给用户。我们相信无许可创新，用户，而不是团队成员，是最终的裁判，是决定他们喜欢使用什么的人。你可以自由地为系统的任何部分创造一个你认为应该工作或应该以不同方式完成的替代品。我们将帮助你将你的设想整合到下一个版本中，并使用户能够在相同功能的不同实现方式中进行选择。你也将被授予你所提供的功能的维护者的称号，并对它在未来的发展有决定权。

### Superalgos平台的Algo-Trders

- Superalgos很容易安装/卸载。
- Superalgos很容易运行。
- Superalgos很容易使用。
- Superalgos很容易学习。
- Superalgos很容易调试。
- Superalgos有很好的文档。
- 你可以通过Telegram和Discord获得免费的在线支持。

### Superalgos平台让你省钱

- 没有付费计划或任何花费你金钱的东西。
- 没有锁定的功能。你可以使用该软件的全部容量。
- 你可以运行的回测数量没有限制。
- 你可以运行的实时会话的数量没有限制。
- 你可以下载的历史数据的数量是没有限制的。
- 你可以处理的数据量是没有限制的。
- 您可以使用所有可用的插件（指标、绘图仪、策略等）。
- 您可以将Superalgos安装在任何您想要的机器上。
- 您的安装可以根据需要由很多人使用。
- 您可以根据您的需要连接到任意多的加密货币交易所。

### Superalgos平台将风险降到最低

- 没有人可以知道你设计/运行什么策略。
- 没有人可以领先你。
- 没有人可以窃取你的交易理念。
- 没有人知道你的交易资本有多少。
- 没有人可以看到你的交易所钥匙。

### Superalgos公司的平台

- 不需要购买昂贵的软件来监控加密货币市场或交易执行。
- 不需要雇用你自己的开发人员。
- 您的所有员工都可以免费使用Superalgos。
- 您可以完全使用Superalgos，或者只使用您目前感兴趣的功能。
- Superalgos可以集成到您现有的操作中，与其他系统进行反馈。
- 您有一个不断增长的算法交易员社区，他们不断地改进软件，而您却不需要付出任何代价。
- 你已经有了通过Telegram或Discord的免费在线客户支持。

## 支持

我们刚刚开设了一个全新的[支持和社区的Discord服务器](https://discord.gg/CGeKC6WQQb)。

我们还在几个Telegram群组中开会，这一切都始于此

> **谨防冒名顶替 - 骗子潜伏其中！**。
>
> Superalgos管理员、核心团队和社区版主绝不会直接联系你，除非你先联系他们。我们永远不会要求你提供API密钥、硬币或现金。事实上，我们永远不会要求你以任何方式信任我们。我们的[社区安全政策]（https://superalgos.org/community-safety-policy.shtml）解释了原因。简而言之，我们想明确指出，如果有人直接联系你，声称与项目合作或为项目工作，这就是一个骗局。请在社区组中报告骗子，这样他们可能会被禁止，并提高对这个问题的认识，但如果有这个选项的话，也可以阻止他们并向Telegram报告。

- 通过Telegram
  - 通过我们的[Superalgos用户支持小组](https://t.me/superalgossupport)进行在线支持。
- 应用内集成文档
  - Superalgos的特点是系统内置互动文档。
- 视频教程
  - 订阅【Superalgos YouTube频道】(https://www.youtube.com/channel/UCmYSGbB151xFQPNxj7KfKBg)。
- 应用内教程
  - 有很多互动教程，你可以做和学习。

## 其他资源

- 网站
  - 关于Superalgos能为你做什么的概述，请查看[Superalgos网站](https://superalgos.org/)。
- 电报
  - 了解官方新闻，请加入[Superalgos公告频道](https://t.me/superalgos)。
  - 在[Superalgos Telegram Community Group](https://t.me/superalgoscommunity)中认识其他用户。
  - 在[Superalgos Telegram Developer's Group](https://t.me/superalgosdevelop)中与开发者会面。
  - 用户在其他特定主题的Telegram组中会面。网站上有一个[完整的小组列表](https://superalgos.org/community-join.shtml)。
- 博客
  - 在[Superalgos博客](https://medium.com/superalgos)上查找官方公告和各种文章。
- 推特
  - 要想了解情况，请关注[Superalgos的Twitter](https://twitter.com/superalgos)。
- 脸书
  - 或关注[Superalgos on Facebook](https://www.facebook.com/superalgos)。

## 贡献

Superalgos是一个由用户为用户建立的社区项目。了解[你如何贡献](https://superalgos.org/community-contribute.shtml)。

## 许可证

Superalgos是根据[Apache License 2.0](LICENSE)发布的开源软件。
