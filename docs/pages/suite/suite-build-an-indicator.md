---
title:  Build an Indicator
summary: ""
sidebar: suite_sidebar
permalink: suite-build-an-indicator.html
---

## Introduction

We will go through the process required to set up a new indicator bot from scratch, using the Simple Moving Average (SMA) indicator that ships with the platform as example.

The indicator's *Popular* product calculates the SMA on 20, 50, 100 and 200 periods, using Olivia's candles as input, storing two datasets of market and daily files.

You may follow these sets of instructions to build your first indicator. If that is what you are doing, you will follow the same process described herein, but some of the actions may vary depending on what exactly you are trying to achieve.

In that sense, a little planning is in order before you start. You will need to ask yourself some questions so that you have a clear idea of what you wish to do:

* What dataset do you need as input? Is it available? Which of the existing bots produces the dataset you need as input?

* What products do you intend to build? 

* What type of files will you be producing as outputs? Do you wish your indicator to be available in all timeperiods?

Let's get on with the task at hand...

Remember instructions will be given as if you were builing the SMA indicator. You should adapt this guide to fit your purpouse.

## Add Team and Indicator

Go to your workspace, select *Add Team* and edit its configuration with the following code:

```js
{
"codeName": "YourTeamName"
}
```
In this case, the team's name is *Sparta*.

> **NOTE:** Needless to say, the code offered here is to be customized with the details corresponding to your own bot.

Within your team, select *Add Indicator Bot* and edit its configuration as follows:

```js
{
"codeName": "YourBotName",
"repo": "YourBotName-Indicator-Bot"
}
```

## Multi-Period-Market Process Definition

Within the indicator, select *Add Process Definition*, label it as *Multi-Period-Market* and edit its configuration as follows:

```js
{
  "codeName": "Multi-Period-Market",
  "description": "Describe what the process does.",
  "startMode": {
    "allMonths": {
    "run": "false",
    "minYear": "",
    "maxYear": ""
  },
  "oneMonth": {
    "run": "false",
    "year": "",
    "month": ""
  },
  "noTime": {
      "run": "true"
    },
    "fixedInterval": {
      "run": "false",
      "interval": 0
    }
  },
  "deadWaitTime": 0,
  "normalWaitTime": 0,
  "retryWaitTime": 10000,
  "sleepWaitTime": 3600000,
  "comaWaitTime": 86400000,
  "framework": {
    "name": "Multi-Period-Market",
    "startDate": {
    },
    "endDate": {
    }
  }
}
```
  
Within the *Process Definition*, select *Add Missing Items*.

Go to the *Process Output* node recently added and select *Add Output Dataset*. The process will have one single output as the indicator has a single product.

Go to the *Process Dependencies* node and add two *Status Dependencies*.

Link the first *Status Dependecy* to the *Status Report* of the *Process Definition* to establish a reference, label it *Self*, and edit its code as follows:

```js
{
  "mainUtility": "Self Reference"
}
```

> **NOTE:** It is good practice to use the label on top of nodes, in particular of those that are referencing other nodes, to describe precisely such relationships, as they may not be obvious when the node they link to is hidden. This makes references easier to track, and data becomes more usable in general.

Link the second *Status Dependency* to the *Status Report* of team Masters' Olivia's *Multi-Period-Market* *Process Definition*, label it as *Ending: Olivia*, and edit its code as follows:

```js
{
  "mainUtility": "Market Ending Point"
}
```

Go back to the *Process Dependencies*, select *Add Data Dependency*, labelling the node as *Olivia Candles*. Link this dependency to Olivia's *Multi-Period-Market* *Dataset Definition* of the Candles *Product Definition*.

Go to the *Execution Started Event*, label it as *Olivia* and link it to Olivia's *Multi-Period-Market* *Process Definition* *Execution Finished Event*.

> **NOTE:** Notice how the label may be more or less descriptive depending on what node you are dealing with. For instance, we named the *Data Dependency* as *Olivia Candles*, because such a dependency may be linked to any of Olivia's products. However, we named the *Execution Started Event* simply *Olivia*, because such event will most likely be referencing the matching type of process (in this case *Multi-Period-Market*).

With this, the Multi-Period-Market process is defined.

## Multi-Period-Daily Process Definition

Let's proceed to define the Multi-Period-Daily process.

Within the indicator, select *Add Process Definition*, label it as *Multi-Period-Daily* and edit its configuration as follows:

```js
{
  "codeName": "Multi-Period-Daily",
  "description": "Describe what the process does.",
  "startMode": {
    "allMonths": {
      "run": "false",
      "minYear": "",
      "maxYear": ""
    },
    "oneMonth": {
      "run": "false",
      "year": "",
      "month": ""
    },
    "noTime": {
      "run": "true"
    },
    "fixedInterval": {
      "run": "false",
      "interval": 0
    }
  },
  "deadWaitTime": 0,
  "normalWaitTime": 0,
  "retryWaitTime": 10000,
  "sleepWaitTime": 3600000,
  "comaWaitTime": 86400000,
  "framework": {
    "name": "Multi-Period-Daily",
    "startDate": {
      "takeItFromStatusDependency": 0
    },
    "endDate": {
      "takeItFromStatusDependency": 1
    }
  }
}
```
  
Within the *Process Definition*, select *Add Missing Items*. Activate the *rotational symetry* option in each of the item's menu so that they get in order of precedence around the *Process Definition* node.

Go to the *Process Output* node recently added and select *Add Output Dataset*. The process will have one single output as the indicator has a single product.

Go to the *Process Dependencies* node and add three *Status Dependencies*.

Link the first *Status Dependecy* to the *Status Report* of the *Process Definition*, label it as *Self*, and edit its code as follows:

```js
{
  "mainUtility": "Self Reference"
}
```

Link the second *Status Dependency* to the *Status Report* of team Masters' Olivia's *Multi-Period-Daily* *Process Definition*, label is as *Ending: Olivia*, and edit its code as follows:

```js
{
  "mainUtility": "Market Ending Point"
}
```

Link the third *Status Dependency* to the *Status Report* of team Masters' Charly's *Historic-Trades* *Process Definition*, label it as *Starting: Charly Historic Trades*, and edit its code as follows:

```js
{
  "mainUtility": "Market Starting Point"
}
```

Go back to the *Process Dependencies* and select *Add Data Dependency*, labelling it *Olivia Candles*. Link this dependency to Olivia's *Multi-Period-Daily* *Dataset Definition* of the Candles *Product Definition*.

Go to the *Execution Started Event*, label it *Olivia*, and link it to Olivia's *Multi-Period-Market* *Process Definition* *Execution Finished Event*.

That's it! *Multi-Period-Daily* *Process Definition* is done.

## Product Definition

Go back to the indicator's menu and select *Add Product Definition*, label it as *Popular SMAs* and edit its configuration as follows:

```js
{
  "codeName": "Popular-SMAs",
  "singularVariableName": "popularSMA",
  "pluralVariableName": "popularSMAs"
}
```

Go to the *Product Definition* and select *Add Record Definition*, and continue to add 6 *Record Properties*.

| | |
| :-------: | :--- |
| ![menu-tensor-fixed-angles](https://user-images.githubusercontent.com/13994516/63041062-3fd1e380-bec7-11e9-814f-e8cabc90fd12.png) | **NOTE:** Make sure the resulting *Record Properties* have the *rotational symmetry* activated in the menu, as the order of these *Record Properties* determine the order of the fields in the resulting *record*. **TIP:** Activate the rotational symmetry on the *Record Definition* before creating the *Record Properties* so that they inherit the rotational symmetry upon creation.  |

We will label each of the *Record Properties* and set their configurations as follows:

**Begin**
```js
{
  "codeName": "begin",
  "isString": false
}
```

**End**
```js
{
  "codeName": "end",
  "isString": false
}
```

**SMA20**
```js
{
  "codeName": "sma20",
  "isString": false
}
```

**SMA50**
```js
{
  "codeName": "sma50",
  "isString": false
}
```

**SMA100**
```js
{
  "codeName": "sma100",
  "isString": false
}
```

**SMA200**
```js
{
  "codeName": "sma200",
  "isString": false
}
```

Go to each of the *Record Properties* and add a formula. You will assign the corresponding variable to each of them: ```record.current.begin```, ```record.current.end```, ```variable.sma20```, ```variable.sma50```, ```variable.sma100```, ```variable.sma200```.

Go to the *Product Definition* and add two *Dataset Definitions*. Label the first one *Multi-Period-Market* and configure it as follows:

```js
{
  "codeName": "Multi-Period-Market",
  "type": "Market Files",
  "validPeriods": [ "24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs" ],
  "filePath": "Sparta/SMA.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Popular-SMAs/Multi-Period-Market/@Period",
  "fileName": "@AssetA_@AssetB.json"
}
```

Name the second one *Multi-Period-Daily* and use the following configuration:

```js
{
  "codeName": "Multi-Period-Daily",
  "type": "Daily Files",
  "validPeriods": [ "45-min", "40-min", "30-min", "20-min", "15-min", "10-min", "05-min", "04-min", "03-min", "02-min", "01-min" ],
  "filePath": "Sparta/SMA.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Popular-SMAs/Multi-Period-Daily/@Period/@Year/@Month/@Day",
  "fileName": "@AssetA_@AssetB.json",
  "dataRange": {
    "filePath": "Sparta/SMA.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Popular-SMAs/Multi-Period-Daily",
    "fileName": "Data.Range.@AssetA_@AssetB.json"
  }
}
```

Go to the *Process Output* of each of the process (*Multi-Period-Market* and *Multi-Period-Daily*) and link each of the *Output Datasets* with the corresponding *Dataset Definitions*.

Go to the *Product Definition* and select *Add Missing Items*. You may delete the *Calculations Procedure* as we will not need it for this product.

Go to the *Data Building Procedure*, add a *Procedure Initialization* and a *Procedure Loop* nodes.

Go to the *Procedure Initialization* node and use the following code:

```JS
/* 
In Multi-Period-Daily we only have access to the last 2 days's worth of
candles, which in 45 min for example, results in 36 candles from the 
current day and 36 from the previous one. 

Because we will not have access to a long enough history while processing
daily files, we will use an array to store the last 200 candle.close 
values. This is to overecome that limitation.
*/

variable.last200 = []

//Debug code:
//console.log(timePeriodLabel + " - Initialization of SMA - *************")

```

Go to the *Procedure Loop* and use the following code:

```js

let candle = record.current // Our main dependencies are candles 
variable.last200.push(candle.close) // Add the current close value to the last 200 array.

if (variable.last200.length > 200) {
    variable.last200.splice(0, 1) // Remove the first node of the array to keep it at a maximun of 200 nodes.
}

variable.sma20 = calculateSMA(20)
variable.sma50 = calculateSMA(50)
variable.sma100 = calculateSMA(100)
variable.sma200 = calculateSMA(200)

function calculateSMA(periods) {  // Having a function avoids us to repeat code.
    /* We check we have enough values to make the calculation */
    if (variable.last200.length < periods) { return 0 } // If we dont, we define the value is zero.

    let sum = 0 // Initialize sum variable. 
    for (let i = variable.last200.length - periods; i < variable.last200.length; i++) { // Iterate through the last periods
        sum = sum + variable.last200[i]
        /*
        if (index > 18 && index < 22) { // You can debug what is going on by console logging whatever you need. 
            console.log("index=" + index + "   i=" + i + "   variable.last200.length=" + variable.last200.length + "   periods=" + periods + "   sum=" + sum + "    sum/periods=" + (sum / periods) + "    currentValue=" + (variable.last200[i]))
        }
        */
    }
    let sma = sum / periods
    return sma
}
```

We are done setting up the *Product Definition*. Now it's time to get the processes up and running!

## Network Setup

Go to the *My Computer* network node and create a new *task manager*. Create a new task, and select *Add New Indicator Bot Instance* and use the following configuration: 

```js
{
  "team": "YourTeamName",
  "bot": "YourBotName",
  "repo": "YourBotName-Indicator-Bot"
}
```

Select *Add a Process Instance*, name it *Market* and use the following configuration:

```js
{
  "process": "Multi-Period-Market"
}
```

Go ahead and add a second *Process Instance*, name it *Daily* and use the following configuration:

```js
{
  "process": "Multi-Period-Market"
}
```

Link each of the *Process Instances* to the corresponding *Process Definition* (*Multi-Period-Market* and *Multi-Period-Daily*)

That's it! You are now ready to run the *Indicator Bot Instance*. 

> **NOTE:** Remember that the bot has dependencies that need to be running for it to start. Click *Run All Tasks* in the *Masters Datasets* task manager.

If everything works well, the bot should start logging the typical progress messages in the console, create the folders structure as specified before and start pilling files for each of the time periods.

## Debugging

In case something is not working properly, the console is the first place to look into. The platform will log handled errors just like it does with the rest of the components in the system.

You may also implement additional logging features in the code you use on the *Data Building Procedure*. Notice that the code used for this bot has such kind of code embeded, but commented.

