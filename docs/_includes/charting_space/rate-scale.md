<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Rate Scale" %}
{% assign definition = site.data.charting_space.rate_scale %}
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
<details><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

Rate scales may exist both at the level of a time machine and at the level of a timeline chart, each affecting the corresponding concept.

When set at the level of the time machine, the scale setting affects all charts within the time machine. When set at the level of the timeline chart, the setting overrides the rate scale at the time machine level. This allows having multiple charts on the same time machine, each with a different rate scales.

* **Scale Value:** When the scale is set to zero, the vertical span of the time machine or the timeline chart is the smallest possible. When the scale is set to 100, it is the largest possible. In other words, the charts are compressed on the vertical axis with low scale numbers and expanded as the scale increases.

* **Scale Offset:** The offset is a property of the rate scale by which the scale may be shifted upwards or downwards. As a result, charts aligned in the vertical axis&mdash;synchronized in datetime by a shared time machine&mdash;may be put one above the other.

* **Scale Minimum and Maximum:** The rate scale remains the same at all times unless you change it. This means that&mdash;unlike in other platforms&mdash;the rate scale does not adjust dynamically depending on the information on the screen. This is a design choice so that rates may be easily comparable along the datetime span of the market.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.charts != "" %}

{{include.charts}} Controlling the {{title}} from the Charts

<!--------------------------------------------- CHARTS starts -->

You may set a scale value from within the charts by placing the mouse pointer over the corresponding time machine or timeline chart rate box and scrolling the mouse wheel. Add the <kbd>Shift</kbd> key to affect the offset.

{% include tip.html content="Pressing the mouse wheel while scrolling accelerates the process." %}

<!--------------------------------------------- CHARTS ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!--------------------------------------------- ADDING starts -->

To add a rate scale, select *Add Rate Scale* on the time machine or the timeline chart node menu.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Rate Scale* on the menu to access the configuration.

```json
{
    "scale":"50",
    "offset":0,
    "minValue":0,
    "maxValue":25000
    }
```

* ```minValue``` sets the value for the origin of the y-axis, that is, the rate scale. Usually, this value would be zero, but it doesn't need to be zero, as it is configurable.

* ```maxValue``` may be set to any positive number.

* ```scale``` is a numerical value between 0 and 100. 

* ```offset``` is a numerical value which may be positive or negative, with no specific minimum or maximum. 

{% include note.html content="The values for scale and offset may be entered via the designer and the charts. Both input methods are synchronized and the resulting values are stored in the node." %}

<!--------------------------------------------- CONFIGURING ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}