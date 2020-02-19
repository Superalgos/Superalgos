<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Point Formula" %}
{% assign definition = site.data.data_mine.point_formula %}
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

To represent some form of variation of the price or a price derivative over time, a typical point formula consists of the following two coordinates: ```x = datetime``` and ```y = rate```.

For example:

**Point *SMA 20 Begin***
```js
x = record.begin
y = record.previous.sma20
```

The example above shows the definition of the first of two points necessary to draw the segment of the 20-periods SMA curve for any particular period or candle. In this case, ```x = record.begin``` is the starting datetime of the period and ```y = record.previous.sma20``` is the rate of the 20-periods SMA of the previous period.

{% include note.html content="The above variables are constructed with information originating at the product definition that references the corresponding plotter module." %}

To complete the line segment corresponding to a single period, the closing datetime of the period and the closing rate for the 20-periods SMA are required:

**Point *SMA 20 End***
```js
x = record.end
y = record.sma20
```

The above system works very well for plotting all sorts of information over the candles, on the charts.

An oscillator like RSI too needs the definition of the starting and ending datetime of the period as the value for the *x-axis*. However, the value for *axis y* fits a different scale.

Anyway, the points definition is just as straight forward, for example:

**Point *RSI Begin***
```js
x = record.begin
y = record.previous.value
```

**Point *RSI End***
```js
x = record.end
y = record.value
```

Points do not necessarily need to refer to values on the dataset produced by the corresponding data product. For example, absolute values for the *y-axis* may be used to describe fixed graphical elements, for instance, a horizontal line, or a box.

**Point *Begin 20***
```js
x = record.begin
y = 20
```

**Point *End 20***
```js
x = record.end
y = 20
```

**Point *Begin 30***
```js
x = record.begin
y = 30
```

**Point *End 30***
```js
x = record.end
y = 30
```

The above four points are used to paint the background of the 20 to 30 value range of the RSI chart. The first two points are also used to draw the dotted line signaling the 20-value mark, and the last two are used for the dotted line indicating the 30-value mark.

{% include note.html content="The reason from separating the definition of points from the definition of polygons is that any point may be used by one or more polygons." %}

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" and include.heading != "more" %}
<details class="detailsCollapsible"><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a point formula, select *Add Point Formula* on the point node menu.

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