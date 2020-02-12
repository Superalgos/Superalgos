---
title:  "Design Space, Workspace, and Data Structures"
summary: "The workspace, nodes, structures of nodes and their parent-offspring relationships are the overarching concepts arranging all information handled by the system."
sidebar: suite_sidebar
permalink: suite-design-space-workspace-and-data-structures.html
---

Superalgos handles numerous concepts encompassing fields such as market information, trading strategies, visualization features, workflows, technical resources, and many more. 

All of these concepts are structured so that users may use them intuitively. Learning the Superalgos conceptual framework is the first step in that direction.

## Design Space

**{{site.data.concepts.design_space}}**

In practical terms, the design space is the portion of the system you access when you pull up the sliding panel, hiding the charts in the process.

## Workspace

**{{site.data.concepts.workspace}}**

It contains:
 
 * All <a href="" data-toggle="tooltip" data-original-title="{{site.data.concepts.hierarchy}}">hierarchies</a> with all of their <a href="" data-toggle="tooltip" data-original-title="{{site.data.concepts.node}}">nodes</a>.

 * Nodes that may be floating around detached from hierarchies.

 * Information regarding the physical position and status of all nodes within the design space, even those detached from the hierarchies.
 
The workspace is not part of any of the hierarchies; instead, it contains them.

{% include note.html content="Users may manage multiple workspaces, but only one workspace may be loaded in the system at any point." %}

{% include tip.html content="Backing up your workspace is the best way to store all the information within the design space, ready to be deployed. Your workspace is saved at the browser level every time you make a change, but still, you should back up your workspace once in a while so that you can go back to past versions or recover from the occasional crash. Also, backups allow you to switch seamlessly from one workspace to another workspace." %}

## Nodes

**{{site.data.concepts.node}}**

### Structure of Nodes

{{site.data.concepts.structure_of_nodes}}

As a consequence, structures of nodes are hierarchical structures, and a logical representation of how the concepts embodied by each node relate to each other.

### Parent-Offspring Relationships

{{site.data.concepts.parent-offspring_relationships}}

The direction of the relationship is determined, in most cases, by the ability of a node to produce the offspring node. That is, the parent node is the one which, by software design, may produce the offspring node.

### Attaching and Detaching Nodes

{{site.data.concepts.chain}}

This feature is useful when testing different configurations, rules or parameters, as it allows to keep alternatives handy in the workspace.

[![Design-Space-Attach-Detach](https://user-images.githubusercontent.com/13994516/63227849-6d7e9b80-c1eb-11e9-9a02-6f760f383751.gif)](https://user-images.githubusercontent.com/13994516/63227849-6d7e9b80-c1eb-11e9-9a02-6f760f383751.gif)

To detach a node, right-click on it and drag it away from the parent node. To attach a node, right-click on it and move it closer to the node you wish to attach it to. 

Nodes may be attached only to potential parents. The system limits the way in which nodes may be attached, according to the logic of the information they contain.

{% include note.html content="Nodes may not be detached or attached to frozen nodes. You need to unfreeze them before attaching or detaching." %}

{% include note.html content="The verbs *to chain* and *to attach* may be used interchangeably, as synonyms. Similarly, *to unchain* and *to detach* are both valid." %}