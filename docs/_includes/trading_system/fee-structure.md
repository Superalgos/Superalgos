<!-- TITLE AND DEFINITION starts -->

{% assign title = "Fee Structure" %}
{% assign definition = site.data.trading_system.fee_structure %}
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

Exchange fees are a crucial part of trading. A strategy may work like a charm when you leave fees out of the equation but would lead you to bankruptcy in a live trading situation. 

Fee structures are factored both in the session reports and in the graphic representation of each trade provided by the simulation trades product of the trading bot.

To illustrate how fees affect your bottom line, take a look at the image below.

[![Trading-Simulation-Fees-Fails](https://user-images.githubusercontent.com/13994516/63636432-8d8cdf80-c66f-11e9-86a3-480d157d8126.gif)](https://user-images.githubusercontent.com/13994516/63636432-8d8cdf80-c66f-11e9-86a3-480d157d8126.gif)

The trade hits the take profit target above the Position Rate level, however, due to fees, the trade has a negative 0.32% ROI.

In the context of forward testing and live trading sessions, the fee structure assumptions do not affect actual transactions. However, the parameter is taken into account when creating simulation layers, which are also available during forward testing and live trading.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
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

Select *Configure Fee Structure* on the menu to access the configuration.

```json
{
"maker": 0.15,
"taker": 0.25
}
```

* ```maker``` is the setting for the fee the exchange charges when an order adds liquidity to the market, such as with limit orders.

* ```taker``` is the setting for the fee the exchange charges when an order takes liquidity from the market, such as with market or instant orders.

{% include note.html content="Check the fees structure in your exchange, carefully looking into the tier you fall in to feed accurate assumptions to your backtesting and paper trading sessions." %}

{% include note.html content="If the fee structure parameter is left empty or detached both from your session and your trading system, fees are not computed during simulations." %}

{% include important.html content="Remember that, for the time being, and until the new execution engine is released, all orders placed by the trading bot are *market orders*, thus, the *taker* fee applies in all cases." %}

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