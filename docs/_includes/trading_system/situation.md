<!-- TITLE AND DEFINITION starts -->

{% assign title = "Situation" %}
{% assign definition = site.data.trading_system.situation %}
{% assign preposition = "a" %}

<!-- TITLE AND DEFINITION ends -->

{% if include.heading != "" %}
{{include.heading}} {{title}}
{% endif %}

{% if include.icon != "no" %} 

{% if include.table == "y" %}
<table class="definitionTable"><tr><td>
{% endif %}

<img src='images/icons/{{include.icon}}{{ title | downcase | replace: " ", "-" }}.png' />

{% if include.table == "y" %}
</td><td>
{% endif %}

{% endif %}

{% if include.definition != "regular" %}

<strong>{{ definition }}</strong>

{% else %}

{{ definition }}

{% endif %}

{% if include.table == "y" and include.icon != "no" %}
</td></tr></table>
{% endif %}

{% if include.content != "n" %}

<!-- CONTENT starts -->

In other words, you define situations in which you wish a certain event to happen (*i.e.:* trigger on the strategy, take a position, etc.) and each situation is described as a set of conditions that need to be met for the event to be triggered.

A situation gets validated when all conditions under it are true. 

An event may have more than one situation attached to it. In such a case, when any of the situations gets validated, it triggers the event. That is, events may be triggered in different circumstances, meaning that you are free to define different situations upon which the same event would be triggered. In such a case, when any of the situations evaluate true, then the event is triggered.

<!-- CONTENT ends -->

{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add a situation, select *Add Situation* on the corresponding event node menu. A situation is added along with a condition and JavaScript code node.

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- CONFIGURING ends -->

{% endif %}