# Superalgos Web Server

The main function of this Web Server is to serve the js files needed at the browser to run the Canvas App.

## Current Status

Web Server is under development, evolving from a prototype to a working MVP to an alpha stage module. 

## Installation

This repo is included at the Superalgos Desktop App and you can play with it once you install the full Desktop App via downloading the latest release, which currently runs on code.

In case you want to individually play specifically with this module, clone it and then:

```
npm install
```

You will need to clone these repos which contains the actual scripts of the Canvas App and one of its components.

1. https://github.com/Superalgos/CanvasApp
2. https://github.com/Superalgos/Files-Component

At the configuration file, you must verify that this is pointing to the place where you clonned the 2 previous repositories:

```
  "pathToFilesComponent": "../Files-Component/src"
```

It is highly recommended that you download and unzip the Desktop App release which includes everything you need to set up your local environment in a few clicks.

## Execution

There is a Visual Studio solution already setup for quick debugging. Otherwise, you could do:

```
node.exe server.js
```

## Usage

Running the Web Server will create a Noode.js server at port 1337. Navigate with your browser there and the Canvas App should show up.

For more information, continue reading here: https://github.com/Superalgos/DesktopApp/blob/master/README.md

