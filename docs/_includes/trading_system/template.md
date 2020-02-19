<!-- TITLE AND DEFINITION starts -->

{% assign title = "XXXXXXXXXXXXXXXX" %}
{% assign definition = site.data.trading_system.XXXXXXXXXXXXXXXX %}
{% assign preposition = "XXXXXXXXXXXXXXXX" %}

<!-- TITLE AND DEFINITION ends -->

{% if include.heading != "" %}
{{include.heading}} {{title}}
{% endif %}

{% if include.icon != "no" %}
<img src='images/icons/{{include.icon}}{{ title | downcase | replace: " ", "-" }}.png' />
{% endif %}

**{{ definition }}**

<!-- CONTENT starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- CONTENT ends -->

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- CONFIGURING ends -->

{% endif %}