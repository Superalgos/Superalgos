<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Polygon Vertex" %}
{% assign definition = site.data.data_mine.polygon_vertex %}
{% assign preposition = "a" %}
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

Vertices are the main element defining polygons. Once created, each vertex must establish a reference to the corresponding point in the charts point.

[![Vertex-01-add-and-link](https://user-images.githubusercontent.com/13994516/71016081-eb4ca800-20f4-11ea-8fee-4d38ecfb0596.gif)](https://user-images.githubusercontent.com/13994516/71016081-eb4ca800-20f4-11ea-8fee-4d38ecfb0596.gif)

Drawing curves requires two vertices. Painting areas, such as the background of a chart, likely requires four vertices. Note that vertices are not capable of featuring a style. Instead, styles are applied to polygon borders and polygon bodies.

{% include important.html content="Bear in mind that the order in which vertices in a polygon are arranged around the parent polygon node when their *rotational symmetry* property is selected, is the order in which the plotter computes the points. This means that points need to be in the correct order, for example, when drawing a box. Imagine drawing a box on a piece of paper without lifting the pencil... that is how the plotter does it." %}

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a polygon vertex, select *Add Polygon Vertex* on the polygon node menu.

{% include tip.html content="Remember that a vertex must establish a reference to a point in the charts point to be properly defined" %}

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