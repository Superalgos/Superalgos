<!-- TITLE AND DEFINITION starts -->

{% assign title = "Base Asset" %}
{% assign definition = site.data.trading_system.base_asset %}
{% assign preposition = "a" %}

<!-- TITLE AND DEFINITION ends -->

{% if include.heading != "" %}
{{include.heading}} {{title}}
{% endif %}

{% if include.icon != "no" %}
<img src='images/icons/{{include.icon}}{{ title | downcase | replace: " ", "-" }}.png' />
{% endif %}

**{{ definition }}**

<!-- CONTENT starts -->

The basse asset must reference an asset in a specific market of a specific exchange in the Crypto Ecosystem hierarchy.

<!-- CONTENT ends -->

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add a parameter that may be missing, select *Add Missing Params* on the parameters node menu. 

{% include note.html content="After adding a base asset node, make sure you establish a reference to the asset in a specific market of a specific exchange in the Crypto Ecosystem hierarchy." %}

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

Select *Configure Base Asset* on the menu to access the configuration.

```json
{
"initialBalance": 0.001,
"minimumBalance": 0.0001,
"maximumBalance": 0.1
}
```

* ```initialBalance``` is the amount of capital you wish to allocate to the trading system.

* ```minimumBalance``` is the threshold of accummulated losses that switches off the session; when your overall balance (balanceAssetA + balanceAssetB) drops to this value, all trading stops; think of the ```minimumBalance``` as a general safety switch.

* ```maximumBalance``` is a similar concept as with the ```minimumBalance``` but on the high side of the ```initialBalance```.


<!-- CONFIGURING ends -->

{% endif %}