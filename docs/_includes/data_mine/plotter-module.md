<!--------------------------------------------- TITLE AND DEFINITION starts -->

{% assign title = "Plotter Module" %}
{% assign definition = site.data.data_mine.plotter_module %}
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

A single plotter may have several modules. Different modules may be used to plot each product of the bot, or as best suits the expected use-pattern.

[![Plotter-Module-01](https://user-images.githubusercontent.com/13994516/71016077-eab41180-20f4-11ea-87e7-7262ff10a1ab.gif)](https://user-images.githubusercontent.com/13994516/71016077-eab41180-20f4-11ea-87e7-7262ff10a1ab.gif)

{% include important.html content="For a bot to use a plotter, the corresponding product definition must establish a reference with the plotter module built to interpret the dataset." %}

[![Plotter-Module-02-Product-Link](https://user-images.githubusercontent.com/13994516/71016079-eab41180-20f4-11ea-8afb-96321f9c68d8.gif)](https://user-images.githubusercontent.com/13994516/71016079-eab41180-20f4-11ea-8afb-96321f9c68d8.gif)

<!--------------------------------------------- CONTENT ends -->

{% endif %}

{% if include.more == "yes" and include.content != "more" %}
<details><summary class="nobr">Click to learn more about {{ title | downcase }}{{plural}}
</summary>
{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}} Node

<!--------------------------------------------- ADDING starts -->

To add a plotter module, select *Add Plotter Module* on the plotter node menu.

<!--------------------------------------------- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!--------------------------------------------- CONFIGURING starts -->

Select *Configure Plotter Module* on the menu to access the configuration.

```json
{
    "codeName": "Module Name",
    "isLegacy": true,
        "icon": "histogram"
}
```

* ```codeName``` is the name used in the code to refer to the module.

* ```isLegacy``` is ```true``` for plotters modules developed entirely in JavaScript, and is ```false``` or doesn't show in the configuration for plotters built with the tools featured in the data mine hierarchy.

* ```icon``` is the name of the image that illustrates the corresponding layer in the Layers Panel. In case the banner is not specified, the *default banner* is used. Current possible values are:


| Value | Image|
| :---: | :---: |
| ```Default``` | ![Default-Banner](https://user-images.githubusercontent.com/13994516/70896073-5bbdd100-1ff0-11ea-84e3-5bd90475976f.png) |
| ```Histogram``` | ![Histogram-Banner](https://user-images.githubusercontent.com/13994516/70896074-5bbdd100-1ff0-11ea-8dad-ccc6cfe64beb.png) |
| ```Band``` | ![Bands-Banner](https://user-images.githubusercontent.com/13994516/70896072-5bbdd100-1ff0-11ea-8626-61c36bd22a3c.png) |
| ```Moving Average``` | ![Moving-Average-Banner](https://user-images.githubusercontent.com/13994516/70896075-5bbdd100-1ff0-11ea-9909-dae33e57f65f.png) |
| ```Oscillator``` | ![Oscillator-Banner](https://user-images.githubusercontent.com/13994516/70896076-5c566780-1ff0-11ea-8a5b-20077257c560.png) |
| ```Trend``` | ![trends-banner](https://user-images.githubusercontent.com/13994516/70989177-744aeb80-20c3-11ea-88f5-d10473fa79b9.png) |

Custom images may be added too. To do that:

1. name the image in the following format: ```The-Image-Name-Icon.png```;

1. place images in the ```WebServer\Images\``` folder;

1. in the configuration of the module, use the name without the *-Icon* ending (e.g.: ```"icon": "The-Image-Name"```)

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