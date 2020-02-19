<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Layer" %}
{% assign definition = site.data.charting_space.layer %}
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

To set up a layer, you need to establish a <a href="suite-references.html" data-toggle="tooltip" data-original-title="{{site.data.concepts.reference}}">reference</a> with the <a href="suite-network-hierarchy.html#data-product" data-toggle="tooltip" data-original-title="{{site.data.network.data_product}}">data product</a> of your choice.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.charts != "" %}

{{include.charts}} Controlling the {{title}} from the Charts

<!--------------------------------------------- CHARTS starts -->

To turn layers on and off, simply click on the layer in the corresponding products panel.

To turn on and off a layer panel, click the panel button on the bottom-left corner of the layer.

<!--------------------------------------------- CHARTS ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a layer, select *Add Layer* on the layer manager node menu. 

{% include note.html content="After adding a layer node, make sure you establish a reference to the corresponding data product in the data storage node of the network hierarchy." %}

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Layer* on the menu to access the configuration.

```json
{
    "status":"on", 
    "showPanels":true
}
```

* ```status``` may be *on* or *off* and refers to the layer being visible or not on the charts.

* ```showPanels``` may be *true* or *false*; *true* shows the plotter panel that may be associated with the data product as per the plotter module definitions; *false* makes panels invisible.

<!--------------------------------------------- CONFIGURING ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}