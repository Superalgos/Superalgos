<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Status Dependency" %}
{% assign definition = site.data.data_mine.status_dependency %}
{% assign preposition = "a" %}
{% assign plural = "" %}

<!--------------------------------------------- TITLE AND DEFINITION ends -->

{% if include.more == "yes" and include.heading == "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.heading != "" and include.heading != "more" %}
{{include.heading}} {{title}}
{% endif %}

{% if include.icon != "no" %} 

{% if include.table == "yes" and include.icon != "no" %}
<table class='definitionTable'><tr><td>
{% endif %}

<img src='images/icons/{{include.icon}}{{ title | downcase | replace: " ", "-" }}.png' />

{% if include.table == "yes" and include.icon != "no" %}
</td><td>
{% endif %}

{% endif %}

{% if include.definition == "bold" %}
<strong>{{ definition }}</strong>
{% else %}
{% if include.definition != "no" %}
{{ definition }}
{% endif %}
{% endif %}

{% if include.table == "yes" and include.icon != "no" %}
</td></tr></table>
{% endif %}

{% if include.more == "yes" and include.content == "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about status dependencies
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

The reference is established to acquire the information relative to what the target process is doing. For example, by reading a status report a process may learn when was the last time the referenced process ran, and what was the last file processed.

The status report referenced may belong to the same process&mdash; which is called a self-reference. In such a case, the process is learning what it did the last time it ran. Also, the status report referenced may belong to another process&mdash;another bot. In that case, the dependency may be of the Market Starting Point or Market Ending Point types.

* **Self Reference** is mandatory, as a process needs to read it's own status report every time it wakes up.

* **Market Starting Point** is a status dependency existing on Multi-Period-Daily processes so that the process establishing the reference learns the datetime of the start of the market. Usually, the reference is established with the sensor's Historic-Trades process status report. Multi-Period-Market processes do not have this type of status dependency as the date of the start of the market is implied in their dataset (a single file with all market data).

* **Market Ending Point** is a status dependency existing both in Multi-Period-Market and Multi-Period-Daily processes so that the process establishing the reference knows the datetime of the end of the market.

[![Indicators-Process-Dependencies-01](https://user-images.githubusercontent.com/13994516/68991956-dfa36280-0864-11ea-87ec-f0e4e3b7bf0f.gif)](https://user-images.githubusercontent.com/13994516/68991956-dfa36280-0864-11ea-87ec-f0e4e3b7bf0f.gif)

The image above shows a case of a self-reference status dependency as well as a market ending point status dependency.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about status dependencies
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a status dependency, select *Add Status Dependency* on the process dependencies node menu.

{% include tip.html content="Remember that a status dependency must be configured, and must establish a reference to the appropriate status report." %}

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Status Dependency* on the menu to access the configuration.

```json
{ 
"mainUtility": "Self Reference|Market Starting Point|Market Ending Point"
}
```

* ```mainUtility``` determines the type of status dependency, with possible values being ```Self Reference```, ```Market Starting Point```, or ```Market Ending Point```.

<!--------------------------------------------- CONFIGURING ends -->

{% endif %}

{% if include.starting != "" %}

{{include.starting}} Starting {{preposition}} {{title}}

<!--------------------------------------------- STARTING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!--------------------------------------------- STARTING ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}