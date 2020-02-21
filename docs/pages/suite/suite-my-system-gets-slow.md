---
title:  My System Gets Slow
summary: "Understand how the system uses the available hardware so that you may implement workarounds and best practices."
sidebar: suite_sidebar
permalink: suite-my-system-gets-slow.html
---

Dynamically rendering all the visual features in the system puts a significant load on the machine's graphics processing unit (GPU). Running multiple tasks at the same time is demanding on the central processing unit (CPU). Depending on your machine's capacity, this may result in the system getting slow and sometimes even unresponsive.

If you experience such symptoms, there are several workarounds you may implement to mitigate them.

{% include note.html content="Learn about the [system requirements](suite-system-requirements.html) to better understand what to expect in terms of the performance of your hardware." %}

## Display Less Data on the Charts

If you are zooming out too far in the horizontal time scale with too many candles on the screen, try zooming-in a bit or changing time frames so that candle density decreases.

You may also want to switch off the layers you may not be using. Remember, every piece of graphical information you see on the screen represents data your system is reading from your disk and processing to display in a graphical form.

## Close Unused Hierarchies

The physics that govern nodes in the design space help structures of nodes to self-organize. This comes at a cost in terms of GPU processing power.

Make sure the two exiting data mine hierarchies are closed:

* Hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>M</kbd> (*M* for *Masters*) to go the the Masters team hierarchy and click ![minus](https://user-images.githubusercontent.com/13994516/70234850-d7528f00-1761-11ea-8a0b-d77ac483a0ea.png) if the hierarchy is open.

* Hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>S</kbd> (*S* for *Sparta*) to go the the Sparta team hierarchy and click ![minus](https://user-images.githubusercontent.com/13994516/70234850-d7528f00-1761-11ea-8a0b-d77ac483a0ea.png) if the hierarchy is open.

* Hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>M</kbd> (*N* for *Network*) to go the the Network hierarchy and click ![minus](https://user-images.githubusercontent.com/13994516/70234850-d7528f00-1761-11ea-8a0b-d77ac483a0ea.png) if the hierarchy is open.

You may also want to close any of the structures of nodes that you may not be using in the trading system.

## Freeze the Nodes You Need to Remain Visible

You will find that freezing the nodes that you need to remain visible contributes to reducing the load in your GPU.

## Stop Tasks That You May Not Need to Run at All Times

Data mining is a CPU-intensive activity. If you are designing a strategy, you probably don't need to have a live stream of information being processed in realtime. Learn to segment your activities and only start the tasks that you need for the work you are doing.

{% include important.html content="If these workarounds do not solve your problem and you often experience slowness or unresponsiveness when using your computer, you may want to consider upgrading your equipment. You shouldn't risk your capital with an insufficient trading infrastructure." %}