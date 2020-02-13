---
title:  Strategies
summary: "The Superalgos Protocol organizes trading strategies in a clearly-defined sequence of stages, each with its own set of definitions, rules and events."
sidebar: suite_sidebar
permalink: suite-strategies.html
toc: false
---

{% include /trading_system/strategy.md heading="" icon="150-" adding="####" configuring="" starting="" content="yes" definition="bold" table="yes" more="yes"%}

<table class='hierarchyTable'><thead><tr><th><a href='#strategy' data-toggle='tooltip' data-original-title='{{site.data.trading_system.strategy}}'><img src='images/icons/strategy.png' /><br />Strategy</a></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></thead><tbody>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#trigger-stage' data-toggle='tooltip' data-original-title='{{site.data.trading_system.trigger_stage}}'><img src='images/icons/trigger-stage.png' /><br />Trigger Stage</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#trigger-on-event' data-toggle='tooltip' data-original-title='{{site.data.trading_system.trigger-on_event}}'><img src='images/icons/trigger-on-event.png' /><br />Trigger-On Event</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#trigger-off-event' data-toggle='tooltip' data-original-title='{{site.data.trading_system.trigger-off_event}}'><img src='images/icons/trigger-off-event.png' /><br />Trigger-Off Event</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#take-position-event' data-toggle='tooltip' data-original-title='{{site.data.trading_system.take_position_event}}'><img src='images/icons/take-position-event.png' /><br />Take Position Event</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#open-stage' data-toggle='tooltip' data-original-title='{{site.data.trading_system.open_stage}}'><img src='images/icons/open-stage.png' /><br />Open Stage</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#initial-stop' data-toggle='tooltip' data-original-title='{{site.data.trading_system.initial_stop}}'><img src='images/icons/initial-stop.png' /><br />Initial Stop</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#phase-0' data-toggle='tooltip' data-original-title='{{site.data.trading_system.phase_0}}'><img src='images/icons/phase-0.png' /><br />Phase 0</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#next-phase-event' data-toggle='tooltip' data-original-title='{{site.data.trading_system.next_phase_event}}'><img src='images/icons/next-phase-event.png' /><br />Next Phase Event</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#initial-take-profit' data-toggle='tooltip' data-original-title='{{site.data.trading_system.initial_take_profit}}'><img src='images/icons/initial-take-profit.png' /><br />Initial Take Profit</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#phase-0' data-toggle='tooltip' data-original-title='{{site.data.trading_system.phase_0}}'><img src='images/icons/phase-0.png' /><br />Phase 0</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#next-phase-event' data-toggle='tooltip' data-original-title='{{site.data.trading_system.next_phase_event}}'><img src='images/icons/next-phase-event.png' /><br />Next Phase Event</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#position-size' data-toggle='tooltip' data-original-title='{{site.data.trading_system.position_size}}'><img src='images/icons/position-size.png' /><br />Position Size</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#position-rate' data-toggle='tooltip' data-original-title='{{site.data.trading_system.position_rate}}'><img src='images/icons/position-rate.png' /><br />Position Rate</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#manage-stage' data-toggle='tooltip' data-original-title='{{site.data.trading_system.manage_stage}}'><img src='images/icons/manage-stage.png' /><br />Manage Stage</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#stop' data-toggle='tooltip' data-original-title='{{site.data.trading_system.stop}}'><img src='images/icons/stop.png' /><br />Stop</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#phase-1' data-toggle='tooltip' data-original-title='{{site.data.trading_system.phase_1}}'><img src='images/icons/phase-1.png' /><br />Phase 1</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#next-phase-event' data-toggle='tooltip' data-original-title='{{site.data.trading_system.next_phase_event}}'><img src='images/icons/next-phase-event.png' /><br />Next Phase Event</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#take-profit' data-toggle='tooltip' data-original-title='{{site.data.trading_system.take_profit}}'><img src='images/icons/take-profit.png' /><br />Take Profit</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#phase-1' data-toggle='tooltip' data-original-title='{{site.data.trading_system.phase_1}}'><img src='images/icons/phase-1.png' /><br />Phase 1</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#next-phase-event' data-toggle='tooltip' data-original-title='{{site.data.trading_system.next_phase_event}}'><img src='images/icons/next-phase-event.png' /><br />Next Phase Event</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#close-stage' data-toggle='tooltip' data-original-title='{{site.data.trading_system.close_stage}}'><img src='images/icons/close-stage.png' /><br />Close Stage</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>


{% include /trading_system/trigger-stage.md heading="##" icon="150-" adding="" configuring="" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include tip.html content="Events are triggered by situations, which are defined by conditions. Both are explained in the <a href='suite-situations-conditions-formulas'>situations, conditions, and formulas</a> page." %}

{% include /trading_system/trigger-on-event.md heading="###" icon="" adding="" configuring="" starting="" content="yes" definition="" table="yes" more="no"%}

{% include /trading_system/trigger-off-event.md heading="###" icon="" adding="" configuring="" starting="" content="yes" definition="" table="yes" more="no"%}

{% include /trading_system/take-position-event.md heading="###" icon="" adding="" configuring="" starting="" content="yes" definition="" table="yes" more="no"%}

{% include /trading_system/open-stage.md heading="##" icon="150-" adding="" configuring="" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include /trading_system/phase-0.md heading="###" icon="" adding="" configuring="" starting="" content="no" definition="" table="yes" more="no"%}

{% include /trading_system/initial-stop.md heading="###" icon="" adding="" configuring="" starting="" content="yes" definition="" table="yes" more="no"%}

{% include /trading_system/initial-take-profit.md heading="###" icon="" adding="" configuring="" starting="" content="yes" definition="" table="yes" more="no"%}

{% include /trading_system/position-size.md heading="###" icon="" adding="" configuring="" starting="" content="yes" definition="" table="yes" more="no"%}

{% include /trading_system/position-rate.md heading="###" icon="" adding="" configuring="" starting="" content="yes" definition="" table="yes" more="no"%}

{% include /trading_system/next-phase-event.md heading="###" icon="" adding="" configuring="" starting="" content="yes" definition="" table="yes" more="no"%}

{% include /trading_system/manage-stage.md heading="##" icon="150-" adding="" configuring="" starting="" content="yes" definition="bold" table="yes" more="no"%}

{% include /trading_system/phase-1.md heading="###" icon="" adding="" configuring="" starting="" content="yes" definition="" table="yes" more="no"%}

{% include /trading_system/close-stage.md heading="##" icon="150-" adding="" configuring="" starting="" content="yes" definition="bold" table="yes" more="no"%}
