<!-- TITLE AND DEFINITION starts -->

{% assign title = "Formula" %}
{% assign definition = site.data.trading_system.formula %}
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

In the context of a trading system, formulas are used to determine the values for stopLoss, takeProfit, positionRate and positionSize.

Formulas may use [internal variables](suite-internal-variables.html) made available by the system. In addition to the ones listed above, other variables such as balanceAssetA and balanceAssetB may be of use.

**For example:**

* ```positionRate - positionRate * 2.5 / 100``` &#8594; This formula may be used to define an initial stop target 2.5% below the rate at which the position was taken.

{% include note.html content="To learn which variables may be used in formulas, see the page about <a href='suite-sysntax-overview.html'>internal variables</a>." %}

<!-- CONTENT ends -->

{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add a formula, select *Add Formula* on the corresponding parent node menu.

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