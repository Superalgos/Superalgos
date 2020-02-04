<!-- TITLE AND DEFINITION starts -->

{% assign title = "Trading System" %}
{% assign definition = site.data.trading_system.trading_system %}
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

In practical terms, a trading system is a hierarchical arrangement organizing the actionable aspects of your investment plan. The hierarchy contains definitions regarding any number of trading strategies, all sharing the same market, the same base asset, and the same initial capital.

You use a trading system to define strategies following the trading framework implemented by the Superalgos Protocol, splitting strategies into four stages: trigger, open, manage, and close.

The concept of describing strategies in phases is fundamental to the methodical aspect of the trading system, as it provides a framework to run every strategy with the same logic, which contributes to developing scalable trading systems that may grow to any number of strategies.

<!-- CONTENT ends -->

{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add a trading system, select *Add Trading System* on the workspace node menu. 

{% include tip.html content="You may work with as many trading systems as you wish" %}

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- CONFIGURING ends -->

{% endif %}