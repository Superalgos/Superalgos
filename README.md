# AAWeb

The main function of AAWeb is to serve the js files needed at the browser to run the Canvas App. 

## Current Status

AAWeb is under heavy development, evolving from a prototype to a working MVP. It currently does many more things than expected and we are in the process of tearing it apart and replace some of its functionality with Master App modules.

## Installation

Clone this repo and get from the Core Team the .ENV file and config file for this to run. Then:

```
npm install
```

You will need to clone these repos which contains the actual scripts of the Canvas App and one of its components.

1. https://github.com/Superalgos/CanvasApp
2. https://github.com/Superalgos/Files-Component

At the configuration file, you must verify that this is pointing to the place where you clonned the 2 previous repositories:

```
  "pathToFilesComponent": "../Files-Component/src",
  "pathToCloudAppWrapperComponent": "../CloudApp-Wrapper-Component/src",
```

## Execution

There is a Visual Studio solution already setup for quick debugging. Otherwise, you could do:

```
node.exe server.js
```

## Usage

Running AAWeb will create a Noode.js server at port 1337. Navigate with your browser there and the Canvas App should show up.

