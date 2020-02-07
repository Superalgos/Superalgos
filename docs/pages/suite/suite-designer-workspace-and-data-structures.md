---
title:  "Designer, Workspace and Data Structures"
summary: "Workspace, nodes, structure of nodes and their parent-offspring relationships are the overarching concepts giving structure to all information handled by the system."
sidebar: suite_sidebar
permalink: suite-designer-workspace-and-data-structures.html
---

The Superalgos Suite handles lots of concepts encompassing fields such as markets information, intelligence in the form of data and trading strategies, visualization features, workflows, technical resources, and many more. 

All of these concepts need to be structured for the user to make sense of them, and use them intuitively after learning the Suite's conceptual paradigm.

This page explains the concepts that deal with the structuring and managing of the rest of the concepts.

## Designer

{{site.data.concepts.designer}}

In practical terms, is the portion of the system you access when you pull up the sliding panel, hidding the charts in the process.



## Workspace

{{site.data.concepts.workspace}}

 It contains:
 
 * all hierarchies with all of their nodes;

 * nodes that may be floating around detached from hierarchies;

 * information regarding the physical position and status of all nodes within the Designer, even those detached from the hierarchies.
 
 The <a href="" data-toggle="tooltip" data-original-title="{{site.data.concepts.workspace}}">workspace</a> is not part of any of the hierarchies; instead, it contains them.

{% include note.html content="Backing up your workspace is the best way to store all the information within the Designer, ready to be deployed. Your workspace is saved at the browser level every time you make a change, but still, you should back up your workspace once in a while so that you can go back to past versions or recover from the occasional crash. " %}

## Node

{{site.data.concepts.node}}

## Structure of Nodes

{{site.data.concepts.structure_of_nodes}}

As a concequence, structures of nodes are hierarchical structures, and a logical representation of how the concepts embodied by each node relate to each other.



## Parent-Offspring Relationships

{{site.data.concepts.parent-offspring_relationships}}

The direction of the relationship is determined, in most cases, by the hability of a node to produce the offspring node. That is, the parent node is the one which, by software design, may produce the offspring node.
