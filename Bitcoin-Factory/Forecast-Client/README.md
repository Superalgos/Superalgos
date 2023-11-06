# Forecast Client

The Forecast Client app feeds itself from the Test Server's forecast cases. A forecast case is the best known set of parameters for a certain Asset / Timeframe. The job of this App is to recreate the model discovered by a Tester using the Test Client App.  Once this model is recreated, it is used to start forecasting the next candle for that Asset / Timeframe. The forecasts produced by this App are then sent to the Test Server and distributed to the Test Client Apps every time they solve a new test case.

Each tested model (created based on a set of parameters and a custom dataset) has a certain implied Error: the root-mean-square error (RMSE).

https://en.wikipedia.org/wiki/Root-mean-square_deviation

The whole point of crowd-testing is to find the model with the lowest % of error for a certain Asset / Time-Frame.

**Note:** All forecasts are done at the Asset/USDT markets on Binance for now.

When you are running a Test Client App, you are testing certain combinations of parameters for a certain Asset / Time-Frame including a custom dataset for your specific test, which might include a certain combination of indicators data.

The crowd-sourced forecasts you receive after each test, are the ones belonging to ML models with the lowest % error for a certain Asset / Time-Frame.

## How to setup Forecast Client?
This section describes how to install the Farecast Client. It is assumed that docker and Superalgos are already installed and running on the server where Forecast Client will be run.

### Running Docker Container

1. Navigate to the `cd Superalgos/Bitcoin-Factory/DockerBuild` folder.
2. `docker build -t bitcoin-factory-machine-learning .` command to build the docker image.
**Note:** If you have previously run the Bitcoin Factory Test Client on the server where you will run the Forecast Client, you have probably built the doker image. If you have done this process before, you do not need to do it again.
3. `docker run -it --rm --shm-size=4.37gb --name Bitcoin-Factory-ML-Forecasting -v /Superalgos/Bitcoin-Factory/Forecast-Client/notebooks:/tf/notebooks -p 8888:8888 bitcoin-factory-machine-learning` Let's run the docker container using the command. `/Superalgos/Bitcoin-Factory/Forecast-Client/notebooks` Remember to set the specified folder to the Superalgos folder on your own server.
   Once the docker container is running correctly you will see at the first terminal an output similar to this:

```text
[I 12:58:36.546 NotebookApp] Writing notebook server cookie secret to /home/ubuntu/.local/share/jupyter/runtime/notebook_cookie_secret
[I 12:58:37.532 NotebookApp] Serving notebooks from local directory: /tf/notebooks
[I 12:58:37.532 NotebookApp] Jupyter Notebook 6.4.10 is running at:
[I 12:58:37.533 NotebookApp] http://aa1b305587bd:8888/?token=49c135d693e0b4d07d8c0164410ee6fc4593ac5e0578a34a
[I 12:58:37.533 NotebookApp]  or http://127.0.0.1:8888/?token=49c135d693e0b4d07d8c0164410ee6fc4593ac5e0578a34a
[I 12:58:37.533 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[C 12:58:37.544 NotebookApp]

    To access the notebook, open this file in a browser:
        file:///home/ubuntu/.local/share/jupyter/runtime/nbserver-1-open.html
    Or copy and paste one of these URLs:
        http://aa1b305587bd:8888/?token=49c135d693e0b4d07d8c0164410ee6fc4593ac5e0578a34a
     or http://127.0.0.1:8888/?token=49c135d693e0b4d07d8c0164410ee6fc4593ac5e0578a34a
```
**Note:** At that terminal there is no further action required.

### Running The Forecast Client
For your Forecast Client App to work and be able to connect to the Test Server you need to:

1. Update your User Profile with several nodes that today you might not have.
2. Create the Signing Account node to allow your Forecast Client app to run with an identity that the Superalgos Network can recognize.
3. Reference from the Task -> Task Server App Reference one of the nodes you added to your profile.
4. Change a config to specify the name of your Forecast Client, so that you can recognize it among other forecast clients on the execution reports.

Continue reading this section for detailed step by step instructions of how to do the above.

***Update your User Profile***

Before you can participate within the Superalgos P2P network, You need to add a few nodes to your User Profile. Once these nodes are added and configured properly you will need to contribute your updated profile to the Governance repo and make sure that it is merged by the PR merging bot.

Here is the complete list of nodes you need to add to your profile and how to configure them.

**Note:** All paths start from the User Profile node.

**Task Server App Node**
1. User Profile -> User Apps
2. User Profile -> User Apps -> Server Apps
3. User Profile -> User Apps -> Server Apps -> Task Server App

Once you have added the Task Server App node, hover over it and rename it using the following name: "Task Server App #1"

Then add the following configuration within the Task Server App node's config:
```json
{
    "codeName": "Task-Server-App-1"
}
 ```

**Bitcoin Factory Forecasts**
4. User Profile -> Forecast Providers
5. User Profile -> Forecast Providers -> Bitcoin Factory Forecasts

Hover over the Bitcoin Factory Forecasts node and rename it using the following name: "Testnet"

**Forecast Client Instance**
6. User Profile -> Forecast Providers -> Bitcoin Factory Forecasts -> Add Forecast Client Instance
7. Rename "New Forecast Client Instance" to something you can recognise and identify, you will need this name later in the guide

### Signing Accounts

Finally, you need to generate/re-generate the signing accounts of your User Profile, so that a new node of type Signing Accounts is created under the "Task-Server-App-1" node. The procedure to do this is the following:

1. At the Governance Project node create a Profile Constructor node.
2. Reference the Profile Constructor to your User Profile.
3. At the Profile Constructor menu, click on Install Signing Accounts. This will generate a new node under "Task-Server-App-1" and save a file to your My-Secrets folder with the Signing Accounts of your User Profile.

Congratulations! Now you are done with your profile.

Remember to save your User Profile plugin, contribute it and check that it was merged at the Governance repository.

**IMPORTANT:** It takes a few minutes for your profile to be auto-merged into the Governance repository and another 5 minutes to be picked up by the running Network Node. After changes to your profile, wait for around 10 minutes before expecting it to be able to connect to the Superalgos Network node.

***Reference the Task Server App***

Go to Bitcoin-Factory-Demo Workspace, change it's name and save it (so to have your own instance of that workspace). Go to Plugins Node and then import your User Profile into the Workspace

Locate the node Task Server App Reference, under your Forecast Client Task, and replace the current reference with a reference to the "Task-Server-App-1" node you created at your User Profile.

By setting up this reference you define the identity under which the forecast client will run on the P2P network. In other words, the signing account held under your "Task-Server-App-1" node acts like a finger print so that other entities running on the network can identify and work with your forecast client.

***Change the Config***

After that, open the config of the Forecast-Client Sensor Bot Instance. It looks like this:

```json
{
   "startDate": "2021-01-01",
   "networkCodeName": "Testnet",
   "clientInstanceForecaster": "devosonder-01",
   "clientInstanceBuilder": "devosonder-01"
}
```

* clientInstanceForecaster: **IMPORTANT:** Change this to match the name you gave to your New Forecast Client Instance node you created at your user profile.
* clientInstanceBuilder: **IMPORTANT:** Change this to match the name you gave to your New Forecast Client Instance node you created at your user profile.

**IMPORTANT:** If you are going to be using 2 or more computers, you need to take care of the Signing Accounts file that needs to be present at both / all computers (This is the one that lives in your My-Secrets file). In other words, you cannot generate the signing account at one computer and then generate it again at the second one. If you generate it at one computer and contributed your profile, then you need to copy the file inside the My-Secrets folder to the second computer/s.

**IMPORTANT:** Currently Test-Client and Forecast-Client do not work together on the same server.
