<!-- TITLE AND DEFINITION starts -->

{% assign title = "Quoted Asset" %}
{% assign definition = site.data.trading_system.quote_asset %}
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

The quoted asset must reference the second asset in the same market of the same exchange as the reference established with the base asset.

<!-- CONTENT ends -->

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add a parameter that may be missing, select *Add Missing Params* on the parameters node menu. 

{% include note.html content="After adding a quoted asset node, make sure you establish a reference to the second asset in the same market of the same exchange as the reference established with the base asset." %}

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- CONFIGURING ends -->

{% endif %}