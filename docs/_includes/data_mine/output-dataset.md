<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Output Dataset" %}
{% assign definition = site.data.data_mine.output_dataset %}
{% assign preposition = "an" %}
{% assign plural = "s" %}

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
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

There are other effects of establishing a reference from the output dataset to a product dataset definition. Upon execution, every time a process finishes a processing cycle, it triggers an event that may be consumed by other entities. This event indicates that the datasets impacted by the process have been updated.

An example of other entities that may be listening to such events is that of plotters. Plotters read datasets and create graphical representations of this data over the charts. Charts are constantly updating the information in the form of candles and indicators in realtime, synchronized with the data being extracted from the exchange by the sensor bot. That kind of automatism is possible thanks to the events that processes trigger every time an execution cycle is finished, signaling to everyone listening that new data is available on each of the impacted datasets.

[![Indicators-Process-Output-01](https://user-images.githubusercontent.com/13994516/68976798-f01cf400-07f6-11ea-9ffb-198b5853a220.gif)](https://user-images.githubusercontent.com/13994516/68976798-f01cf400-07f6-11ea-9ffb-198b5853a220.gif)

The image above shows the typical references from output datasets to datasets definitions.

{% include note.html content="An output dataset must reference a dataset definition." %}

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add an output dataset, select *Add Output Dataset* on the process output node menu.

{% include tip.html content="Remember that an output dataset must reference a valid dataset definition after creating the output dataset." %}

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

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