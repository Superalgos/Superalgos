---
title:  Product Definition
summary: "The product definition is the compilation of configurations, references, and JavaScript code that make up the data product."
sidebar: suite_sidebar
permalink: suite-product-definition.html
toc: false
---

{% include /data_mine/product-definition.md heading="" icon="150-" adding="####" configuring="####" starting="" content="yes" definition="bold" table="yes" more="yes" %}

<table class='hierarchyTable'><thead><tr><th><a href='#product-definition' data-toggle='tooltip' data-original-title='{{site.data.data_mine.product_definition}}'><img src='images/icons/product-definition.png' /><br />Product Definition</a></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></thead><tbody>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#dataset-definition' data-toggle='tooltip' data-original-title='{{site.data.data_mine.dataset_definition}}'><img src='images/icons/dataset-definition.png' /><br />Dataset Definition</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#record-definition' data-toggle='tooltip' data-original-title='{{site.data.data_mine.record_definition}}'><img src='images/icons/record-definition.png' /><br />Record Definition</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#record-property' data-toggle='tooltip' data-original-title='{{site.data.data_mine.record_property}}'><img src='images/icons/record-property.png' /><br />Record Property</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#formula' data-toggle='tooltip' data-original-title='{{site.data.data_mine.formula}}'><img src='images/icons/formula.png' /><br />Formula</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#calculations-procedure' data-toggle='tooltip' data-original-title='{{site.data.data_mine.calculations_procedure}}'><img src='images/icons/calculations-procedure.png' /><br />Calculations Procedure</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#procedure-loop' data-toggle='tooltip' data-original-title='{{site.data.data_mine.procedure_loop}}'><img src='images/icons/procedure-loop.png' /><br />Procedure Loop</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#javascript-code' data-toggle='tooltip' data-original-title='{{site.data.data_mine.javascript_code}}'><img src='images/icons/javascript-code.png' /><br />JavaScript Code</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#procedure-initialization' data-toggle='tooltip' data-original-title='{{site.data.data_mine.procedure_initialization}}'><img src='images/icons/procedure-initialization.png' /><br />Procedure Initialization</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-line.png' /></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#javascript-code' data-toggle='tooltip' data-original-title='{{site.data.data_mine.javascript_code}}'><img src='images/icons/javascript-code.png' /><br />JavaScript Code</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#data-building-procedure' data-toggle='tooltip' data-original-title='{{site.data.data_mine.data_building_procedure}}'><img src='images/icons/data-building-procedure.png' /><br />Data Building Procedure</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#procedure-loop' data-toggle='tooltip' data-original-title='{{site.data.data_mine.procedure_loop}}'><img src='images/icons/procedure-loop.png' /><br />Procedure Loop</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-line.png' /></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#javascript-code' data-toggle='tooltip' data-original-title='{{site.data.data_mine.javascript_code}}'><img src='images/icons/javascript-code.png' /><br />JavaScript Code</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#procedure-initialization' data-toggle='tooltip' data-original-title='{{site.data.data_mine.procedure_initialization}}'><img src='images/icons/procedure-initialization.png' /><br />Procedure Initialization</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#javascript-code' data-toggle='tooltip' data-original-title='{{site.data.data_mine.javascript_code}}'><img src='images/icons/javascript-code.png' /><br />JavaScript Code</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>




{% include /data_mine/dataset-definition.md heading="##" icon="150-" adding="###" configuring="###" starting="" content="yes" definition="bold" table="yes" more="yes" %}

{% include /data_mine/record-definition.md heading="##" icon="150-" adding="###" configuring="" starting="" content="yes" definition="bold" table="yes" more="yes" %}

{% include /data_mine/record-property.md heading="###" icon="" adding="#####" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes" %}

{% include /data_mine/formula.md heading="####" icon="" adding="######" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes" %}

{% include /data_mine/calculations-procedure.md heading="##" icon="150-" adding="###" configuring="" starting="" content="yes" definition="bold" table="yes" more="yes" %}

{% include /data_mine/procedure-loop.md heading="###" icon="" adding="#####" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes" %}

{% include /data_mine/javascript-code.md heading="####" icon="" adding="######" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes" %}

{% include /data_mine/procedure-initialization.md heading="###" icon="" adding="#####" configuring="" starting="" content="yes" definition="yes" table="yes" more="yes" %}

{% include /data_mine/data-building-procedure.md heading="##" icon="150-" adding="###" configuring="" starting="" content="yes" definition="bold" table="yes" more="yes" %}