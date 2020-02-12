<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Dataset Definition" %}
{% assign definition = site.data.data_mine.dataset_definition %}
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
<details><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

A good part of what makes datasets easy to consume by other bots is the fact that they are standardized in terms of their structure. It is that structure that is specified in the dataset definitions.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a dataset definition, select *Add Dataset Definition* on the bot's node menu.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Definition* on the menu to access the configuration.

**Multi-Period-Market:**

```json
{
  "codeName": "Multi-Period-Market",
  "type": "Market Files",
  "validPeriods": [ "24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs" ],
  "filePath": "Data-Mine-Name/Bot-Name/@Exchange/Output/Product-Name/Multi-Period-Market/@Period",
  "fileName": "@BaseAsset_@QuotedAsset.json"
}
```

**Multi-Period-Daily:**

```json
{
  "codeName": "Multi-Period-Daily",
  "type": "Daily Files",
  "validPeriods": [ "45-min", "40-min", "30-min", "20-min", "15-min", "10-min", "05-min", "04-min", "03-min", "02-min", "01-min" ],
  "filePath": "Data-Mine-Name/Bot-Name/@Exchange/Output/Product-Name/Multi-Period-Daily/@Period/@Year/@Month/@Day",
  "fileName": "@BaseAsset_@QuotedAsset.json",
  "dataRange": {
  "filePath": "Data-Mine-Name/Bot-Name/@Exchange/Output/Product-Name/Multi-Period-Daily",
  "fileName": "Data.Range.@BaseAsset_@QuotedAsset.json"
  }
}
```


* ```codeName``` is the name of the dataset as used within the code.

* ```type``` refers to the type of dataset; possible values are ```Market Files``` and ```Daily Files```.

* ```validPeriods``` refers to the time frames handled by the dataset.

* ```filePath``` sets the path on which files are stored; the proper name of the data mine, the bot and the product need to be entered.

* ```fileName``` sets the name of the files that constitute the dataset.

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