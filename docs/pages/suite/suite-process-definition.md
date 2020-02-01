---
title:  Process Definition
summary: ""
sidebar: suite_sidebar
permalink: suite-process-definition.html
---

## Introduction

| Process Output | Process Dependencies | Status Report | Execution Started Event | Execution Finished Event |
| :---: | :---: | :---: | :---: | :---: |
| ![process-output](https://user-images.githubusercontent.com/13994516/68943479-9a6f2a00-07ab-11ea-9fc2-1899344e8a7c.png) | ![process-dependencies](https://user-images.githubusercontent.com/13994516/68943478-9a6f2a00-07ab-11ea-8506-5b998c83d74d.png) | ![status-report](https://user-images.githubusercontent.com/13994516/68943480-9b07c080-07ab-11ea-96bb-6fb28b0a442c.png) | ![execution-started-event](https://user-images.githubusercontent.com/13994516/68945122-f20f9480-07af-11ea-8f39-9681694631fc.png) | ![execution-finished-event](https://user-images.githubusercontent.com/13994516/68943476-9a6f2a00-07ab-11ea-8a00-3d6ea1c77302.png) |

[![image](https://user-images.githubusercontent.com/13994516/68975616-06758080-07f4-11ea-8859-399c650aa733.png)](https://user-images.githubusercontent.com/13994516/68975616-06758080-07f4-11ea-8859-399c650aa733.png)

The two fundamental nodes of a process that need to be defined are the *process output* and the *process dependencies*. We will explore these two in detail.

You know from earlier explanations what a status report is. Status reports are handled internally by the bot and there isn't much more you need to know about them at this point. We will get back to status reports later on. 

The *execution started event* and the *execution finished event* are too going to be described in detail. 

## Process Output

| Output Dataset |
| :---: |
| ![output-dataset](https://user-images.githubusercontent.com/13994516/68977580-d9779c80-07f8-11ea-9c3b-a63d14138465.png) |

**The *process output* defines which datasets are impacted by the process. This definition is represented by the *output dataset* nodes under *process output* referencing the *dataset definition* of each of Paula's product.**

For the sake of clarity, let's expand on the above statement.

We stated earlier that Paula offeres four different products. Each of this products stores two datasets, one in the *market file* type of structure and one in the *daily file* type. These products are created by two processes: one of them creates the market file for each of the products, and the other one creates the daily files.

[![Indicators-Process-Output-01](https://user-images.githubusercontent.com/13994516/68976798-f01cf400-07f6-11ea-9ffb-198b5853a220.gif)](https://user-images.githubusercontent.com/13994516/68976798-f01cf400-07f6-11ea-9ffb-198b5853a220.gif)

The image above shows that relationship.

What we can see in the image above is the definition of the *process output* **of the Multi-Period-Market process**. Notice how the *process output* node has four offspring nodes named *output dataset*. One of the *output dataset* nodes **is referencing the Market** *dataset definition* of the Bollinger Channels *product definition*.

The rest of the *output dataset* nodes are linked to the corresponding Market *dataset definition* of the rest of Paula's products, which are out of the boundaries of the image.

Similarly, the *output dataset* nodes of the Multi-Period-Daily process are linked to the Daily *dataset definition* of each product. Feel free to go and check for yourself.

> **NOTE:** Notice how this link is represented by a faint grey dotted line, instead of an orange or yellow dotted line. As you already know, yellow (or orange) lines denote a hierarchical relationship between nodes. On the other hand, a grey dotted line represents a [reference](References)].

**The ultimate effect of establishing a reference from the *output dataset* to a product *dataset definition* is that—upon execution—every time the process finishes a processing cycle, it triggers an event that may be consumed by other entities. These events indicate that the corresponding datasets (the ones impacted by the process as per the *process output* definition) have been updated.**

An example of other entities that may be listening to such events is that of plotters. Plotters read datasets and create graphical representations of this data over the charts. You surely have noticed that the charts are constantly updating the information in form of candles and indicators in realtime, syncronized with the data being extracted from the exchange by Charly, the sensor bot. That kind of automatism is possible thanks to the events processes trigger every time an execution cycle is finished, signaling to everyone listening that new data is available on each of the impacted datasets.

## Process Dependencies

| Status Dependency |
| :---: |
| ![status-dependency](https://user-images.githubusercontent.com/13994516/68991345-0dd17400-085e-11ea-9146-5adb7094a08e.png) |

**The definition of *status dependencies* tell us which other processes the process depends on.**

There are three kinds of status dependencies:

* **Self Reference** is mandatory, as a process will always need to read it's own status report every time it weaks up.

* **Market Starting Point** is a status dependency existing on Multi-Period-Daily processes (processes that store datasets in the *daily file* structure) so that the process knows the datetime of the start of the market. Usually, this will come from Charly's Hitoric-Trades process status report. Multi-Period-Market processes do not have this type of status dependency as the date of the start of the market is implied in their own dataset (a single file with all market data).

* **Market Ending Point** is a status dependency existing both in Multi-Period-Market and Multi-Period-Daily processes so that the process knows the datetime of the end of the market.

[![Indicators-Process-Dependencies-01](https://user-images.githubusercontent.com/13994516/68991956-dfa36280-0864-11ea-87ec-f0e4e3b7bf0f.gif)](https://user-images.githubusercontent.com/13994516/68991956-dfa36280-0864-11ea-87ec-f0e4e3b7bf0f.gif)

The image above shows Paula's Multi-Period-Market process status dependencies. As explained above, both the ```Self Reference``` and ```Market Ending Point``` are present.

Paula builds different types of Bollinger Channels based on the Bollinger Bands created by Chris. That is why the Market Ending Point status dependency links to Chris' Multi-Period-Market status report. Paula needs to know up to what date Chris has updated its datasets so that she knows up to which date to process her own.

Bear in mind that all of these bots need to be autonomous and resilient. Figure that Chris may be manually stopped, it's data may be erased, or something else may happen that makes Chris fall behind. In such cases, if Paula finds that her data is up to date with Chris' or maybe even further ahead in datetime, she will not run until Chris catches up. 

This means Paula will preserve her dataset so that other's may relie on it and use it independently of the fate of Chris' dataset.

| Data Dependency |
| :---: |
| ![data-dependency](https://user-images.githubusercontent.com/13994516/68991343-0dd17400-085e-11ea-8cb2-dc144082370c.png) |

**The definition of *data dependencies* tell us which datasets the processes uses as input.**

The concept is quite straightforward. Paula depends on Chris' datasets as input to build her own.

In the image below, you will see Paula's Multi-Period-Market process *data dependecy* linking to Chris' Multi-Period-Market *dataset definition* of the Bollinger Bands product. 

[![Indicators-Process-Dependencies-02](https://user-images.githubusercontent.com/13994516/68993034-7840df00-0873-11ea-804d-d24e88ce25f7.gif)](https://user-images.githubusercontent.com/13994516/68993034-7840df00-0873-11ea-804d-d24e88ce25f7.gif)

## Execution Started Event & Execution Finished Event

**The *execution started event* is the event that triggers the execution of a process. The *execution finished event* is the event that processes trigger once they have finished an execution cylce.**

You may think as the *execution finished event* as an event that is broadcasted to whoever wants to listen. It is the action of a process letting the world know it has finished its execution cycle.

This comes very handy for processes that need to wait for other processes to finish in order to start their own execution.

We have already established that Paula has a *data dependency* with Chris' datasets and that she reads Chris' status reports to know up to which datetime Chris has updated his datasets.

The one missing piece of information Paula requires is when she should run. By linking Paula's processes *execution started event* with Chris' processes *execution finished events* Paula knows exactly when to start her processes, right after Chris' have finished.

That link is what you can see in the below image.


[![Indicators-Process-Execution-Started-Finished-Events-01](https://user-images.githubusercontent.com/13994516/68993254-39605880-0876-11ea-9ee7-9f49976bd2dc.gif)](https://user-images.githubusercontent.com/13994516/68993254-39605880-0876-11ea-9ee7-9f49976bd2dc.gif)
