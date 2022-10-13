# Dashboards App Overview
The Superalgos Dashboards App seeks to offer a flexible solution to the growing data visualization needs of the Superalgos ecosystem.

The basic philosophy of the app approaches this from two directions:

The first is to offer a flexible, modular and drop in solution for creating dashboard interfaces. This is achieved by using the Vue.js framework to create a library of single file components. These components leverage the reactivity and modularity built into vue to create components that can be reused in any number of dashboards that update the data they display automatically.

As this library of components grows, the ability to create new dashboards with minimal work will expand along with it. Not only this, but each new dashboard is itself a self contained vue component. This means that each dashboard can be flexibility adjusted to fulfill the needs of that particular dashboard.

The second direction the Dashboards app approaches data visualization is by providing extendable data collection. The backend of the app is built upon a websocket server that can be connected to by any number of clients. This means that as clients are written for the app, data will be able to be sourced from the Platform App, Network Nodes, or any other source a client may be written for.

The current version of the Dashboards app can accept any valid JSON object via websocket. Meaning that there is complete freedom to collect, send, and display almost any desired data in the app!

All of the data that is sent to the Dashboards app is then made available to the dashboards UI in a unified object. Meaning that there are no restrictions on what data can be displayed on a particular dashboard. For example, a user could build a dashboard that displays data coming from the Platform and a Network Node on the same dashboard. This opens the door to creating dashboards limited only by the imagination of the Superalgos community!

# Usage
There are no additional steps to install the Dashboards app other than running an updated instance of Superalgos from the develop branch.

The most basic usage of the app is to run:
```sh
node platform dashboards
```

You can also run the dashboards app on its own by using:
```sh
node dashboards
```

For developers there are additional flags to run the frontend and backend of the app separately by using:
```sh
node dashboards devFrontend
```
```sh
node dashboards devBackend
```

## Alpha 1 Caveats
Being the first Alpha version, the Dashboards app is still in its infancy. What follows is a short list of standing caveats to using the Dashboards app in its current state.

- Due to the underlying architecture of the Dashboards app running its own websocket server, the Dashboard app listens for new clients to be started and automatically connects. However when the platform is started first, there is currently no way to inform the platform that the Dashboards app has been started later. This is a restriction that will be solved in Alpha 2.

- An additional caveat is that the data collection features of the Dashboards app’s Platform client are still in there basic proof of concept phase. Developing these features will be the main push of Alpha 2.

- Finally, the current list of ready made single file vue components is small (a list of three). This list will grow as development continues, but is worth noting that the first wave of dashboards will be the pioneers creating the components library from the ground up.

# Backend Overview
The backend of the Dashboards app is a relatively simple websocket server. The purpose of running this server is to offer a central avenue through which data can be received by the Dashboards app. This enables the community to have complete freedom in creating clients for the Dashboards app. The only requirement for a new Dashboards app client is to send websocket messages to the app using the standard syntax that will be covered shortly.

## Types of Data Accepted
Websockets can send both text and binary data. The current version of the Dashboards app accepts text data in the form of any valid JSON object. Meaning that any data that can be packed into a json object can be sent to the dashboards app!

Note: Eventually support for binary data can be added if the need arises.

## Sending Data too the Dashboards App
By default the Dashboards app’s websocket server listens for messages on localhost port `18043`. Messages sent over this port will be received and displayed by the app.

This is the most low level messaging used by the app and is provided here to help contributors looking to build there own Dashboards app client.

As clients are written for the Dashboards app, the need to send raw websocket messages to the app will decrease (and be totally unnecessary for the average user). However, anyone can send data to the app from any source. This means that a user can write scripts, or clients, to pull data from any useful sources and send them to the app. Here is an example of the basic syntax for sending a data message to the Dashboards app:

```js
let messageToSend = (new Date()).toISOString() + '|*|Platform|*|Data|*|Globals|*|' + jsonDataObj1 + '|*|' + jsonDataObj2
socketClient.send(messageToSend)
```

Let’s break this code down. 

The Dashboards app expects websocket messages that are strings. Each portion of the message string is separated using the special character combination `|*|`. 

The string must adhere to the following structure in order to be interpreted correctly by the app:

### All Messages regardless of type start with the first three arguments:
| Argument | Description |
| --- | --- |
| `timestamp` | An ISO date string. The current time can be gotten with JavaScript using: `new Date()).toISOString()` |
| `message origin` | Name of the message origin. For example, Platform or Network. |
| `message type` | Type of message being sent. The current options are: `Data`, `Info`, and `Error`. |

### Data messages are meant for sending data content to the Dashboards app and take a minimum of two additional arguments:
| Argument | Description |
| --- | --- |
| `Data Set Name` | The name of the data set. For example, Globals, Tasks, Signals, etc. |
| `Data Object` | The JSON object to be sent. JavaScript objects and arrays can be converted to JSON using the `JSON.stringify()` function. |
| `Additional Objects` | Any number of additional JSON objects can can be appended to the message as long as they are each separated by `|*|`. |

### Info and Error messages: are meant to send relevant information and error messages to the app. These typesoif messages take one additional argument beyond the first three:
| Argument | Description |
| --- | --- |
| `message content` | A string of text containing the content of the message |

## Raw Data Dashboard Tool
In order to help facilitate the creation of clients the Dashboards app offered a special dashboard called the Developers Dashboard. The main purpose of this dashboard is to offer some basic tools to help test the delivery of data to the app.

The main tool within this dashboard is the Raw Data tab. Opening this tab will automatically display all incoming data in the form of a collapsible tree. Developers can expand and contract this tree to get an idea of if the data they are sending to the app is being delivered correctly without having to dive into the inner workings of the Dashboards app itself.

## Platform Client
The Alpha 1 version possesses a very rudimentary Platform app client. This section of the readme will expand as the features of the client take shape.

# Frontend Overview

## How to Add a New Dashboard
At this point in development, adding a new dashboard requires some techincal coding. The evetual goal is to offer a low to no code meathod for building new dashboards. What follows are the current needed steps to add a new dashboard:

1. **Create a New Vue Component**

The first step to adding a new dashboard is to create a vue component that will contain all the logic for your new dashboard. To do this open `Superalgos\Dashboards\UI\vueComponentsSource\views\`.  You will see all the current dashboard components within this folder. Make a new file within this folder that looks like this: 
```sh
MyNewDashboardView.vue
```

2. **Copy Basic Dashboard Template**

Next copy this basic template into your new vue component. This code will serve as the blank canvas for your new dashboard!
```js
<template>
  <div class="dashboard-window">
    <img class="image" :src="dashboardIcon">
    <h2><strong>This is my new Dashboard!</strong></h2>
    <br/>
    <span>The purpose of this app is to help make visualizing and accessing data from Superalgos a breeze.</span>
  </div>
</template>

<script>
  import dashboardIcon from "../assets/dashboard.png"
  export default {
    // Receive incoming data from parent app 
    props: ["incomingData"],
    components: {
    },
    data () {
      return {
        dataKey: '',
        dataObject: [],
        dashboardIcon: dashboardIcon,
      }
    },
    computed: {
    },
    methods: {
    },  
  };
</script>

<style scoped>
  .dashboard-window {
    font-size: bold;
  }
  
  .image {
    margin-top: 10px;
    height: 100px;
  }
</style>

```

3. **Add New Dashboard to Index**

The final step is to add your new dashboard to the index.  Open the index file found at `Superalgos\Dashboards\UI\vueComponentsSource\router\index.js`. First add an import statment to pull your new dashboard into the index file like this"
```js
import MyNewDashboardView from '../views/MyNewDashboardView.vue'
```

Next you will see an array that looks like this:
```js
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/Developers',
    name: 'Developers',
    component: DevelopersView
  }
  
]
```

Add an new object to this array that declares your new dashboard like this:
```js
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/Developers',
    name: 'Developers',
    component: DevelopersView
  },
    {
    path: '/myNewDashboard',
    name: 'myNewDashboard',
    component: MyNewDashboardView
  }
]
```

Finally at the top add an import statment to finish declaring your en
Steps needed
Add in index
Add vue component

Overview of processing data in dashboard
How to set listener

How to Add a New Component
Steps needed
How to import it in a dashboard
Mention hot reloading

List of Current Components and Usage
Drawer
Tabs
Expandable Tree

# Roadmap to Alpha 2
The push for alpha 2 will be making data available to the Dashboards app. This work will primarily take place within the Platform app’s Dashboards client. Filtering and managing reported data will come in subsequent versions. What follows is a board roadmap toward the Alpha 2 version:

⁃ Create a dashboards project within SA to refactor functions into function libraries.

⁃ Handle platform starting first.

⁃ Platform client Data collection features:
⁃ Tap in and listen to all Platform system events. Especially task output events.
⁃ Reporter function that can be dropped into the midst of any Platform code and forward context data.

⁃ Make the global UI object available to the Dashboard’s UI. This will allow calling all the same functions used to build and manage the Platform’s UI. A major possibility opened up by this is the reuse of major UI features from the platform, such as data plotting. It also allows for new features built for the Dashboards app to eventually be ported over to the Platform’s UI as well.



