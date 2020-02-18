---
title:  Upgrading Your Existing Installation
summary: ""
sidebar: suite_sidebar
permalink: suite-upgrading-your-existing-instalation.html
---

You should expect new releases to become available regularly. Appropriate notices will be placed on the [Official Superalgos Telegram Announcements Channel](https://t.me/superalgos), which will be forwarded to the several Community groups by an *admin*.

This is what you should do if you wish to upgrade to a new version:

## 1. Read the Announcement Carefully

Read and understand the announcement explaining the changes and how they may impact your workflow. Find out if the new version requires upgrading your workspace. 

Decide which parts of your workspace you wish to backup in order to be able to restore them on the upgraded workspace if there is one (*e.g.: you may want to backup your strategies, trading system or definition, indicators you may have created, and so on*). If there is no need to upgrade the workspace, that means that the new version of the system should work well with your existing workspace (provided that you are only one version behind).

## 2. Back Up Your Workspace

Always back up your existing workspace before switching versions. You may always go back to a working version in case something goes wrong with the new one, by installing the previous version of the system and restoring your old workspace from a backup file.

## 3. Put the House in Order

Stop the system by closing your browser. Allow a minute or two until all activity stops before closing the Console/Command Line running the programs.

Make sure you are not storing any personal files, such as your workspace backups and so on in your ```Superalgos``` folders. Move them to a different location if you are.

You will keep the ```Data-Storage``` folder intact and delete all the remaining folders within the ```Superalgos``` folder. You do not need to get rid of the historic market data every time you upgrade your system. **Do not delete your ```Data-Storage``` folder**.

## 4. Download and Install the New Version

Download the latest patch or latest release from the location advertised on the Official Announcement Channel.

> **WARNING**: Always beware of what random people may post in open Telegram groups or forums. Patches and releases will always be made available at the [Releases page](https://github.com/Superalgos/Platform/releases) of this repository only.

Extract/unpack the contents of the ZIP file directly into the ```Superalgos Desktop App``` folder. 

That's it! You are up and running with the new version. Start the system the same way you always do unless new instructions become available in this User Manual.

## 5. Hard Refresh

Once the system loads in your browser window and before you start working or import a new workspace, hit <kbd>Ctrl or &#8984;</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> (in Chrome) to perform a *hard reload*. This ensures all scripts are properly updated in your browser's cache.

## 6. Final Tunning and Testing

Occasionally, the new version of the system may introduce changes that may require you to update your existing strategies or some other parts of your workspace. If that is the case, the announcement of the new release should explain how to proceed.

This is the time to restore any of the work you may have backed up earlier, on the first step.

Before going deep back to work, it is always recommeended to test the new version a bit and make sure that your existing work performs as you would expect.

If you run into any issues, feel free to drop us a line in our <a href="https://t.me/superalgoscommunity" rel="nofollow" rel="noopener" target="_blank">Community</a>.