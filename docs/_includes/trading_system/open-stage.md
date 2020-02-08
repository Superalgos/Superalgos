<!-- TITLE AND DEFINITION starts -->

{% assign title = "Open Stage" %}
{% assign definition = site.data.trading_system.open_stage %}
{% assign preposition = "the" %}
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

Conceptually, the open stage deals with the details that concern the opening of a trade once the decision to take a position has been made. In this stage, you deal with the aforementioned parameters, each of which is defined by a formula.

Ideally, the open stage would also handle the parameters that define the execution of the trade, that is, how and which kinds of orders are to be placed, on which exchanges and so on. However, the execution side of the system is still under development. For the time being, execution is drastically simplified: a single market order is placed for each order.

{% include note.html content="Learn more about the temporal <a href='suite-execution-limitation.html'>execution limitations</a>." %}

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!--------------------------------------------- ADDING starts -->

To add an open stage node, select *Add Missing Stages* on the strategy node menu. All stages that may be missing are created along with the rest of the basic structure of nodes required to define each of them and their events.

{% include note.html content="Only one open stage may exist in each strategy." %}

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

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