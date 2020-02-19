---
title:  Run the Suite
sidebar: suite_sidebar
permalink: suite-run-the-suite.html
---

## On Windows Systems

Use the executable file to run the system:

Go to the ```Superalgos``` folder and double click on ```Superalgos.exe```. Now, skip the *other systems* instructions and go directly to the title [What to Expect After Running the Platform](#what-to-expect-after-running-the-platform).

> **NOTE FOR DEVELOPERS:** Instead of using the executable file to run the system, you may want to use ```node run``` from within the root ```Superalgos``` folder, to run on your full Node Js installation.

## On All Systems (Mac OS, Linux, etc., and Windows too)

Download and install Node JS:

Node.js is an open-source server environment required for the system to run. Go to the [Node Js downloads page](https://nodejs.org/en/download/) and download your system's installer (the *LTS Recommended for Most Users* version is enough). Run the installer and go through the process until Node Js is installed.

If you are on Mac, use the Finder system to go to the ```Superalgos``` folder and do a *secondary click* (tap the touchpad with two fingers) to open up the menu. Select *New Terminal Tab at Folder*. Once in the Terminal, type ```node run``` and hit *Enter*.

If you are on Linux, open a Terminal / Console, go to the ```Superalgos``` folder, type ```node run``` and hit *Enter*.

## What to Expect After Running the Platform 

This is what you should see in your console after running the ```node run``` command or double-clicking your executable:

![Console-start-up](https://user-images.githubusercontent.com/13994516/67315449-e6111980-f506-11e9-8988-96e61dc7f497.PNG)

Also, your browser should load the system and show the following screen:

[![Getting-Started-Guide-01-Platform-Launch](https://user-images.githubusercontent.com/13994516/67231207-2907ba00-f43f-11e9-83e8-e36cc844b0eb.gif)](https://user-images.githubusercontent.com/13994516/67231207-2907ba00-f43f-11e9-83e8-e36cc844b0eb.gif)

The system will load on your default browser. You should either [set Chrome as your default browser](https://support.google.com/chrome/answer/95417?co=GENIE.Platform%3DDesktop&hl=en) before executing the file or simply close the non-Chrome browser, open Chrome and go to http://localhost:9999/.

> **NOTE:** We highly recommend you use Chrome to run the system so that you have a similar environment as developers in case you need help. We are not testing on any other browsers and it is a well-known fact that browsers do behave differently. 

If you ran the *.exe* file on Windows, a Console/Command Line/Terminal window will open. If you ran the system from within the console, the programs will run on the same console window. 

The Console must be open for as long as the system is running. Do not close the window or stop the processes running on it. You may minimize the Console if your Operating System allows you to do so.

> **NOTE:** Closing the Console/Command Line may cause your market data to become corrupt. The proper way of closing the application is closing your browser first, and allow a minute for processes to stop before closing the Console.

That's it! You are up and running!

Now you are ready to learn the basic operation of the system so that you may run your first backtests or trade live with existing strategies.