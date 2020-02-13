<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Time Frame Scale" %}
{% assign definition = site.data.charting_space.time_frame_scale %}
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

When the time frame scale is set at the level of the time machine, the scale setting affects all charts within the time machine. When set at the level of the timeline chart, the setting overrides the time frame scale at the time machine level. This allows comparing charts in different time frames, but still synchronized at the datetime level.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.charts != "" %}

{{include.charts}} Controlling the {{title}} from the Charts

<!--------------------------------------------- CHARTS starts -->

You may set a time frame value from within the charts by placing the mouse pointer over the corresponding time machine or timeline chart time frame box and scrolling the mouse wheel.

<!--------------------------------------------- CHARTS ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a time frame scale, select *Add Time Frame Scale* on the time machine or the timeline chart node menu.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Frame Scale* on the menu to access the configuration.

```json
{
    "value":"06-hs"
}
```

* ```value``` can be any of the time frames supported by the system:

  * ```01-min```, ```02-min```, ```03-min```, ```04-min```, ```05-min```, ```10-min```, ```15-min```, ```20-min```, ```30-min```, ```40-min```, and ```45-min```.

  * ```01-hs```, ```02-hs```, ```03-hs```, ```04-hs```, ```06-hs```, ```08-hs```, ```12-hs```, and ```24-hs```.

  {% include note.html content="The values entered via the design space and the charts are synchronized and stored in the node." %}

<!--------------------------------------------- CONFIGURING ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}