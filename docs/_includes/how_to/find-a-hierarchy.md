<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Find a Hierarchy" %}
{% assign definition = site.data.how_to.find_a_hierarchy %}

<!--------------------------------------------- TITLE AND DEFINITION ends -->

{% if include.more == "yes" and include.heading == "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn how to {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.heading != "" and include.heading != "more" %}
{{include.heading}} How to {{title}}
{% endif %}

{% if include.table == "yes" %}
<table class='definitionTable'><tr><td>
{% endif %}

{% if include.definition == "bold" %}
<strong>{{ definition }}</strong>
{% else %}
{% if include.definition != "no" %}
{{ definition }}
{% endif %}
{% endif %}

{% if include.table == "yes" %}
</td></tr></table>
{% endif %}

{% if include.more == "yes" and include.content == "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn how to {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

**1. Go to the workspace node.**

{% include /how_to/go-to-the-workspace-node.md heading="more" definition="yes" content="yes" extended="no" table="no" more="yes"%}

**2. Pan the design space in the desired direction.**

The design space is organized over a square perimeter around the workspace node, and each hierarchy is located on one of the cardinal directions. Hierarchies feature an ever-present white ring. The ring hints the direction in which a hierarchy is located.

| Hierarchy | Cardinal Direction | Direction | Keyboard Shortcut (windows only) |
| :--- | :---: | :---: | :--- |
| **Sparta Data Mine** | North | &#8593; | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>S</kbd> (*S for Sparta*) |
| **WHB Trading System** | North East | &#8599; | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>W</kbd> (*W for Weak Hands Buster*) |
| **BRR trading System** | East | &#8594; | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>B</kbd> (*B for Bull Run Rider*) |
| **Super Scripts** | South East | &#8600; | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Z</kbd> (*Z for, well...*) |
| **Network** | South | &#8595; | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>N</kbd> (*N for Network*) |
| **Crypto Ecosystem** | South West | &#8601; | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>E</kbd> (*E for Ecosystem*) |
| **Charting System** | West | &#8592; | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> (*C for Charting System*) |
| **Masters Data Mine** | North West | &#8598; | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>M</kbd> (*M for Masters*) |

{% include image.html file='how-to/find-a-hierarchy-00.gif' url='yes' max-width='100' caption='Navigate to the desired hierarchy starting from the workspace node and following the corresponding vertical, horizontal or diagonal direction. Once on a hierarchy, you can reach the next one by following a square perimeter around the workspace.' %}

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.extended == "more" and include.content != "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn how to {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.extended != "no" %}

<!--------------------------------------------- EXTENDED starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!--------------------------------------------- EXTENDED ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}