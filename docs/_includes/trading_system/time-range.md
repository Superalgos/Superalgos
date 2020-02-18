<!-- TITLE AND DEFINITION starts -->

{% assign title = "Time Range" %}
{% assign definition = site.data.trading_system.time_range %}
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

Select *Configure Time Range* on the menu to access the configuration. The configuration varies slightly depending on the type of session you are running.

{{include.configuring}}# On Backtesting Sessions

```json
{
"initialDatetime": "2019-09-01T00:00:00.000Z",
"finalDatetime": "2019-09-25T00:00:00.000Z"
}
```

* ```initialDatetime``` is the datetime the session starts at. If you don't set an *initialDatetime* the system's fallback mechanism will try to get it from the parameters defined at the level of the trading system.

* ```finalDatetime``` is the datetime the session finishes at. If you don't set a *finalDatetime* at the level of the testing session or the trading system, then calculations will run until the date there is data available.

{{include.configuring}}# On Paper Trading, Forward Testing and Live Trading Sessions

These sessions always start at the datetime the session is run, therefore, there is no configuration of an initial datetime.

```json
{
"finalDatetime": "2019-09-25T00:00:00.000Z"
}
```

* ```finalDatetime``` is the datetime the session finishes at. If you don't set a *finalDatetime* at the level of the testing session or the trading system, then the session runs for one year.

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