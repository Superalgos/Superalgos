<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Sensor Bot Instance" %}
{% assign definition = site.data.network.sensor_bot_instance %}
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

{{site.data.concepts.sensor_bot}}

The sensor bot instance holds no definitions as to what the bot does. Instead, its process instance references a process definition in the corresponding data mine. That is how the sensor bot instance obtains the information regarding what it needs to do once it is run.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
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

* ```startDate``` is the *desired starting date* of the data product the sensor bot instance builds, in the ```YYYY-MM-DD``` format. The sensor bot instance queries its data source for data starting on the configured ```startDate```.

  * The actual date in which the dataset starts depends on external factors: A. The market may start at a later date. B. The exchange may limit how far in the past data may be retrieved. In both cases, the sensor bot automatically discovers the date closest to the *desired starting date* that is possible to start with, and proceeds accordingly.

  * In the case the ```startDate``` is changed after the sensor bot has started building a data product, either for an earlier or later date, the sensor re-evaluates the feasibility of starting at the new date. The actual date may or may not change; regardless, the sensor bot discards the existing data product and starts over from the newly discovered date. In other words, if the ```startDate``` is changed, the sensor bot starts over.
 
  * Notice that the above starts a chain reaction among all indicator bots that have a data dependency with the sensor bot's output dataset. Also, if the actual date ends up changing, all indicators that determine the starting date of the market by looking at the date discovered by the sensor bot have to discard their existing data products and start over from the new date.


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