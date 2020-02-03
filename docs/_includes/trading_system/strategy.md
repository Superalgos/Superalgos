<!-- TITLE AND DEFINITION starts -->

{% assign title = "Strategy" %}
{% assign definition = site.data.trading_system.strategy %}
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

The definition of a strategy may be analyzed in three sections:

{% include callout.html type="primary" content="<strong>A strategy is a set of actions occurring in stages</strong>" %}

Strategies are defined in the following steps:

* <a href="suite-trading-system-hierarchy.html#trigger-stage" data-toggle="tooltip" data-original-title="{{site.data.trading_system.trigger_stage}}">Trigger Stage</a>
* <a href="suite-trading-system-hierarchy.html#open-stage" data-toggle="tooltip" data-original-title="{{site.data.trading_system.open_stage}}">Open Stage</a>
* <a href="suite-trading-system-hierarchy.html#manage-stage" data-toggle="tooltip" data-original-title="{{site.data.trading_system.manage_stage}}">Manage Stage</a>
* <a href="suite-trading-system-hierarchy.html#close-stage" data-toggle="tooltip" data-original-title="{{site.data.trading_system.close_stage}}">Close Stage</a>

These stages are played in a sequence: once a strategy is *triggered* it looks to *open* a position; once a position is open, it is time to *manage* it as the trade develops; and once a stop or take profit target is hit, it is time to *close* the position.

{% include callout.html type="primary" content="<strong>designed to achieve a specific goal within a broader plan</strong>" %}

Your investment plan or trading carrer may have any number of goals (*e.g.: accumulating bitcoin, diversifying on a basket of coins, annual profit targets, etc.*). If you attempt to achieve two different goals with a single strategy, you may run into problems. It may be doable, but the strategy would certainly be more complex. In any case, the logical thing to do is to analyze each goal separately so that you can design at least one clear, straightforward strategy for each goal.

{% include callout.html type="primary" content="<strong>via executing trades</strong>" %}

The definition of strategy points to the concept of *a trade*. A trade is a process that exchanges the base asset for the quoted asset and that—after some time, as the trade develops and targets are hit—exchanges back the quoted asset for the base asset. The first and foremost rule of a trade is to preserve capital and its main goal is to increase it.

<!-- CONTENT ends -->

{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add a strategy, select *Add Strategy* on the trading system node menu. The strategy node is created along with the rest of the basic structure of nodes required to define each of the strategy stages and their events.

{% include tip.html content="You may work with as many strategies as you wish. " %}

{% include important.html content="Strategies within the same trading system work in the same market, have the same base asset, and &mdash;most importantly&mdash;share the same capital. This means that only one strategy in the trading system may be triggered at any one point and that no other strategy in the trading system may be triggered until the first one is triggered off. If you wish to have more than one strategy trading at the same time, then those strategies must be put in separate trading systems. " %}

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- CONFIGURING ends -->

{% endif %}