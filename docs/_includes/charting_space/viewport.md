<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Viewport" %}
{% assign definition = site.data.charting_space.viewport %}
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

The viewport offers a visual environment in which you may see, analyze and go over every piece of data involved in the process of trading cryptocurrencies:

* Live and historic market data;
* Data crunched in the form of indicators;
* The specific effects of the rules you will program into your strategies, and how strategies behave during testing and live trading sessions.

At this point, the system supports one viewport only. Think of the viewport as a huge drawing board. You may have lots of information plotted on different parts of the viewport. You may move the viewport around and zoom in to focus on specific charts.

The information that is out of focus, that is, out of the visible screen, is not read nor rendered graphically, thus, does not consume resources. 

The concept of the viewport allows having multiple charts configured all at once, so that you may consult different exchanges, different markets, different time frames, or different technical studies on demand, simply by moving around and zooming in or out. You may put charts side by side, or even superimpose them to study market flows, search for arbitrage opportunities, or simply keep them in sight when you analyze particular market situations.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
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