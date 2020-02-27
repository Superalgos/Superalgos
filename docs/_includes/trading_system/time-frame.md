<!-- TITLE AND DEFINITION starts -->

{% assign title = "Time Frame" %}
{% assign definition = site.data.trading_system.time_frame %}
{% assign preposition = "a" %}
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

In the context of backtesting sessions, what time frame you decide to run the session on depends on the strategies being tested. If strategies make decisions based on the 1 hour candle and above, then ```01-hs``` may be the best choice. However, if decisions are influenced by sub-hour candles then you should match the time frame accordingly.

In the context of live sessions, that is, paper trading, forward testing and live trading, you should run the session on the ```01-min``` time frame so that the trading bot reacts fast when the price tags the take profit or stop loss targets.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about {{ title | downcase }}{{plural}}
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

Select *Configure Time Frame* on the menu to access the configuration.

```js
{
"value": "01-min"
}
```

* ```value``` is the setting for the time frame. You may use any of the values below.

Available options at the sub-hour level are:

```json
01-min
02-min
03-min
04-min
05-min
10-min
15-min
20-min
30-min
45-min
```

Available options at larger time frames are:

```json
01-hs
02-hs
03-hs
04-hs
06-hs
08-hs
12-hs
24-hs
```

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

