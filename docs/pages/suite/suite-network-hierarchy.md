---
title:  Network Hierarchy
summary: "The network provides the tools to set up your testing and live-trading environments, as well as the definitions on where on the network processes run, and where data is stored."
sidebar: suite_sidebar
permalink: suite-network-hierarchy.html
toc: false
---

{% include note.html content="Hover your mouse over a node for a tooltip definition, and click to get all the details." %}



<table class='hierarchyTable'><thead><tr><th><a href='#network' data-toggle='tooltip' data-original-title='{{site.data.network.network}}'><img src='images/icons/network.png' /><br />Network</a></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></thead><tbody>
<tr><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#network-node' data-toggle='tooltip' data-original-title='{{site.data.network.network_node}}'><img src='images/icons/network-node.png' /><br />Network Node</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#data-storage' data-toggle='tooltip' data-original-title='{{site.data.network.data_storage}}'><img src='images/icons/data-storage.png' /><br />Data Storage</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#session-based-data' data-toggle='tooltip' data-original-title='{{site.data.network.session_based_data}}'><img src='images/icons/session-based-data.png' /><br />Session Based Data</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#session-reference' data-toggle='tooltip' data-original-title='{{site.data.network.session_reference}}'><img src='images/icons/session-reference.png' /><br />Session Reference</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#single-market-data' data-toggle='tooltip' data-original-title='{{site.data.network.single_market_data}}'><img src='images/icons/single-market-data.png' /><br />Single Market Data</a></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#data-product' data-toggle='tooltip' data-original-title='{{site.data.network.data_product}}'><img src='images/icons/data-product.png' /><br />Data Product</a></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#session-independent-data' data-toggle='tooltip' data-original-title='{{site.data.network.session_independent_data}}'><img src='images/icons/session-independent-data.png' /><br />Session Independent Data</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#single-market-data' data-toggle='tooltip' data-original-title='{{site.data.network.single_market_data}}'><img src='images/icons/single-market-data.png' /><br />Single Market Data</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#data-product' data-toggle='tooltip' data-original-title='{{site.data.network.data_product}}'><img src='images/icons/data-product.png' /><br />Data Product</a></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#data-mining' data-toggle='tooltip' data-original-title='{{site.data.network.data_mining}}'><img src='images/icons/data-mining.png' /><br />Data Mining</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task-manager' data-toggle='tooltip' data-original-title='{{site.data.network.task_manager}}'><img src='images/icons/task-manager.png' /><br />Task Manager</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task' data-toggle='tooltip' data-original-title='{{site.data.network.task}}'><img src='images/icons/task.png' /><br />Task</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#sensor-bot-instance' data-toggle='tooltip' data-original-title='{{site.data.network.sensor_bot_instance}}'><img src='images/icons/sensor-bot-instance.png' /><br />Sensor Bot Instance</a></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#sensor-process-instance' data-toggle='tooltip' data-original-title='{{site.data.network.sensor_process_instance}}'><img src='images/icons/sensor-process-instance.png' /><br />Sensor Process Instance</a></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#market-reference' data-toggle='tooltip' data-original-title='{{site.data.network.market_reference}}'><img src='images/icons/market-reference.png' /><br />Market Reference</a></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#key-instance' data-toggle='tooltip' data-original-title='{{site.data.trading_system.key_instance}}'><img src='images/icons/key-instance.png' /><br />Key Instance</a></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#indicator-bot-instance' data-toggle='tooltip' data-original-title='{{site.data.network.indicator_bot_instance}}'><img src='images/icons/indicator-bot-instance.png' /><br />Indicator Bot Instance</a></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#indicator-process-instance' data-toggle='tooltip' data-original-title='{{site.data.network.indicator_process_instance}}'><img src='images/icons/indicator-process-instance.png' /><br />Indicator Process Instance</a></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#testing-environment' data-toggle='tooltip' data-original-title='{{site.data.network.testing_environment}}'><img src='images/icons/testing-environment.png' /><br />Testing Environment</a></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#market-reference' data-toggle='tooltip' data-original-title='{{site.data.network.market_reference}}'><img src='images/icons/market-reference.png' /><br />Market Reference</a></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task-manager' data-toggle='tooltip' data-original-title='{{site.data.network.task_manager}}'><img src='images/icons/task-manager.png' /><br />Task Manager</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task' data-toggle='tooltip' data-original-title='{{site.data.network.task}}'><img src='images/icons/task.png' /><br />Task</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#trading-bot-instance' data-toggle='tooltip' data-original-title='{{site.data.network.trading_bot_instance}}'><img src='images/icons/trading-bot-instance.png' /><br />Trading Bot Instance</a></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#trading-process-instance' data-toggle='tooltip' data-original-title='{{site.data.network.trading_process_instance}}'><img src='images/icons/trading-process-instance.png' /><br />Trading Process Instance</a></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#market-reference' data-toggle='tooltip' data-original-title='{{site.data.network.market_reference}}'><img src='images/icons/market-reference.png' /><br />Market Reference</a></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#backtesting-session' data-toggle='tooltip' data-original-title='{{site.data.network.backtesting_session}}'><img src='images/icons/backtesting-session.png' /><br />Backtesting Session</a></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#paper-trading-session' data-toggle='tooltip' data-original-title='{{site.data.network.paper_trading_session}}'><img src='images/icons/paper-trading-session.png' /><br />Paper Trading Session</a></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#parameters' data-toggle='tooltip' data-original-title='{{site.data.trading_system.parameters}}'><img src='images/icons/parameters.png' /><br />Parameters</a></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#base-asset' data-toggle='tooltip' data-original-title='{{site.data.trading_system.base_asset}}'><img src='images/icons/base-asset.png' /><br />Base Asset</a></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#quoted-asset' data-toggle='tooltip' data-original-title='{{site.data.trading_system.quoted_asset}}'><img src='images/icons/quoted-asset.png' /><br />Quoted Asset</a></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#time-range' data-toggle='tooltip' data-original-title='{{site.data.trading_system.time_range}}'><img src='images/icons/time-range.png' /><br />Time Range</a></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#time-frame' data-toggle='tooltip' data-original-title='{{site.data.trading_system.time_frame}}'><img src='images/icons/time-frame.png' /><br />Time Frame</a></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#slippage' data-toggle='tooltip' data-original-title='{{site.data.trading_system.slippage}}'><img src='images/icons/slippage.png' /><br />Slippage</a></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#fee-structure' data-toggle='tooltip' data-original-title='{{site.data.trading_system.fee_structure}}'><img src='images/icons/fee-structure.png' /><br />Fee Structure</a></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#production-environment' data-toggle='tooltip' data-original-title='{{site.data.network.production_environment}}'><img src='images/icons/production-environment.png' /><br />Production Environment</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task-manager' data-toggle='tooltip' data-original-title='{{site.data.network.task_manager}}'><img src='images/icons/task-manager.png' /><br />Task Manager</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task' data-toggle='tooltip' data-original-title='{{site.data.network.task}}'><img src='images/icons/task.png' /><br />Task</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#trading-bot-instance' data-toggle='tooltip' data-original-title='{{site.data.network.trading_bot_instance}}'><img src='images/icons/trading-bot-instance.png' /><br />Trading Bot Instance</a></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#trading-process-instance' data-toggle='tooltip' data-original-title='{{site.data.network.trading_process_instance}}'><img src='images/icons/trading-process-instance.png' /><br />Trading Process Instance</a></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#market-reference' data-toggle='tooltip' data-original-title='{{site.data.network.market_reference}}'><img src='images/icons/market-reference.png' /><br />Market Reference</a></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#key-instance' data-toggle='tooltip' data-original-title='{{site.data.trading_system.key_instance}}'><img src='images/icons/key-instance.png' /><br />Key Instance</a></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#forward-testing-session' data-toggle='tooltip' data-original-title='{{site.data.network.forward_testing_session}}'><img src='images/icons/forward-testing-session.png' /><br />Forward Testing Session</a></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#live-trading-session' data-toggle='tooltip' data-original-title='{{site.data.network.live_trading_session}}'><img src='images/icons/live-trading-session.png' /><br />Live Trading Session</a></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#parameters' data-toggle='tooltip' data-original-title='{{site.data.trading_system.parameters}}'><img src='images/icons/parameters.png' /><br />Parameters</a></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#base-asset' data-toggle='tooltip' data-original-title='{{site.data.trading_system.base_asset}}'><img src='images/icons/base-asset.png' /><br />Base Asset</a></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#quoted-asset' data-toggle='tooltip' data-original-title='{{site.data.trading_system.quoted_asset}}'><img src='images/icons/quoted-asset.png' /><br />Quoted Asset</a></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#time-range' data-toggle='tooltip' data-original-title='{{site.data.trading_system.time_range}}'><img src='images/icons/time-range.png' /><br />Time Range</a></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#time-frame' data-toggle='tooltip' data-original-title='{{site.data.trading_system.time_frame}}'><img src='images/icons/time-frame.png' /><br />Time Frame</a></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#slippage' data-toggle='tooltip' data-original-title='{{site.data.trading_system.slippage}}'><img src='images/icons/slippage.png' /><br />Slippage</a></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#fee-structure' data-toggle='tooltip' data-original-title='{{site.data.trading_system.fee_structure}}'><img src='images/icons/fee-structure.png' /><br />Fee Structure</a></td></tr></tbody></table>







## Network

<img src='images/icons/150-network.png' />

**{{site.data.network.network}}**

You will use the network hierarchy for three main purposes:

* To control processes running sensor and indicator bots. These keep your data feeds and analysis up to date so that you may trade live with quality information.

* To control trading sessions including backtesting, paper trading, forward testing, and live trading sessios.

* To administer the physical location in which the data products produced by bots reside.





## Network Node

<img src='images/icons/150-network-node.png' />

**{{site.data.network.network_node}}**

At the moment, processes run locally in a network node representing your computer. In the future, you will also be able to deploy other nodes, such as virtual machines in the cloud, and control execution in those remote computers from within your local instance of the system.

In a more distant future, you will also be able to connect to and consume services from other people’s nodes.






## Data Mining

<img src='images/icons/150-data-mining.png' />

**{{site.data.network.data_mining}}**

Users may have access to several data mines. For organizational purposes, it is recommended each data mine has its task manager. However, the system allows any form of organization.




## Task Manager

<img src='images/icons/150-task-manager.png' />

**{{site.data.network.task_manager}}**

A task manager facilitates the organization of tasks. For example, you may wish to set up a task manager to handle tasks related to a particular set of indicators you use with a certain strategy. Or, for example, to organize multiple backtesting sessions.

Also, a task manager allows starting and stopping all tasks under it at once, with a single click.

### Adding a Task Manager

To add a task manager, select *Add Task Manager* on the *My Computer* network node menu. A task manager is added along with a task.

### Starting / Stopping All Tasks

Select *Run All Tasks* or *Stop All Tasks* on the menu to start and stop all tasks respectively.





## Task

<img src='images/icons/150-task.png' />

**{{site.data.network.task}}**

Each task may control a single bot. A bot instance running on its own task is independent from other bots at the operating system level, thus, may not be affected by errors ocurring on those other bots.

### Adding a Task

To add a task, select *Add Task* on the task manager node menu.

{% include tip.html content="Instead of adding nodes, configuring them, and setting references one by one, you may want to clone an existing, fully functional task with all its offspring." %}

### Starting / Stopping a Task

Select *Run* on the menu to start a task. When a task is started, the process instance of the bot instance attached to the task is started. Also, a visual indication that both the task and the process instance are running appear surrounding the corresponding nodes, in the form of a progress ring.



To stop a task, select *Stop* on the menu.





## Sensor Bot Instance

<img src='images/icons/150-sensor-bot-instance.png' />

**{{site.data.network.sensor_bot_instance}}**

{{site.data.concepts.sensor_bot}}

The sensor bot instance holds no definitions as to what the bot does. Instead, its process instance references a process definition in the corresponding data mine. That is how the sensor bot instance obtains the information regarding what it needs to do once it is run.

### Adding a Sensor Bot Instance

To add a sensor bot instance, select *Add Sensor Bot Instance* on the task node menu. When a sensor bot instance is added, it is created with one sensor process instance, and a market reference.

### Starting / Stopping a Sensor Bot Instance

You do not start or stop a sensor bot instance directly. Instead, you start or stop the corresponding task.

### Configuring a Sensor Bot Instance

Select *Configure Sensor Bot Instance* on the menu to access the configuration.

```json
  {
    "startDate": "2020-01-01"
  }
```

* ```startDate``` is the starting date of the data product the sensor bot instance builds. In other words, the sensor bot instance queries its data source for data starting on the configured ```startDate```. In cases when the sensor bot has built a data product starting on a certain date and the ```startDate``` is eventually changed for an earlier one, that is, a date further in the past, then the sensor bot discards the existing data product and starts over from the newly configured date.





## Sensor Process Instance

<img src='images/icons/150-sensor-process-instance.png' />

**{{site.data.network.sensor_process_instance}}**

For example, in the case of an instance of the Masters data mine Charly sensor bot, the sensor bot process instance references the *Historic Trades* process definition. Once the reference is established, the sensor process instance adopts the name of the process definition it references.

### Adding a Sensor Process Instance

To add a sensor process instance, select *Add Sensor Process Instance* on the sensor bot instance node menu. When a sensor process instance is added, it is created with a market reference.

### Starting / Stopping a Sensor Process Instance

You do not start or stop a sensor process instance directly. Instead, you start or stop the corresponding task.





## Indicator Bot Instance

<img src='images/icons/150-indicator-bot-instance.png' />

**{{site.data.network.indicator_bot_instance}}**

{{site.data.concepts.indicator_bot}}

The indicator bot instance holds no definitions as to what the bot does. Instead, its processes instances reference the process definitions in the corresponding data mine. That is how the indicator bot instance obtains the information of what it needs to do once it is run.

### Adding an Indicator Bot Instance

To add an indicator bot instance, select *Add Indicator Bot Instance* on the task node menu. When an indicator bot instance is added, it is created with one indicator process instance, and a market reference.

### Starting / Stopping an Indicator Bot Instance

You do not start or stop an indicator bot instance directly. Instead, you start or stop the corresponding task.





## Indicator Process Instance

<img src='images/icons/150-indicator-process-instance.png' />

**{{site.data.network.indicator_process_instance}}**

Indicator bot instances usually require two indicator process instances. One of them references the indicator's *multi-period-market* process definition and the second references the *multi-period-daily* process definition.

Once the reference is established, the indicator process instance adopts the name of the process definition it references.

### Adding an Indicator Process Instance

To add an indicator process instance, select *Add Indicator Process Instance* on the indicator bot instance node menu. When an indicator process instance is added, it is created with a market reference.

### Starting / Stopping an Indicator Process Instance

You do not start or stop an indicator process instance directly. Instead, you start or stop the corresponding task.





## Market Reference

<img src='images/icons/150-market-reference.png' />

**{{site.data.network.market_reference}}**

In other words, a market reference is the piece of information that let's the process instance know which market of which exchange it needs to process.

### Adding a Market Reference

To add a market reference, select *Add Market Reference* on the sensor, indicator or trading process instance node menu.

{% include note.html content="After adding a market reference node, make sure you establish the reference to the corresponding market of the corresponding exchange in the Crypto Ecosystem hierarchy." %}





## Key Instance

<img src='images/icons/150-key-instance.png' />

**{{site.data.network.key_instance}}**

The key instance must be attached to market reference nodes that participate in forward testing and live trading sessions, as that is the scenario in which the user must validate the account with the exchange.

Some exchanges&mdash;like Binance&mdash;require validating the user even when retrieving data from the exchange. For such reasons, the key instance must also be attached to the market reference of the sensor process instance that connects to such exchanges.

In all cases, the key instance node must reference a valid exchange account key from an account with the exchange, as defined in the Crypto Ecosystem hierarchy.

{% include important.html content="Most exchanges do not allow the same exchange account key to be used with multiple processes querying the exchange API. This means that if you are trading with multiple trading systems or multiple sessions on the same exchange, each session requires different exchange account keys." %}

### Adding a Key Instance

To add a key instance, select *Add Key Instance* on the market reference node menu.

{% include note.html content="Remember to establish a reference with a valid exchange account key after creating the key instance." %}







## Testing Environment

<img src='images/icons/150-testing-environment.png' />

**{{site.data.network.testing_environment}}**

Depending on how you use the system, how many markets and exchanges you work with, the number of trading systems you use, or the way you choose to test your strategies, you may find yourself with a large number of testing sessions. It is recommended you organize all of your testing sessions below the testing environment node.




## Trading Bot Instance

<img src='images/icons/150-trading-bot-instance.png' />

**{{site.data.network.trading_bot_instance}}**

{{site.data.concepts.trading_bot}}

The trading bot instance holds no definitions as to what the bot does. Instead, its process instance references the process definition in the Masters data mine. That is how the indicator bot instance obtains the information of what it needs to do once it is run.

### Adding a Trading Bot Instance

To add a trading bot instance, select *Add Trading Bot Instance* on the task node menu. When a trading bot instance is added, it is created with one trading process instance, and a market reference.

### Starting / Stopping a Trading Bot Instance

You do not start or stop a trading bot instance directly. Instead, you start or stop the corresponding task.





## Trading Process Instance

<img src='images/icons/150-trading-process-instance.png' />

**{{site.data.network.trading_process_instance}}**

The trading process instance must reference the *Multi-Period* process definition of the Jason trading bot in the Masters data mine.

### Adding a Trading Process Instance

To add a trading process instance, select *Add Trading Process Instance* on the trading bot instance node menu. When a trading process instance is added, it is created with a market reference.

{% include note.html content="After adding a trading process instance node, make sure you establish the reference to the *Multi-Period* process definition of the Jason trading bot in the Masters data mine." %}

### Starting / Stopping a Trading Process Instance

You do not start or stop a trading process instance directly. Instead, you start or stop the corresponding task.





{% include /network/backtesting-session.md heading="##" icon="150-" adding="####" configuring="####" starting="####" content="yes" definition="bold" table="yes" more="no"%}

{% include /network/paper-trading-session.md heading="##" icon="150-" adding="####" configuring="####" starting="####" content="yes" definition="bold" table="yes" more="no"%}



## Production Environment

<img src='images/icons/150-production-environment.png' />

**{{site.data.network.production_environment}}**

If you work with multiple markets, multiple exchanges of multiple trading systems, it is recommended to organize your live trading sessions below the production environment node.



{% include /network/forward-testing-session.md heading="##" icon="150-" adding="####" configuring="####" starting="####" content="yes" definition="bold" table="yes" more="no"%}

{% include /network/live-trading-session.md heading="##" icon="150-" adding="####" configuring="####" starting="####" content="yes" definition="bold" table="yes" more="no"%}





{% include /trading_system/parameters.md heading="##" icon="150-" adding="###" configuring="" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include /trading_system/base-asset.md heading="##" icon="150-" adding="###" configuring="###" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include /trading_system/quoted-asset.md heading="##" icon="150-" adding="###" configuring="" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include /trading_system/time-frame.md heading="##" icon="150-" adding="###" configuring="###" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include /trading_system/time-range.md heading="##" icon="150-" adding="###" configuring="###" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include /trading_system/slippage.md heading="##" icon="150-" adding="###" configuring="###" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include /trading_system/fee-structure.md heading="##" icon="150-" adding="###" configuring="###" starting="" content="yes" definition="bold" table="yes" more="no"%}



## Data Storage

<img src='images/icons/150-data-storage.png' />

**{{site.data.network.data_storage}}**

Data products generated by the bot instances you run need to be stored somewhere&mdash;specifically. The data storage node and its chain of offspring determine that the data is to be stored in the corresponding node.

{% include note.html content="At this point, the only node in which you may store data is your local *My Computer* node, however, in the future you will be able to store data, or even run bots, on remote machines that you will control from within your local deployment of the system." %}

### Adding a Data Storage

To add a data storage, select *Add Data Storage* on the network node menu. 

{% include note.html content="Only one data storage may exist on each network node." %}





## Session-based Data

<img src='images/icons/150-session-based-data.png' />

**{{site.data.network.session-based_data}}**

### Adding a Session-based Data Node

To add a session-based data node, select *Add Session-based Data* on the network node menu. 

{% include note.html content="Only one session-based data node may exist on each data storage node." %}





## Session Reference

<img src='images/icons/150-session-reference.png' />

**{{site.data.network.session_reference}}**

A such, the session reference node must establish a reference with a session. In addition, its offspring nodes determine precisely which data products are stored.

### Adding a Session-based Data Node

To add a session reference node, select *Add Session Reference* on the network node menu. 

{% include note.html content="Remember to establish a reference with a session after adding the node." %}





## Single Market Data

<img src='images/icons/150-single-market-data.png' />

**{{site.data.network.single_market_data}}**

The single market data node must establish a reference with a specific market defined in the Crypto Ecosystem hierarchy.

### Adding a Single Market Data Node

To add a single market data node, select *Add Single Market Data* on the network node menu. 

{% include note.html content="Remember to establish a reference with a market defined in the Crypto Ecosystem hierarchy after adding the node." %}





## Data Product

<img src='images/icons/150-data-product.png' />

**{{site.data.network.data_product}}**

A data product node must reference a product definition in the corresponding data mine.

### Adding a Data Product

To add a data product, select *Add Data Product* on the network node menu. 

{% include note.html content="Remember to establish a reference with a product definition of the corresponding bot in the corresponding data mine." %}





## Session-independent Data

<img src='images/icons/150-session-independent-data.png' />

**{{site.data.network.session-independent_data}}**

### Adding a Session-independent Data Node

To add a session-independent data node, select *Add Session-independent Data* on the network node menu. 

{% include note.html content="Only one session-independent data node may exist on each data storage node." %}










