---
title:  Charting Space Hierarchy
summary: "The charting space provides the tools to flexibly configure charts with data from different markets, exchanges, and multiple data products."
sidebar: suite_sidebar
permalink: suite-charting-space-hierarchy.html
toc: false
---

{% include note.html content="Hover your mouse over a node for a tooltip definition, and click to get all the details." %}

<table class='hierarchyTable'>
    <thead>
        <tr>
            <th>
                <a href='#charting-space' data-toggle='tooltip' data-original-title='{{site.data.charting_space.charting_space}}'><img src='images/icons/charting-space.png' /><br />Charting Space</a>
            </th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <img src='images/icons/tree-connector-fork.png' />
            </td>
            <td>
                <a href='#viewport' data-toggle='tooltip' data-original-title='{{site.data.charting_space.viewport}}'><img src='images/icons/viewport.png' /><br />Viewport</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>
                <img src='images/icons/tree-connector-elbow.png' />
            </td>
            <td>
                <a href='#time-machine' data-toggle='tooltip' data-original-title='{{site.data.charting_space.time_machine}}'><img src='images/icons/time-machine.png' /><br />Time Machine</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td>
                <img src='images/icons/tree-connector-fork.png' />
            </td>
            <td>
                <a href='#time-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.time_scale}}'><img src='images/icons/time-scale.png' /><br />Time Scale</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td>
                <img src='images/icons/tree-connector-fork.png' />
            </td>
            <td>
                <a href='#rate-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.rate_scale}}'><img src='images/icons/rate-scale.png' /><br />Rate Scale</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td>
                <img src='images/icons/tree-connector-fork.png' />
            </td>
            <td>
                <a href='#time-frame-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.time_frame_scale}}'><img src='images/icons/time-frame-scale.png' /><br />Time Frame Scale</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td>
                <img src='images/icons/tree-connector-elbow.png' />
            </td>
            <td>
                <a href='#timeline-chart' data-toggle='tooltip' data-original-title='{{site.data.charting_space.timeline_chart}}'><img src='images/icons/timeline-chart.png' /><br />Timeline Chart</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td>
                <img src='images/icons/tree-connector-fork.png' />
            </td>
            <td>
                <a href='#rate-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.rate_scale}}'><img src='images/icons/rate-scale.png' /><br />Rate Scale</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td>
                <img src='images/icons/tree-connector-fork.png' />
            </td>
            <td>
                <a href='#time-frame-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.time_frame_scale}}'><img src='images/icons/time-frame-scale.png' /><br />Time Frame Scale</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td>
                <img src='images/icons/tree-connector-elbow.png' />
            </td>
            <td>
                <a href='#layers-manager' data-toggle='tooltip' data-original-title='{{site.data.charting_space.layers_manager}}'><img src='images/icons/layers-manager.png' /><br />Layers Manager</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>
                <img src='images/icons/tree-connector-elbow.png' />
            </td>
            <td>
                <a href='#layer' data-toggle='tooltip' data-original-title='{{site.data.charting_space.layer}}'><img src='images/icons/layer.png' /><br />Layer</a>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </tbody>
</table>










## Charting Space

<img src='images/icons/150-charting-space.png' />

**{{site.data.charting_space.charting_space}}**

There is only one Charting Space hierarchy, thus all charts are configured here. As is common throughout the system, different concepts and elements of the charts such as the scales, data layers and so on, are represented by nodes in the hierarchy. The system allows great flexibility on how to visualize information over the charts by adding, configuring, and arranging these nodes.





## Viewport

<img src='images/icons/150-viewport.png' />

**{{site.data.charting_space.viewport}}**

At this point, the system supports one viewport only. When you navigate through the charts, panning, zooming or moving elements around, what you are doing is panning and zooming on the viewport. That is, you are not moving the charts, but the space that contains them.

Think of the viewport as a huge drawing board. You can have lots of information plotted on different parts of the board, so you move the viewport around and zoom in to focus on specific bits of information.

When you zoom out, you are bringing more information in focus. Because information is handled dynamically, reading data from files, interpreting it, and drawing the corresponding visual elements on the screen in real-time, zooming out or&mdash;in general&mdash;bringing lots of information in focus may slow your system down. The information that is out of focus, that is, out of the visible screen, is not processed. 

The concept of the viewport allows having multiple charts configured all at once, so that you may consult different exchanges, different markets, or different technical studies on demand, simply by moving around and zooming in or out on the viewport. You may put any of those elements side by side, or even superimpose them to study market flows, search for arbitrage opportunities, or simply keep them in sight when you analyze particular market situations.





## Time Machine

<img src='images/icons/150-time-machine.png' />

**{{site.data.charting_space.time_machine}}**

Think of a time machine as an aide that helps you keep any number of pieces of information synchronized on the same time scale. Every data structure that you set up within the same time machine, will always be synchronized in time. Put in other words, the open and closing datetime of each dataset will always be aligned on the vertical axis.

On the other hand, when you arrange charts on different time machines, they are completely independent of one another.

### Adding a Time Machine

To add a time machine, select *Add Time Machine* on the Charting Space node menu.





## Time Scale

<img src='images/icons/150-time-scale.png' />

**{{site.data.charting_space.time_scale}}**

### Adding a Time Scale

To add a time scale, select *Add Time Scale* on the time machine node menu.

### Scale Value

The time scale is represented by a numerical value between 0 and 100. When the scale is set to zero, the horizontal span of the time machine and charts within it is the smallest possible. When the scale is set to 100, it is the largest possible. In other words, the charts are compressed on the horizontal axis with low scale numbers and expanded as the scale increases.

### Setting a Time Scale

You may set a scale value from within the charts by placing the mouse pointer over the corresponding time machine datetime box and scrolling the mouse wheel.

{% include tip.html content="Pressing the mouse wheel while scrolling accelerates the process." %}



You may also set a scale value from within the designer by selecting *Configure Time Scale* on the time scale node menu and editing the corresponding configuration.

```json
{"scale":"0"}
```

{% include note.html content="The values entered via the designer and the charts are synchronized and stored in the node." %}





## Rate Scale

<img src='images/icons/150-rate-scale.png' />

**{{site.data.charting_space.rate_scale}}**

Rate scales may exist both at the level of a time machine and at the level of a timeline chart, each affecting the corresponding concept.

When set at the level of the time machine, the scale setting affects all charts within the time machine. When set at the level of the timeline chart, the setting overrides the rate scale at the time machine level. This allows having multiple charts on the same time machine, each with a different rate scales.

### Adding a Rate Scale

To add a rate scale, select *Add Rate Scale* on the time machine or the timeline chart node menu.

### Rate Scale Value

The rate scale is represented by a numerical value between 0 and 100. When the scale is set to zero, the vertical span of the time machine or the timeline chart is the smallest possible. When the scale is set to 100, it is the largest possible. In other words, the charts are compressed on the vertical axis with low scale numbers and expanded as the scale increases.

### Rate Scale Minimum and Maximum

The rate scale remains the same at all times unless you change it. This means that&mdashunlike in other platforms&mdash;the rate scale does not adjust dynamically depending on the information on the screen. This is a design choice so that rates may be easily comparable along the datetime span of the market.

### Offset Value

The offset is a property of the rate scale by which the scale may be shifted upwards or downwards. As a result, charts aligned in the vertical axis&mdash;synchronized in datetime by a shared time machine&mdash;may be put one above the other. The offset value is a numerical value which may be positive or negative, with no specific minimum or maximum.

### Setting Rate Scale and Offset Values

You may set a scale value from within the charts by placing the mouse pointer over the corresponding time machine or timeline chart rate box and scrolling the mouse wheel. Add the <kbd>Shift</kbd> key to affect the offset.

{% include tip.html content="Pressing the mouse wheel while scrolling accelerates the process." %}



You may also set a scale setting, minimum and maximum values for the scale, and offset value from within the designer by selecting *Configure Rate Scale* on the rate scale node menu and editing the configuration.

```json
{"scale":"50","offset":0,"minValue":0,"maxValue":25000}
```

* The ```minValue``` sets the value for the origin of the y-axis, that is, the rate scale. Usually, this value would be zero, but it doesn't need to be zero, as it is configurable.

* The ```maxValue``` may be set to any positive number.

{% include note.html content="The values entered via the designer and the charts are synchronized and stored in the node." %}





## Time Frame Scale

<img src='images/icons/150-time-frame-scale.png' />

**{{site.data.charting_space.time_frame_scale}}**

When the time frame scale is set at the level of the time machine, the scale setting affects all charts within the time machine. When set at the level of the timeline chart, the setting overrides the time frame scale at the time machine level. This allows comparing charts in different time frames, but still synchronized at the datetime level.

### Adding a Time Frame Scale

To add a time frame scale, select *Add Time Frame Scale* on the time machine or the timeline chart node menu.

### Time Frame Scale Value

The time frame scale value can be any of the time frames supported by the system:

* 1, 2, 3, 4, 5, 10, 15, 20, 30, 40, and 45 minutes

* 1, 2, 3, 4, 6, 8, 12, and 24 hours.

### Setting a Time Frame

You may set a time frame value from within the charts by placing the mouse pointer over the corresponding time machine or timeline chart time frame box and scrolling the mouse wheel.



You may also set a time frame from within the designer by selecting *Configure Rate Scale* on the rate scale node menu and editing the configuration.

```json
{"value":"06-hs"}
```

{% include note.html content="The values entered via the designer and the charts are synchronized and stored in the node." %}





## Timeline Chart

<img src='images/icons/150-timeline-chart.png' />

**{{site.data.charting_space.timeline_chart}}**

In other words, a timeline chart is a set of information to be displayed over a timeline. The information may include candles&mdash;the main and foremost resource&mdash;as well as any other indicator, study or&mdash;in general&mdash;data product that may be available.

You may add as many charts as you wish. Charts within the same time machine are synchronized in the y-axis, that is, at the datetime level. Charts in different time machines are independent of each other concerning the datetime. In either case, you may also add rate scales and time frame scales at the timeline charts level.

The information that each timeline chart makes available on the screen is given by the layers set up in the corresponding layers manager.

### Adding a Timeline Chart

To add a timeline chart, select *Add Timeline Chart* on the preferred time machine node menu.





## Layers Manager

<img src='images/icons/150-layers-manager.png' />

**{{site.data.charting_space.layers_manager}}**

In other words, you use the layers manager node to configure which data products you wish to be made available for visualization purposes on the charts, in particular, on a specific timeline chart to which the layers manager node is attached to.

### Adding a Layers Manager

To add a layers manager, select *Add Layers Manager* on the preferred timeline chart node menu.





## Layer

<img src='images/icons/150-layer.png' />

**{{site.data.charting_space.layer}}**

### Adding Layers

To add a layer, select *Add Layer* on the layer manager node menu. 

### Setting Up Layers

To set up a layer, you need to establish a <a href="suite-references.html" data-toggle="tooltip" data-original-title="{{site.data.concepts.reference}}">reference</a> with the <a href="suite-network-hierarchy.html#data-product" data-toggle="tooltip" data-original-title="{{site.data.network.data_product}}">data product</a> of your choice.

### Configuring Layers

Select *Configure Layer* on the menu to access the configuration.

```json
{"status":"on", "showPanels":true}
```

* ```status``` may be *on* or *off* and refers to the layer being visible or not on the charts.

* ```showPanels``` may be *true* or *false*; *true* shows the plotter panel that may be associated with the data product as per the plotter module definitions; *false* makes panels invisible.
