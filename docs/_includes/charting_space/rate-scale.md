<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Rate Scale" %}
{% assign definition = site.data.charting_space.rate_scale %}
{% assign preposition = "a" %}
{% assign plural = "s" %}

<!--------------------------------------------- TITLE AND DEFINITION ends -->

{% if include.more == "yes" and include.heading == "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.heading != "" and include.heading != "more" %}
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
{% if include.definition != "no" %}
{{ definition }}
{% endif %}
{% endif %}

{% if include.table == "yes" and include.icon != "no" %}
</td></tr></table>
{% endif %}

{% if include.more == "yes" and include.content == "more" and include.heading != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

Rate scales may exist both at the level of a time machine and at the level of a timeline chart, each affecting the corresponding concept.

When set at the level of the time machine, the scale settings affect all charts within the time machine. When set at the level of the timeline chart, the settings override the rate scale at the time machine level. This allows having multiple charts on the same time machine, each with a different rate scale.

{% if include.heading == "more" %}##{% else %}{{include.heading}}{% endif %}### Scale Minimum and Maximum Values

A rate scale has a minimum and a maximum value. The minimum value is the value at bottom of the chart. The maximum, is the value at the top of the chart.

In technical terms, the minimum and maximum scale values are constantly changing as, whenever you pan across the charts, you are directly affecting the minimum and maximum scale values. That said, the actual scale may change dynamically or not, depending on the scale-automation settings.

{% if include.heading == "more" %}##{% else %}{{include.heading}}{% endif %}### Automatic Scale

The system features an automatic adjustment of the scale, which is turned on by default in our shared workspaces. The scale may be automatic in its minimum value, in its maximum value, or both. 

When the scale is automatic in the minimum value, the scale is adjusted so that no piece of information in the span of the chart ever remains below the bottom of the chart. As a result, the lowest data point aligns with the bottom of the chart.

When the scale is automatic in the maximum value, the scale is adjusted so that no piece of information in the span of the chart ever remains above the top of the chart. As a result, the highest data point aligns with the top of the chart.

The scale may be automated on either, or both minimum and maximum values at the same time. In the later case, no data point in the span of the chart ever remains out of the visible area of the chart, as the lowest data point aligns with the bottom of the chart and the highest aligns with the top.

{% if include.heading == "more" %}##{% else %}{{include.heading}}{% endif %}### Manual Scale

The system also features a manual mode. When in manual mode the scale does not change, even if the minimum and maximum values change while panning across a chart. This design feature allows comparing different periods using the same scale, which may be valuable in many cases. 

{% if include.heading == "more" %}##{% else %}{{include.heading}}{% endif %}### Scale Offset

The offset is a feature of the rate scale by which the scale may be shifted upwards or downwards. As a result, charts aligned on the vertical axis&mdash;synchronized in datetime by a shared time machine&mdash;may be put one above the other. In technical terms, what happens is that the scale is shifted upwards or downwards.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.charts != "" %}

{{include.charts}} Controlling the {{title}} from the Charts

<!--------------------------------------------- CHARTS starts -->

{{include.charts}}# Automatic Scale

**1. To change the automatic scale settings**, place the mouse pointer over the corresponding time machine or timeline chart rate box, press the <kbd>Shift</kbd> key and slowly scroll the wheel of the mouse. The action cycles through different possible scale automation settings. Notice a tiny green triangle below and/or above the rate scale icon. 

* A triangle pointing up means that the maximum value of the scale is automatic. 

* A triangle pointing down means that the minimum value of the scale is automatic.

* Both triangles present at the same time means that both minimum and maximum values are automatic.

* No triangle means that both minimum and maximum values are in manual mode.

{{include.charts}}# Manual Scale

**2. To adjust the scale**, make sure either or both minimum and maximum values are in manual mode. Place the mouse pointer over the corresponding time machine or timeline chart rate box and scroll the wheel of the mouse. The scale will increase or decrease accordingly, depending on which values are set to manual.

Notice that, while changing the scale, a number is displayed replacing the actual rate. This is a reference value of the scale, that may serve for comparison purposes, with scales in other charts.

{% include note.html content="This action has no effect when both minimum and maximum values are set to automatic mode." %}

{{include.charts}}# Scale Offset

**3. To shift or offset a timeline chart on the vertical axis**, place the mouse pointer on the rate box, left-click and drag upwards or downwards, as desired. The timeline chart will shift in the specified direction while the remaining charts stay in the same position.

{% include note.html content="Setting an offset in a timeline chart only makes sense in the context of a time machine with multiple charts. That is, if you are browsing a single chart, an offset behaves the same as moving the single chart up or down." %}


<!--------------------------------------------- CHARTS ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

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
    "minValue": 388.60416666666424,
    "maxValue": 9715.104166666664,
    "autoMinScale": true,
    "autoMaxScale": true
}
```

* ```minValue``` is a numerical value that represents the value of the scale at the bottom of the chart.

* ```maxValue``` is a numerical value that represents the value of the scale at the top of the chart.

* ```autoMinScale``` sets the mode of the scale for the minimum value; ```true``` sets the value to automatic, ```false``` sets the value to manual. 

* ```autoMaxScale``` sets the mode of the scale for the maximum value; ```true``` sets the value to automatic, ```false``` sets the value to manual. 

{% include note.html content="The ```minValue``` and ```maxValue``` may be entered via the design space and the charts. Both input methods are synchronized and the resulting values are stored in the node." %}

<!--------------------------------------------- CONFIGURING ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}