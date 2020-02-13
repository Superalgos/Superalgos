<!-- TITLE AND DEFINITION starts -->

{% assign title = "Slippage" %}
{% assign definition = site.data.trading_system.slippage %}
{% assign preposition = "a" %}
{% assign plural = "" %}

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
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

In the context of forward testing and live trading sessions, slippage does not affect the actual transactions. However, the parameter is taken into account when creating simulation layers, which are also available during forward testing and live trading.

Slippage is factored both in the session reports and in the graphic representation of each trade provided by the simulation trades product of the trading bot.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a parameter that may be missing, select *Add Missing Params* on the parameters node menu. 

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

Select *Configure Slippage* on the menu to access the configuration.

```json
{
"positionRate": 0.1,
"stopLoss": 0.2,
"takeProfit": 0.3
}
```

* ```positionRate``` is the slippage value to be applied to the rate of the take position order, expressed as a percentage (*i.e.:* 0.1 means 0.1%).

* ```stopLoss``` is the slippage value to be applied to the rate of the stop order, expressed as a percentage (*i.e.:* 0.2 means 0.2%).

* ```takeProfit``` is the slippage value to be applied to the rate of the take profit order, expressed as a percentage (*i.e.:* 0.3 means 0.3%).

The number you enter is applied as a percentage of the price of the order and added or subtracted from the price depending on the circumstances, always working against you. For instance, ```"positionRate": 0.1``` means the position will be set at a price 0.1% higher or lower depending on which of the assets in the pair is your base asset. 

{% include note.html content="If the slippage parameter is left empty or detached both from your session and your trading system, slippage is not computed during simulations."%}

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