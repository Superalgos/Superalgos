---
title:  Process Definition
summary: "The process definition is the compilation of configurations, dependencies, and references that make up the process."
sidebar: suite_sidebar
permalink: suite-process-definition.html
toc: false
---

{% include /data_mine/process-definition.md heading="" icon="150-" adding="####" configuring="####" starting="" content="yes" definition="bold" table="yes" more="yes" %}

<table class='hierarchyTable'><thead><tr><th><a href='#process-definition' data-toggle='tooltip' data-original-title='{{site.data.data_mine.process_definition}}'><img src='images/icons/process-definition.png' /><br />Process Definition</a></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></thead><tbody>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#process-output' data-toggle='tooltip' data-original-title='{{site.data.data_mine.process_output}}'><img src='images/icons/process-output.png' /><br />Process Output</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#output-dataset' data-toggle='tooltip' data-original-title='{{site.data.data_mine.output_dataset}}'><img src='images/icons/output-dataset.png' /><br />Output Dataset</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#process-dependencies' data-toggle='tooltip' data-original-title='{{site.data.data_mine.process_dependencies}}'><img src='images/icons/process-dependencies.png' /><br />Process Dependencies</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#status-dependency' data-toggle='tooltip' data-original-title='{{site.data.data_mine.status_dependency}}'><img src='images/icons/status-dependency.png' /><br />Status Dependency</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#data-dependency' data-toggle='tooltip' data-original-title='{{site.data.data_mine.data_dependency}}'><img src='images/icons/data-dependency.png' /><br />Data Dependency</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#status-report' data-toggle='tooltip' data-original-title='{{site.data.data_mine.status_report}}'><img src='images/icons/status-report.png' /><br />Status Report</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#execution-started-event' data-toggle='tooltip' data-original-title='{{site.data.data_mine.execution_started_event}}'><img src='images/icons/execution-started-event.png' /><br />Execution Started Event</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#execution-finished-event' data-toggle='tooltip' data-original-title='{{site.data.data_mine.execution_finished_event}}'><img src='images/icons/execution-finished-event.png' /><br />Execution Finished Event</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>



{% include /data_mine/process-output.md heading="##" icon="150-" adding="###" configuring="" starting="" content="no" definition="bold" table="yes" more="yes" %}

{% include /data_mine/output-dataset.md heading="###" icon="" adding="#####" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes" %}

{% include /data_mine/process-dependencies.md heading="##" icon="150-" adding="###" configuring="" starting="" content="yes" definition="bold" table="yes" more="yes" %}

{% include /data_mine/status-dependency.md heading="###" icon="" adding="#####" configuring="####" starting="" content="yes" definition="yes" table="yes" more="yes" %}

{% include /data_mine/data-dependency.md heading="###" icon="" adding="#####" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes" %}

{% include /data_mine/status-report.md heading="##" icon="150-" adding="###" configuring="" starting="" content="yes" definition="bold" table="yes" more="yes" %}

{% include /data_mine/execution-started-event.md heading="##" icon="150-" adding="###" configuring="" starting="" content="yes" definition="bold" table="yes" more="yes" %}							
	
{% include /data_mine/execution-finished-event.md heading="##" icon="150-" adding="###" configuring="" starting="" content="yes" definition="bold" table="yes" more="yes" %}		