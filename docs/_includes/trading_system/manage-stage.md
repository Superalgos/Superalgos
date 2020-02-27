<!-- TITLE AND DEFINITION starts -->

{% assign title = "Manage Stage" %}
{% assign definition = site.data.trading_system.manage_stage %}
{% assign preposition = "the" %}
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

The management of a trade aims to increase the efficiency of your trading system. Conceptually, a trade is not an instantaneous event, but an event which has an opening, a period of maturation, and a closing. The management of the trade happens in that period of maturation.

The concept of managing the trade means that the formulas to determine the take profit and stop may change as the trade develops. The typical situation in which you may want to change your original take profit and stop formulas is when the trade seems to be going well in your favor.

It may be in your best interest to manage both stop and take-profit targets, moving them in the direction of the trade as the market moves, allowing some leeway for a larger profit than expected and, at the same time, cutting the potential for losses.

The management of the trade is handled in phases. Actually, the management of take profit and stop—while correlated—is done independently of each other, therefore, each concept has its own set of phases.

When a situation defined by a set of conditions is met, the next phase event indicates that the take profit or stop formulas shall be changed. At the moment those predefined conditions are met, you enter the next phase. Keep in mind that the trade is in constant development, so there may be as many phases as you deem appropriate for your particular strategy.

The idea of having different phases comes from the notion that big market moves tend to provide clues as to what may come up next. For instance, rallies may accelerate as more traders join the move. Recognizable patterns may emerge. Signs of exhaustion may be identified.

All of these considerations should feed the dynamic analysis performed as the trade develops, and may be contrasted with the predefined conditions that may push take profit or stop further, entering one phase after the next.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a manage stage node, select *Add Missing Stages* on the strategy node menu. All stages that may be missing are created along with the rest of the basic structure of nodes required to define each of them and their events.

{% include note.html content="Only one manage stage may exist in each strategy." %}

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