<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Style" %}
{% assign definition = site.data.data_mine.style %}
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

A style applied to a polygon body or a polygon border node acts as the default style.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a style, select *Add Style* on a polygon border or polygon body node menu.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Style* on the menu to access the configuration.

A typical definition for a polygon body style looks like this:

```json
{
    "default": {
        "opacity": 0.2,
        "paletteColor": "UI_COLOR.DARK_TURQUOISE"
    },
    "atMousePosition": {
        "opacity": 0.3,
        "paletteColor": "UI_COLOR.DARK_TURQUOISE"
    }
}
```

A typical definition for a polygon border style has a couple more properties:

```json
{
    "default": {
        "opacity": 0.2,
        "lineWidth": 1,
        "lineDash": [0,0],
        "paletteColor": "UI_COLOR.DARK_TURQUOISE"
    },
    "atMousePosition": {
        "opacity": 0.3,
        "lineWidth": 2,
        "lineDash": [0,0],
        "paletteColor": "UI_COLOR.RUSTED_RED"
    }
}
```

The first section of the definition refers, as explicitly stated, to the default state of the style.

The second section refers to the style assigned to the column or period on which the mouse pointer is located. This is very useful for highlighting the specific zone of interest as the user browses the charts.

* ```opacity``` is probably self-explanatory: it may range from ```0``` for a fully transparent object to ```1``` for a solid object.

* ```paletteColor``` sets the color for the *fill* or *stroke* in cases of polygon bodies and polygon borders respectively. Use the variable ```UI_COLOR``` followed by a ```.``` and any of the properties in the following list for a selection of currently available colors:

| Variable Value | RGB Value | Color Sample |
| :--- | :---: | :------------------- |
| ```DARK``` | 48, 48, 54 | <span style="display: block; background: RGB(48, 48, 54); border: 1px solid black;">&nbsp;</span> |
| ```LIGHT``` | 234, 226, 222 | <span style="display: block; background: RGB(234, 226, 222); border: 1px black; border: 1px solid black;">&nbsp;</span> |
| ```GREY``` | 150, 150, 150 | <span style="display: block; background: RGB(150, 150, 150); border: 1px solid black;">&nbsp;</span> |
| ```LIGHT_GREY``` | 247, 247, 247 | <span style="display: block; background: RGB(247, 247, 247); border: 1px solid black;">&nbsp;</span> |
| ```WHITE``` | 255, 255, 255 | <span style="display: block; background: RGB(255, 255, 255); border: 1px solid black;">&nbsp;</span> |
| ```BLACK``` | 0, 0, 0 | <span style="display: block; background: RGB(0, 0, 0); border: 1px solid black;">&nbsp;</span> |
| ```GOLDEN_ORANGE``` | 240, 162, 2 | <span style="display: block; background: RGB(240, 162, 2); border: 1px solid black;">&nbsp;</span> |
| ```RUSTED_RED``` | 204, 88, 53 | <span style="display: block; background: RGB(204, 88, 53); border: 1px solid black;">&nbsp;</span> |
| ```GREEN``` | 188, 214, 67 | <span style="display: block; background: RGB(188, 214, 67); border: 1px solid black;">&nbsp;</span> |
| ```RED``` | 223, 70, 60 | <span style="display: block; background: RGB(223, 70, 60); border: 1px solid black;">&nbsp;</span> |
| ```PATINATED_TURQUOISE``` | 27, 153, 139 | <span style="display: block; background: RGB(27, 153, 139); border: 1px solid black;">&nbsp;</span> |
| ```TITANIUM_YELLOW``` | 244, 228, 9 | <span style="display: block; background: RGB(244, 228, 9); border: 1px solid black;">&nbsp;</span> |
| ```MANGANESE_PURPLE``` | 91,80, 122 | <span style="display: block; background: RGB(91,80, 122); border: 1px solid black;">&nbsp;</span> |
| ```TURQUOISE``` | 74, 207, 217 | <span style="display: block; background: RGB(74, 207, 217); border: 1px solid black;">&nbsp;</span> |
| ```DARK_TURQUOISE``` | 2, 149, 170 | <span style="display: block; background: RGB(2, 149, 170); border: 1px solid black;">&nbsp;</span> |

* ```lineWidth``` is the width of the border line, which should be greater than 0.

* ```lineDash``` is used to turn the border into a dashed-line; the first value corresponds to the length of the dash while the second value defines the length of the space.

{% include note.html content="When using dashed lines, bear in mind that the drawing from one column or period is independent of the next. Big values for dashes and spaces may not work well for lines that span several columns." %}

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