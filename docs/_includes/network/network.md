<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Network" %}
{% assign definition = site.data.network.network %}
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

You will use the network hierarchy for the following purposes:

* To control your data mining, that is, processes running <a data-toggle="tooltip" data-original-title="{{site.data.concepts.sensor_bot}}">sensor</a> and <a data-toggle="tooltip" data-original-title="{{site.data.concepts.sensor_bot}}">indicator bots</a>. These keep your data feeds up to date so that you may trade live with quality information.

* To control your testing environment, that is trading sessions including <a data-toggle="tooltip" data-original-title="{{site.data.network.backtesting_session}}">backtesting</a> and <a data-toggle="tooltip" data-original-title="{{site.data.network.paper_trading_session}}">paper trading</a>.

* To control your production environment, that is, <a data-toggle="tooltip" data-original-title="{{site.data.network.forward_testing_session}}">forward testing</a>, and <a data-toggle="tooltip" data-original-title="{{site.data.network.live_trading_session}}">live trading sessions</a> running the <a data-toggle="tooltip" data-original-title="{{site.data.concepts.trading_bot}}">trading bot</a>.

* To control your data storage, that is, to administer the physical location in which the data products produced by bots reside.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

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