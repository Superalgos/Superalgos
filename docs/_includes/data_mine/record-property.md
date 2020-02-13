<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Record Property" %}
{% assign definition = site.data.data_mine.record_property %}
{% assign preposition = "a" %}
{% assign plural = "s" %}

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
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about record properties
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

Records may have as many properties as required. 

{% include important.html content="The order in which record properties are defined around the parent record definition node is the order in which they are stored in the actual record." %}

{% include tip.html content="The first two records are usually the *begin* and *end* records, featuring the corresponding datetimes that indicate when the record starts and ends." %}

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about record properties
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a record property, select *Add Record Property* on the bot's node menu.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Property* on the menu to access the configuration.

```js
{
  "codeName": "record-name",
  "isString": false,
  "isCalculated": true
}
```

* ```codeName``` is the name of the record as it is used in the bot's code. 

* ```isString``` determines if the field is a text string or if, in turn, is a numeric field. Dates are stored in the *epoch* format, which is numeric. The reason why this configuration is important is that fields that are strings need to be stored between "double quotes".

* ```isCalculated``` determines if the field is stored in the dataset or if, instead, is calculated at a later stage. A value *true* means that the record is not stored. In the case ```isCaculated``` is not defined in the configuration, it is assumed to be false.

[![Indicators-Record-Definitions-01](https://user-images.githubusercontent.com/13994516/69139160-3ce72000-0ac0-11ea-9566-a259c9ea6194.gif)](https://user-images.githubusercontent.com/13994516/69139160-3ce72000-0ac0-11ea-9566-a259c9ea6194.gif)

The image above shows a record definition with four record properties.

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