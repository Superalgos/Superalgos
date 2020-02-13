<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Style Condition" %}
{% assign definition = site.data.data_mine.style_condition %}
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

Style conditions offer a way to introduce additional intelligence on the visual representation of data by using styles that respond to certain conditions.

For example, the *Percentage Bandwidth* plotter module assigns a different color to the Moving Average line when it's going up or down.

To do that, a style condition features it's own style so that, when the condition validates true, the new style is applied.

Style conditions me be created in a sequence so that the style may continue changing upon the validation of a series of style conditions. The system evaluates all style conditions in a sequential order determined by their position in the rotational symmetry around the parent node. Each condition that is met may modify or add up to the resulting style that is rendered on screen. That is, the final style is the result of the sequential application of the styles defined for each condition that is met, on top of the default style.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a style condition, select *Add Style Condition* on a polygon border or polygon body node menu.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Editing a {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Edit Condition* on the menu to access the configuration.

Style conditions work pretty much like conditions used on trading systems. The main difference is that the variables available are solely those provided by the bot product definition that reference the corresponding plotter module.

To continue the example of the Percentage Bandwidth plotter, the following is the condition that determines the newly added styles:

```js
record.previous.movingAverage > record.movingAverage
```

As hinted earlier, when the condition is met, the default style is modified by a second style that may be created on the menu of the style condition node.

The definition of secondary styles is slightly different from that of the default style, as&mdash;in such cases&mdash;the ```atMousePosition``` property may no longer be defined:

```js
{
    "opacity": 0.55,
    "lineWidth": 1,
    "lineDash": [0,0],
    "paletteColor": "UI_COLOR.RED"
}
```


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