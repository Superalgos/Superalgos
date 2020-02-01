---
title:  Using Indicators Not Included in the Data Release
summary: ""
sidebar: suite_sidebar
permalink: suite-using-non-included-indicators.html
---

Using indicators not included in the data release requires performing a couple of tasks that will set you up to use the said indicators efficiently. 

Each indicator will produce a dataset spanning the whole market and will require running the corresponding bot instance to keep the dataset up-to-date all the time, or at least when you need it—for instance—to trade live.

This means that you may need to be mindful of which indicators you will set up to use.

If you have plenty of disk space and a machine with plenty of processing power and memory, you are free to set up all of the indicators at once. If that is not the case, then you will be better off setting up only the indicators that you intend to use.

> **NOTE:** The setup process described below is a temporary solution to the early stage limitations that characterize an beta stage product. We expect the experience to improve significantly in upcoming releases. That said, rest assured that—while the setup guide may seem long—it is actually quite easy to follow and takes only 3 minutes to execute.

**Let's say you wish to set yourself up to use the standard setting of the MACD indicator, that is, the (12, 26, 9) setting. This is what you need to do:**

## 1. Run the MACD Bot Instance to Produce the Datasets

Because this set of indicators have *data and status dependencies* with the bots in the *Masters Datasets*, you need to make sure the Master bots are running first. So, go ahead and *Run All Tasks* in the *Masters Datasets* task manager.

Now you can hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>I</kbd> (*I* for *Indicators*) to go to the *Sparta Datasets* task manager find the task controlling the MACD bot instance, and click *Run* on the menu.

As the image below shows, each bot that you run will show a notice under its *Daily* process of the date up to which data has been processed so far. To see process instances you first need to click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) in the bot instance menu.

[![Setting up indicators](https://user-images.githubusercontent.com/13994516/70346176-f9313c00-185d-11ea-9cf2-18b036a711ba.gif)](https://user-images.githubusercontent.com/13994516/70346176-f9313c00-185d-11ea-9cf2-18b036a711ba.gif)

## 2. Link the Trading Bot Data Dependency to the Corresponding Datasets

Now you need to establish a referense between *Jason*, the trading bot, and each of the datasets you intend to use, in our case, the *MACD122609* product.

This is what you need to do:

**a.** Locate Team Masters hitting <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>M</kbd> (*M* for *Masters*). Click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the menu to open the definition.

**b.** Now hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>M</kbd> (*J* for *Jason*) to find the trading bot definition. This definition is like the *source code* of the bot, represented by a hierarchy of nodes. Click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the menu to open the definition.

**c.** Look around for the *Multi-Period* process definition, and find one of its offspring nodes named Process Dependencies. Click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the menu to open the definition.

[![Jason-01](https://user-images.githubusercontent.com/13994516/70349517-259c8680-1865-11ea-80e3-09e67627c6b9.gif)](https://user-images.githubusercontent.com/13994516/70349517-259c8680-1865-11ea-80e3-09e67627c6b9.gif)

**d.** Click on the *rotational symmetry* setting of the process dependencies node and add two new data dependencies. Releasing the rotational symmetry setting before creating the data dependencies results in the dependencies being created without the rotational symmetry property, as nodes inherit the properties of their parents.

![Jason-02-Data-Dependencies](https://user-images.githubusercontent.com/13994516/70349729-99d72a00-1865-11ea-8f15-1130d7f78222.gif)

**e.** Now name one of the data dependencies *MACD 122609 Market* and the other one *MACD 122609 Daily*.

![Jason-03-Data-Dependencies](https://user-images.githubusercontent.com/13994516/70349731-99d72a00-1865-11ea-92f7-4cab6b68c620.gif)

**f.** Locate Team Sparta hitting <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>S</kbd> (*S* for *Sparta*). Follow the line to the left to find the MACD indicator bot definition and click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the menu to open the definition.

**g.** Locate the *MACD 122609* product definition and click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the menu. You will see the *Multi-Period-Market* and *Multi-Period-Daily* dataset definitions.

![Sparta-01-MACD](https://user-images.githubusercontent.com/13994516/70351065-63e77500-1868-11ea-9eed-a410ecf0d7ee.gif)

**h.** All you need to do is establish a reference between each data dependency you created at the *Multi-Period* process definition in Jason and the corresponding dataset in the *MACD 122609* product definition of the MACD indicator bot. 

So, go back to Jason, left-click on the *MACD 122609 Market* data dependency and hit <kbd>Ctrl or &#8984;</kbd> + <kbd>&#8594;</kbd> to start panning to the right, dragging the data dependency. You will pan to the right because the Sparta team is spatially located to the right of the Masters team. Keeping the key combination pressed works like a charm and flys you across the workspace at lightning speed.

Once you are in the vicinity of the MACD indicator definition, stop, take a pause and pin the data dependency so that it doesn't fly back to its parent node. Now locate the *Multi-Period-Market* dataset, right-click on the data dependency you just drag and link it to the corresponding dataset.

[![Sparta-02-MACD-Drag-Dependency](https://user-images.githubusercontent.com/13994516/70351647-aeb5bc80-1869-11ea-94fe-0a8cea4e3987.gif)](https://user-images.githubusercontent.com/13994516/70351647-aeb5bc80-1869-11ea-94fe-0a8cea4e3987.gif)

That's it! Now, do the same with the second data dependency and link it to the remaining dataset and you are good to go!

If you wish to use other products of MACD, simply repeat this operation, and the same goes for setting yourself up with any other indicators.
