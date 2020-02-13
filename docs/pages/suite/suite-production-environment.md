---
title:  Production Environment
summary: "The production environment within the network hierarchy organizes your strategy-deployment resources, grouping tasks, and associated forward testing and live trading sessions."
sidebar: suite_sidebar
permalink: suite-production-environment.html
toc: false
---

{% include /network/production-environment.md heading="" icon="150-" adding="" configuring="" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include tip.html content="If you are familiar with the testing environment, the production environment works in the exact same way, only that it features forward testing and live trading sessions instead of backtesting and paper trading sessions. **Live sessions require the setup of key instances**." %}

<table class='hierarchyTable'><thead><tr><th><a href='#testing-environment' data-toggle='tooltip' data-original-title='{{site.data.network.testing_environment}}'><img src='images/icons/testing-environment.png' /><br />Testing Environment</a></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></thead><tbody>
<tr><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task-manager' data-toggle='tooltip' data-original-title='{{site.data.network.task_manager}}'><img src='images/icons/task-manager.png' /><br />Task Manager</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#task' data-toggle='tooltip' data-original-title='{{site.data.network.task}}'><img src='images/icons/task.png' /><br />Task</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#trading-bot-instance' data-toggle='tooltip' data-original-title='{{site.data.network.trading_bot_instance}}'><img src='images/icons/trading-bot-instance.png' /><br />Trading Bot Instance</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#trading-process-instance' data-toggle='tooltip' data-original-title='{{site.data.network.trading_process_instance}}'><img src='images/icons/trading-process-instance.png' /><br />Trading Process Instance</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#market-reference' data-toggle='tooltip' data-original-title='{{site.data.network.market_reference}}'><img src='images/icons/market-reference.png' /><br />Market Reference</a></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#key-instance' data-toggle='tooltip' data-original-title='{{site.data.trading_system.key_instance}}'><img src='images/icons/key-instance.png' /><br />Key Instance</a></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#forward-testing-session' data-toggle='tooltip' data-original-title='{{site.data.network.forward_testing_session}}'><img src='images/icons/forward-testing-session.png' /><br />Forward Testing Session</a></td><td>&mdash;or&mdash;</td><td><a href='#live-trading-session' data-toggle='tooltip' data-original-title='{{site.data.network.live_trading_session}}'><img src='images/icons/live-trading-session.png' /><br />Live Trading Session</a></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#parameters' data-toggle='tooltip' data-original-title='{{site.data.trading_system.parameters}}'><img src='images/icons/parameters.png' /><br />Parameters</a></td><td></td><td></td><td></td></tr></tbody></table>

{% include /network/task-manager.md heading="##" icon="150-" adding="####" configuring="" starting="####" content="yes" definition="bold" table="yes" more="yes"%}

{% include /network/task.md heading="##" icon="150-" adding="####" configuring="" starting="####" content="yes" definition="bold" table="yes" more="yes"%}

{% include note.html content="In the context of the testing environment structure of nodes, tasks control trading bot instances." %}

{% include /network/trading-bot-instance.md heading="#####" icon="" adding="#####" configuring="" starting="#####" content="yes" definition="yes" table="yes" more="yes"%}

{% include /network/trading-process-instance.md heading="######" icon="" adding="######" configuring="" starting="######" content="yes" definition="yes" table="yes" more="yes"%}

{% include /network/market-reference.md heading="######" icon="" adding="######" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes"%}

{% include /network/key-instance.md heading="######" icon="" adding="######" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes"%}

{% include note.html content="Notice how live sessions do require a key instance, as these sessions do connect with the exchange." %}

{% include /network/forward-testing-session.md heading="#####" icon="" adding="#####" configuring="#####" starting="#####" content="yes" definition="yes" table="yes" more="yes"%}

{% include /network/live-trading-session.md heading="#####" icon="" adding="#####" configuring="#####" starting="#####" content="yes" definition="yes" table="yes" more="yes"%}

{% include /trading_system/parameters.md heading="######" icon="" adding="######" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes"%}

{% include note.html content="To learn about parameters, please see the <a href='suite-parameters.html'>parameters</a> page." %}
