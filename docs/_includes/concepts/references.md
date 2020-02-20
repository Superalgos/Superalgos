<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "References" %}
{% assign definition = site.data.concepts.reference %}
{% assign preposition = "" %}
{% assign plural = "" %}

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

{{include.heading}}## Establishing and Removing References

To establish a reference, right-click on the first node and drag it close to the target node. Grey rings show which nodes you may establish a reference with. In case there are multiple nodes that would accept the reference, the one closer to the node where the reference originates will have its ring highlighted. Releasing the mouse button establishes the reference, or *links* both nodes. 

The reference is visually represented by a faint grey dotted line. Such line is visible only when both ends of the reference are visible.

To remove a reference or *delink* two nodes, simply right-click the node where the reference originates and make a dentle swipping motion away from the target node.

[![Link-01-link-and-delink](https://user-images.githubusercontent.com/13994516/71175267-7057ce80-2267-11ea-8e97-4cffaa14b993.gif)](https://user-images.githubusercontent.com/13994516/71175267-7057ce80-2267-11ea-8e97-4cffaa14b993.gif)

{% include note.html content="Throughout this documentation we may use the verbs *to link*, *to reference* or *to establish a reference* interchangeably, as synonyms." %}

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.extended == "more" and include.content != "more" and include.heading != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.extended != "no" %}

<!--------------------------------------------- EXTENDED starts -->

{{include.heading}}## Direction

References have a *direction* property relative to each of the nodes involved in the reference: the node establishing the reference sets an *outgoing* reference, while the one accepting the reference sets an *incoming* reference.

For example, a <a data-toggle="tooltip" data-original-title="{{site.data.concepts.session}}">session</a> establishes an outgoing reference with a trading system. This allows the session to access the information within the whole trading system hierarchy, including strategies. At the trading system level, the same reference is viewed as an incoming reference.

[![Sessions-03-Link-Session](https://user-images.githubusercontent.com/13994516/70355703-0e649580-1873-11ea-925e-1f0250148d2c.gif)](https://user-images.githubusercontent.com/13994516/70355703-0e649580-1873-11ea-925e-1f0250148d2c.gif)

{{include.heading}}## Scope

A reference established between nodes of any particular structure within a hierarchy is said to be an *internal* reference relative to the said structure of nodes. Similarly, a reference established with a node outside of the said structure, that is, in a different part of the hierarchy or in another hierarchy, is said to be an *external* reference.

Examples of internal references may be found in the data mine and crypto ecosystem hierarchies. For example, let's briefly look into one such case within a <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.plotter_module}}">plotter module</a>:

The capture below shows the <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.shapes}}">shapes</a> node and several offspring nodes: on one hand, several <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.polygon}}">polygons</a>; on the other hand, the <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.chart_points}}">chart points</a> node.

[![Backups-04-Internal-references-intro-shapes](https://user-images.githubusercontent.com/13994516/71106204-316e3e00-21bf-11ea-8ba0-df5fe9d0000e.gif)](https://user-images.githubusercontent.com/13994516/71106204-316e3e00-21bf-11ea-8ba0-df5fe9d0000e.gif)

Notice that <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.polygon_vertex}}">vertices</a> under each polygon reference to <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.point}}">points</a> under the chart points node.

This means that the node *shapes* feature several internal references.

{% include note.html content="The *backup*, *clone* and *share* operations make different uses of the properties of references. We will cover the three of them extensively so that you may make the most of these features." %}



<!--------------------------------------------- EXTENDED ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}