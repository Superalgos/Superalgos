<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Sensor Bot Instance" %}
{% assign definition = site.data.network.sensor_bot_instance %}
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

{{site.data.concepts.sensor_bot}}

The sensor bot instance holds no definitions as to what the bot does. Instead, its process instance references a process definition in the corresponding data mine. That is how the sensor bot instance obtains the information regarding what it needs to do once it is run.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a sensor bot instance, select *Add Sensor Bot Instance* on the task node menu. When a sensor bot instance is added, it is created with one sensor process instance, and a market reference.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Sensor Bot Instance* on the menu to access the configuration.

```json
  {
    "startDate": "2020-01-01"
  }
```

* ```startDate``` is the starting date of the data product the sensor bot instance builds. In other words, the sensor bot instance queries its data source for data starting on the configured ```startDate```. In cases when the sensor bot has built a data product starting on a certain date and the ```startDate``` is eventually changed for an earlier one, that is, a date further in the past, then the sensor bot discards the existing data product and starts over from the newly configured date.

<!--------------------------------------------- CONFIGURING ends -->

{% endif %}

{% if include.starting != "" %}

{{include.starting}} Starting {{preposition}} {{title}}

<!--------------------------------------------- STARTING starts -->

You do not start or stop a sensor bot instance directly. Instead, you start or stop the corresponding task.

<!--------------------------------------------- STARTING ends -->

{% endif %}

{% if include.more == "yes" %}
</details>
{% endif %}