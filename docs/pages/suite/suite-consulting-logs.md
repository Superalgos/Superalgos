---
title:  Consulting Logs
summary: ""
sidebar: suite_sidebar
permalink: suite-consulting-logs.html
---

If you are a technical person, you may be interested in consuting the logs of the different bots that run in the platform.

Each bot keeps its own set of execution log files, stored under a similar folder structure as bot's Output and Reports. The difference is that the Log-Files folder is at the root level of the release folder, instead of being inside Data-Storage:

```
\Log-Files\AAMasters\AAMasters
```
Log files contain detailed information about each execution of the bot. As such, a new folder is created for each execution, labeled with the exact DateTime.

Each folder may contain more than one file. Lighter files tend to include data about the initialization stage, while heavier files usually feature the data corresponding to the actual work the bot does.

[![Technical-Logs](https://user-images.githubusercontent.com/13994516/63350228-4f38ad00-c35d-11e9-8074-bdd73ac68bd8.gif)](https://user-images.githubusercontent.com/13994516/63350228-4f38ad00-c35d-11e9-8074-bdd73ac68bd8.gif)