<!-- TITLE AND DEFINITION starts -->

{% assign title = "Close Stage" %}
{% assign definition = site.data.trading_system.close_stage %}
{% assign preposition = "the" %}

<!-- TITLE AND DEFINITION ends -->

{% if include.heading != "" %}
{{include.heading}} {{title}}
{% endif %}

{% if include.icon != "no" %}
<img src='images/icons/{{include.icon}}{{ title | downcase | replace: " ", "-" }}.png' />
{% endif %}

**{{ definition }}**

<!-- CONTENT starts -->

As explained earlier while discussing the open stage, the execution functionality is currently under development. Needless to say, execution of the closing orders is of the highest significance, but in the meantime some temporal <a href='suite-execution-limitations.html'>execution limitations</a> apply.

Also pending development is the keeping of a formal trading log. The current functionality allows you to see each trade on the screen, along with all the corresponding details, as well as a consolidated report on the live trading panel. This information is stored as a data product, thus, it is not lost. In the future, the system should incorporate a user-friendly feature to browse such logs, and even help analyze them in search for potential optimizations of your trading systems.

<!-- CONTENT ends -->

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add a close stage node, select *Add Missing Stages* on the strategy node menu. All stages that may be missing are created along with the rest of the basic structure of nodes required to define each of them and their events.

{% include note.html content="Only one close stage may exist in each strategy." %}

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- CONFIGURING ends -->

{% endif %}