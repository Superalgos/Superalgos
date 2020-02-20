---
title:  Backups
summary: "The backup feature is designed to preserve the integrity of references as you would expect when you wish to restore a data structure to a previous state of affairs."
sidebar: suite_sidebar
permalink: suite-backups.html
---

## Introduction

When you back up a single node, a structure of nodes, a complete hierarchy or even the workspace, all existing <a data-toggle="tooltip" data-original-title="{{site.data.concepts.reference}}">references</a> are stored in the resulting JSON file.

When you restore a workspace backup, the current workspace is discarded entirely and replaced with the backup. Now, let's see what happens when you restore anything other than a workspace, that is, any of the data structures contained in the workspace. 

In particular, what we want to analyze is what happens with each type of reference that may be present in the structure.

What happens with each type of reference when the back up is restored varies depending on one factor: the original structure is present in the workspace, or instead, it has been deleted prior to restoring the backup.

## Outgoing References

**Outgoing references are kept no matter if the original structure of nodes still exists or not.**

For example, in a task set up for running a testing session, the trading bot process instance references the trading bot Multi-Period process, and the session references a trading sytem.

[![Backups-01-Task](https://user-images.githubusercontent.com/13994516/71101855-b2293c00-21b7-11ea-864e-817f74e17a34.gif)](https://user-images.githubusercontent.com/13994516/71101855-b2293c00-21b7-11ea-864e-817f74e17a34.gif)

As the capture above shows, when restoring the backup of a task, both outgoing references are maintained, even when the original task has not been deleted.

This means that restoring a back up is a viable way to duplicate structures of nodes with outgoing references when you expect outgoing references to be preserved.

## Incoming References

**Incoming references are restored only when the original structure of nodes is deleted before restoring the backup.**

Let's take a trading system as an example. Trading systems usually have several incoming references originating at different testing and live trading sessions.

[![Backups-02-Incoming-references](https://user-images.githubusercontent.com/13994516/71103003-ac345a80-21b9-11ea-947c-6e2c59c299c5.gif)](https://user-images.githubusercontent.com/13994516/71103003-ac345a80-21b9-11ea-947c-6e2c59c299c5.gif)

The capture above shows that restoring a backup of a trading system when the orginal definition is still in the workspace causes the incoming references to be lost.

However, as the capture below shows, if the original structure of nodes is deleted before the backup is restored, then the incoming references are restored as well.

[![Backups-03-Incoming-references](https://user-images.githubusercontent.com/13994516/71103005-ac345a80-21b9-11ea-8c0f-5ee78f15aa7a.gif)](https://user-images.githubusercontent.com/13994516/71103005-ac345a80-21b9-11ea-8c0f-5ee78f15aa7a.gif)

## Internal References

**Internal references are kept *internally* only when the original structure of nodes is deleted before restoring the backup. If the original structure of nodes is present, then the references will point to the original nodes on the original structure of nodes.**

Let's see what happens when we restore a backup of a <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.shapes}}">shapes</a> node without deleting the original node first:

[![Backups-05-Internal-references-restore](https://user-images.githubusercontent.com/13994516/71107152-de958600-21c0-11ea-8667-d7d56ed24bfb.gif)](https://user-images.githubusercontent.com/13994516/71107152-de958600-21c0-11ea-8667-d7d56ed24bfb.gif)

As expected, the references from <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.polygon_vertex}}">vertices</a> in the restored backup do not point to the <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.point}}">points</a> in the same structure, but instead point to the original points in the original strucutre.

On the other hand, if the original structure of nodes is deleted before restoring the backup, then the references point to the nodes within the same structure:

[![Backups-06-Internal-references-delete-restore](https://user-images.githubusercontent.com/13994516/71107153-de958600-21c0-11ea-9855-532e2d0631d2.gif)](https://user-images.githubusercontent.com/13994516/71107153-de958600-21c0-11ea-9855-532e2d0631d2.gif)

## Conclusion

The backup feature is designed to preserve the integrity of references as you would expect when you wish to restore a data structure to a previous state of affairs.

However, the tool's particular behavior when restoring a backup without deleting the original structure may be of use in certain ocassions. This is particularly true because in such cases, the backup feature behaves differently than the clone feature.