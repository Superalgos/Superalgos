<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Process Definition" %}
{% assign definition = site.data.data_mine.process_definition %}
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

As hinted above, most bots, in particular indicators, have two different processes. The reason is that different data structures need to be handled in different manners. The Multi-Period-Daily process handles daily files, while the Multi-Period-Market process handles market files.

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class='detailsCollapsible'><summary class='nobr'>Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a process definition, select *Add Process Definition* on the bot's menu. A process definition node is created along with the basic structure of nodes comprising the definition.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Process* on the menu to access the configuration.

**Multi-Period-Market:**

```json
{
  "codeName": "Multi-Period-Market",
  "description": "Brief description of what the bot does.",
  "startMode": {
    "allMonths": {
    "run": "false",
    "minYear": "",
    "maxYear": ""
  },
  "oneMonth": {
    "run": "false",
    "year": "",
    "month": ""
  },
  "noTime": {
      "run": "true"
    },
    "fixedInterval": {
      "run": "false",
      "interval": 0
    }
  },
  "deadWaitTime": 0,
  "normalWaitTime": 0,
  "retryWaitTime": 10000,
  "sleepWaitTime": 3600000,
  "comaWaitTime": 86400000,
  "framework": {
    "name": "Multi-Period-Market",
    "startDate": {
    },
    "endDate": {
    }
  }
}
```

**Multi-Period-Daily:**

```json
{
  "codeName": "Multi-Period-Daily",
  "description": "Brief description of what the bot does.",
  "startMode": {
    "allMonths": {
      "run": "false",
      "minYear": "",
      "maxYear": ""
    },
    "oneMonth": {
      "run": "false",
      "year": "",
      "month": ""
    },
    "noTime": {
      "run": "true"
    },
    "fixedInterval": {
      "run": "false",
      "interval": 0
    }
  },
  "deadWaitTime": 0,
  "normalWaitTime": 0,
  "retryWaitTime": 10000,
  "sleepWaitTime": 3600000,
  "comaWaitTime": 86400000,
  "framework": {
    "name": "Multi-Period-Daily",
    "startDate": {
      "takeItFromStatusDependency": 0
    },
    "endDate": {
      "takeItFromStatusDependency": 1
    }
  }
}
```

Both configurations deal with certain aspects of the internal workings of these kinds of processes. These are the ones to be adjusted when creating a new bot:

* ```codeName``` is the name of the process as used within the code of the system; for consistency, always use ```Multi-Period-Market``` and ```Multi-Period-Daily``` accordingly.

* ```description``` is a short description of what the bot does.

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