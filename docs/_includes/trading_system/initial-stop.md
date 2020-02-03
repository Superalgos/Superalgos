<!-- TITLE AND DEFINITION starts -->

{% assign title = "Initial Stop" %}
{% assign definition = site.data.trading_system.initial_stop %}
{% assign preposition = "the" %}

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

Notice that the setting of the stop target has no relation to the execution of orders. The stop is a target, not an order to be placed. That is, the system does not place stop orders.

This is a design feature that allows you to keep your cards, not allowing anyone to anticipate what your strategy may be, not even the exchange. It is a known fact that some exchanges may attempt or allow to front-run stop orders.

Instead, the trading bot instance monitors the market, and only once the stop target has been hit does it place the corresponding order to close the trade.

The initial target is set in phase 0, that is, the departing point for the management of the trade to be handled in the manage stage.

<!-- CONTENT ends -->

{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add an initial stop node, select *Add Missing Items* on the initial definitions node menu. All items that may be missing are created along with the rest of the basic structure of nodes required to define each of them.

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- CONFIGURING ends -->

{% endif %}

{% if include.starting != "" %}

{{include.starting}} Starting {{preposition}} {{title}}

<!-- STARTING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- STARTING ends -->

{% endif %}