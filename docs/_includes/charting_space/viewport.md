<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Viewport" %}
{% assign definition = site.data.charting_space.viewport %}
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

At this point, the system supports one viewport only. When you navigate through the charts, panning, zooming or moving elements around, what you are doing is panning and zooming on the viewport. That is, you are not moving the charts, but the space that contains them.

Think of the viewport as a huge drawing board. You can have lots of information plotted on different parts of the board, so you move the viewport around and zoom in to focus on specific bits of information.

When you zoom out, you are bringing more information in focus. Because information is handled dynamically, reading data from files, interpreting it, and drawing the corresponding visual elements on the screen in real-time, zooming out or&mdash;in general&mdash;bringing lots of information in focus may slow your system down. The information that is out of focus, that is, out of the visible screen, is not processed. 

The concept of the viewport allows having multiple charts configured all at once, so that you may consult different exchanges, different markets, or different technical studies on demand, simply by moving around and zooming in or out on the viewport. You may put any of those elements side by side, or even superimpose them to study market flows, search for arbitrage opportunities, or simply keep them in sight when you analyze particular market situations.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!--------------------------------------------- CONFIGURING ends -->

{% endif %}

{% if include.charts != "" %}

{{include.charts}} Controlling the {{title}} from the Charts

<!--------------------------------------------- CHARTS starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!--------------------------------------------- CHARTS ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}