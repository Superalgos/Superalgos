<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Procedure Loop" %}
{% assign definition = site.data.data_mine.procedure_loop %}
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
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.content != "no" %}

<!--------------------------------------------- CONTENT starts -->

This is an example of a procedure loop code snippet, in particular, the code that calculates the Popular SMAs product of the Simple Moving Average (SMA) indicator.

{% include important.html content="Calculation procedures may only access data up to 48 hours in the past counting from the datetime of the record being processed. For that reason, the calculation of a moving average requires temporarily storing data in an array." %}

```js
/* Loop Code. */

let candle = record.current // Our main dependencies are candles 
variable.last200.push(candle.close) // Add the current close value to the last 200 array.

if (variable.last200.length > 200) {
    variable.last200.splice(0, 1) // Remove the first element of the array to keep it at a maximun of 200 elements.
}

variable.sma20 = calculateSMA(20)
variable.sma50 = calculateSMA(50)
variable.sma100 = calculateSMA(100)
variable.sma200 = calculateSMA(200)

function calculateSMA(periods) {  // Having a function saves us from duplicating code.
    /* We check we have enough values to make the calculation */
    if (variable.last200.length < periods) { return 0 } // If we dont, we define the value is zero.

    let sum = 0 // Initialize sum variable. 
    for (let i = variable.last200.length - periods; i < variable.last200.length; i++) { // Iterate through the last periods
        sum = sum + variable.last200[i]
    }
    let sma = sum / periods
    return sma
}
```

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a procedure loop, select *Add Procedure loop* on the corresponding procedure node menu. A procedure loop node is created along with the corresponding JavaScript node.

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