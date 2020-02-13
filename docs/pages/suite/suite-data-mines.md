---
title:  Data Mines
summary: "Data mines enable the processing of data by consuming datasets others have produced, performing calculations, and outputting a new value-added data product that others may consume."
sidebar: suite_sidebar
permalink: suite-data-mines.html
toc: false
---

Superalgos puts a powerful data processing and visualization system in your hands. Use it to the fullest and you will see your *intelligence* increase by orders of magnitude.

Anyone may access raw trades and order book data from exchanges. Anyone may access information in the form of standard indicators and technical studies. 

However, Superalgos allows you to perform any sort of processing over existing information, store the results into new datasets, and make them accessible from within trading strategies. Moreover, it allows you to produce ellaborate graphical representations of data, which is instantly browsable over the charts.

Data mines' functionality is highly flexible and works under the same paradigm used for building strategies. They provide a visual interface and a framework that leads you through the process of creating new bots, with minimal coding skills required.

The vast majority of the complexity of processing data is handled internally by the bots, and you don't need to deal with it or even understand it. The system isolates complexity and only exposes you to the crucial elements that impact what you wish to accomplish.

This section of the documentation provides you with the technical understanding of how data is handled by the platform. The core of the functionality this section unveils covers—in essence—the following points:

* The capacity to define any number of calculation processes that may feed on each other's outputs, resulting in a wealth of *information* that may be consumed by trading strategies.

* The properties and characteristics of datasets resulting from the execution of such processes&mdash;how and where they are stored, in what format, how they are consumed internally, and potentially, by other systems.

* The capacity to visualize the data over the charts and browse it with all the features built in the charting system.

Let's start with a basic definition...

{% include /data_mine/data-mine.md heading="" icon="150-" adding="####" configuring="####" starting="" content="yes" definition="bold" table="yes" more="yes" %}

<table class='hierarchyTable'><thead><tr><th><a href='#data-mine' data-toggle='tooltip' data-original-title='{{site.data.data_mine.data_mine}}'><img src='images/icons/data-mine.png' /><br />Data Mine</a></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></thead><tbody>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#indicator-bot' data-toggle='tooltip' data-original-title='{{site.data.data_mine.indicator_bot}}'><img src='images/icons/indicator-bot.png' /><br />Indicator Bot</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#plotter' data-toggle='tooltip' data-original-title='{{site.data.data_mine.plotter}}'><img src='images/icons/plotter.png' /><br />Plotter</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>

{% include /data_mine/indicator-bot.md heading="###" icon="" adding="" configuring="" starting="" content="no" definition="yes" table="yes" more="no" %}

{% include /data_mine/plotter.md heading="###" icon="" adding="" configuring="" starting="" content="no" definition="yes" table="yes" more="no" %}