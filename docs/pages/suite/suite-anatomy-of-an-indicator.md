---
title:  Anatomy of an indicator
summary: ""
sidebar: suite_sidebar
permalink: suite-anatomy-of-an-indicator.html
---

The tools available for you to turn an existing dataset into a new, value-added product, are scattered througout the definitions of the indicator itself.

We will dive into Paula and Chris—two of the indicators that ship with the platform—to learn how these bots are structured. 

| Masters Team | Paula | Chris |
| :---: | :---: | :---: |
| ![team](https://user-images.githubusercontent.com/13994516/70050816-24066080-15d0-11ea-83c4-f16b71007ecb.png) | ![bot-indicator](https://user-images.githubusercontent.com/13994516/67079733-000fcc80-f194-11e9-98d7-3426dd956d65.png) | ![bot-indicator](https://user-images.githubusercontent.com/13994516/67079733-000fcc80-f194-11e9-98d7-3426dd956d65.png) |

It is highly recommended that you follow this exploration directly on the platform, so that you may clearly see the relationship among nodes and play with the hierachy as we advance. 

Paula and Chris are offspring nodes of the Masters Team hierarchy. 

To find the Masters team, hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>M</kbd> (*M* for *Masters*) and click ![plus](https://user-images.githubusercontent.com/13994516/70042962-121cc180-15c0-11ea-8322-018f78524f39.PNG) on the menu. 

To find Paula, hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>P</kbd> (*P* for *Paula*).

To find Chris, hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> (*C* for *Chris*).

> **NOTE:** At this moment, only Paula's definitions are complete and fully set up in the Masters Team. You may explore the indicators in the Sparta Team for more examples (hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Alt</kbd> + <kbd>S</kbd> (*C* for *Sparta*)).

## Top Level Structure

Paula is the indicator building Bollinger Channels and Bollinger SubChannels (along with chanels and subchannel objects, used by plotters), based on the Bollinger Bands created by Chris.

| Process Definition | Product Definition |
| :---: | :---: |
| ![process-definition](https://user-images.githubusercontent.com/13994516/68941695-e075bf00-07a6-11ea-9386-3fd0f3979719.png) | ![product-definition](https://user-images.githubusercontent.com/13994516/68941696-e075bf00-07a6-11ea-9a6c-8c2b7d8dd6f7.png) |

We established earlier that bots run *processes* which create *products*. As such, the first order of business to describe an indicator bot is to define its processes and products.

[![image](https://user-images.githubusercontent.com/13994516/68942711-8cb8a500-07a9-11ea-9e87-8fac12e3a143.png)](https://user-images.githubusercontent.com/13994516/68942711-8cb8a500-07a9-11ea-9e87-8fac12e3a143.png)

> **NOTE:** When we analyze the way in which nodes are represented within a hierarchy, it may be important to note the *order* in which they are displayed around its parent object. In this case, the first child node of Paula is the Multi-Period-Market Process Definition, as it is the first in the clock-wise direction from the line chaining Paula to its parent node, the Masters Team. In most cases, the order of nodes around its parent determine the order of execution, or the order in which nodes are computed in whatever process is involved.

An indicator may have several several processes and several products. In the case of Paula, she has two processes and four products.

The reason why Paula has two processes is related to the products Paula creates and the way each dataset is structured. 

The Multi-Period-Market process stores data in *market files* while the Multi-Period-Daily process stores files in the *daily file* type of dataset. This is a common occurence in most indicators. The reason is that this is the desired behavior so that data may be consumed efficiently both in the lower and higher frequency time periods.

