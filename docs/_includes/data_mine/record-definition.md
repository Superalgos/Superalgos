<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Record Definition" %}
{% assign definition = site.data.data_mine.record_definition %}
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

Bots store data in the form of arrays of records, in a minimized plain text file and the standard JSON format, although not as objects with named properties, but as arrays.

[![image](https://user-images.githubusercontent.com/13994516/68998023-303eae00-08ad-11ea-9baa-ddea801c7d6d.png)](https://user-images.githubusercontent.com/13994516/68998023-303eae00-08ad-11ea-9baa-ddea801c7d6d.png)

The choice of plain text for storage of large volumes of information has benefits in terms of not requiring any sophisticated technology to store and serve the data (*i.e.:* no database is required).

Best practice indicates that there needs to be a balance between the amount of data that is stored and calculations that may be performed at runtime.

Storing objects with named properties in the JSON format would be inappropriate as labels would repeat over and over, creating a ridiculous amount of unnecessary information. However, storing arrays in the JSON standard facilitates the handling of files in the context of JavaScript and Node.JS.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a record definition node, select *Add Record Definition* on the product definition node menu. A record definition node is created along with the first record property.

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