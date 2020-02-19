---
title:  Data Mining
summary: "The data mining structure of nodes within the network hierarchy controls the bots you need to run to keep your data feeds up to date."
sidebar: suite_sidebar
permalink: suite-data-mining.html
toc: false
---

{% include /network/data-mining.md heading="" icon="150-" adding="" configuring="" starting="" content="yes" definition="bold" table="yes" more="no"%}

<table class='hierarchyTable'><thead><tr><th><a href='#data-mining' data-toggle='tooltip' data-original-title='{{site.data.network.data_mining}}'><img src='images/icons/data-mining.png' /><br />Data Mining</a></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></thead><tbody>
<tr><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task-manager' data-toggle='tooltip' data-original-title='{{site.data.network.task_manager}}'><img src='images/icons/task-manager.png' /><br />Task Manager</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task' data-toggle='tooltip' data-original-title='{{site.data.network.task}}'><img src='images/icons/task.png' /><br />Task</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#sensor-bot-instance' data-toggle='tooltip' data-original-title='{{site.data.network.sensor_bot_instance}}'><img src='images/icons/sensor-bot-instance.png' /><br />Sensor Bot Instance</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#sensor-process-instance' data-toggle='tooltip' data-original-title='{{site.data.network.sensor_process_instance}}'><img src='images/icons/sensor-process-instance.png' /><br />Sensor Process Instance</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#market-reference' data-toggle='tooltip' data-original-title='{{site.data.network.market_reference}}'><img src='images/icons/market-reference.png' /><br />Market Reference</a></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#key-instance' data-toggle='tooltip' data-original-title='{{site.data.trading_system.key_instance}}'><img src='images/icons/key-instance.png' /><br />Key Instance</a></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#indicator-bot-instance' data-toggle='tooltip' data-original-title='{{site.data.network.indicator_bot_instance}}'><img src='images/icons/indicator-bot-instance.png' /><br />Indicator Bot Instance</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#indicator-process-instance' data-toggle='tooltip' data-original-title='{{site.data.network.indicator_process_instance}}'><img src='images/icons/indicator-process-instance.png' /><br />Indicator Process Instance</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#market-reference' data-toggle='tooltip' data-original-title='{{site.data.network.market_reference}}'><img src='images/icons/market-reference.png' /><br />Market Reference</a></td><td></td><td></td><td></td><td></td></tr></tbody></table>

{% include /network/task-manager.md heading="##" icon="150-" adding="####" configuring="" starting="####" content="yes" definition="bold" table="yes" more="yes"%}

{% include /network/task.md heading="##" icon="150-" adding="####" configuring="" starting="####" content="yes" definition="bold" table="yes" more="yes"%}

{% include note.html content="In the context of the data mining structure of nodes, tasks may control both sensor and indicator bot instances." %}

{% include /network/sensor-bot-instance.md heading="#####" icon="" adding="#####" configuring="#####" starting="#####" content="yes" definition="yes" table="yes" more="yes"%}

{% include /network/sensor-process-instance.md heading="######" icon="" adding="######" configuring="" starting="######" content="yes" definition="yes" table="yes" more="yes"%}

{% include /network/market-reference.md heading="######" icon="" adding="######" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes"%}

{% include /network/key-instance.md heading="######" icon="" adding="######" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes"%}

{% include /network/indicator-bot-instance.md heading="#####" icon="" adding="#####" configuring="" starting="#####" content="yes" definition="yes" table="yes" more="yes"%}

{% include /network/indicator-process-instance.md heading="######" icon="" adding="######" configuring="" starting="######" content="yes" definition="yes" table="yes" more="yes"%}

