<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Time Scale" %}
{% assign definition = site.data.charting_space.time_scale %}
{% assign preposition = "a" %}
{% assign plural = "s" %}

<!--------------------------------------------- TITLE AND DEFINITION ends -->

{% if include.heading != "" %}
{{include.heading}} {{title}}
{% endif %}

{% if include.icon != "no" %} 

{% if include.table == "yes" and include.icon != "no" %}
<table class="definitionTable"><tr><td>
{% endif %}

<img src='images/icons/{{include.icon}}{{ title | downcase | replace: " ", "-" }}.png' />

{% if include.table == "yes" and include.icon != "no" %}
</td><td>
{% endif %}

{% endif %}

{% if include.definition == "bold" %}

<strong>{{ definition }}</strong>

{% else %}

{{ definition }}

{% endif %}

{% if include.table == "yes" and include.icon != "no" %}
</td></tr></table>
{% endif %}

{% if include.more == "yes" and include.content == "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

The time scale is represented by a numerical value between 0 and 100. When the scale is set to zero, the horizontal span of the time machine and charts within it is the smallest possible. When the scale is set to 100, it is the largest possible. In other words, the charts are compressed on the horizontal axis with low scale numbers and expanded as the scale increases.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.charts != "" %}

{{include.charts}} Controlling the {{title}} from the Charts

<!--------------------------------------------- CHARTS starts -->

You may set a scale value from within the charts by placing the mouse pointer over the corresponding time machine datetime box and scrolling the mouse wheel.

{% include tip.html content="Pressing the mouse wheel while scrolling accelerates the process." %}

<!--------------------------------------------- CHARTS ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a time scale, select *Add Time Scale* on the time machine node menu.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Time Scale* on the menu to access the configuration.

```json
{
    "scale":"0"
}
```

* ```scale``` is a numerical value between 0 and 100. 

{% include note.html content="The value may be entered via the design space and the charts. Both input methods are synchronized and the resulting values are stored in the node." %}

<!--------------------------------------------- CONFIGURING ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}