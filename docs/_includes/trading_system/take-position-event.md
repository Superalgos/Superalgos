<!-- TITLE AND DEFINITION starts -->

{% assign title = "Take Position Event" %}
{% assign definition = site.data.trading_system.take_position_event %}
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

The trigger-on event merely selects a strategy to be considered for trading under the current market situation. The actual decision to enter a position may require more specific conditions to be met. For that reason, the take position event is a separate entity from the trigger-on event.

Therefore, the take position event is defined with its own set of situations and conditions.

Once the take position event is triggered, the decision to take a position has been made and there is nothing else to consider in that regard. Therefore, the system shifts from the trigger stage to the open stage. 

<!-- CONTENT ends -->

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add a take position event node, select *Add Missing Events* on the trigger stage node menu. All events that may be missing are created along with the rest of the basic structure of nodes required to define each of them.

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

<!-- CONFIGURING ends -->

{% endif %}