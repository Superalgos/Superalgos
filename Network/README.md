The use cases for Superalgos Network Nodes are:

1. To enable the communication between software modules to collaborate on the testing of ML models.
2. To enable the distribution of Trading Signals.
3. Others in the future.  

At the moment, on this README file we will focus on the use case #1, though part of the explanation is valid to set up a Network Node for other purposed too. 

# :small_orange_diamond: Creating Network Node for Bitcoin Factory.

## :small_orange_diamond: Introduction


The Bitcoin factory needs a number of components to run. These components work independently from each other, but in an integrated manner. We can divide these configurations into 4 main sections. 

1. [The Test Server Application](https://github.com/Superalgos/Superalgos/blob/develop/Bitcoin-Factory/README.md#the-test-server-application)
2. [The ML Test Client Application](https://github.com/Superalgos/Superalgos/blob/develop/Bitcoin-Factory/README.md#the-ml-test-client-application)
3. [The Forecast Client Application](https://github.com/Superalgos/Superalgos/blob/develop/Bitcoin-Factory/README.md#the-forecast-client)
4. [The Superalgos Network Node](https://github.com/Superalgos/Superalgos/blob/develop/Bitcoin-Factory/README.md#the-superalgos-network-node)

In this readme, network node setup from the 4 components mentioned above, which is required for the Bitcoin Factory to work, will be explained.

Superalgos supports a decentralized Peer 2 Peer network that offers many ways to share and grow trading intelligence. Superalgos Network Nodes live on the open internet and function as access points for the Peer 2 Peer network.Theoretically and practically, the network node is the node that provides communication between the clients and the test server.

In the current version, multiple test servers can run (v 0.7), but only one network node can run. Future versions of the Bitcoin factory will be configured to allow multiple network nodes to run.

## :small_orange_diamond: Getting Started

If you're considering running a mesh node, you're probably familiar with Superalgos. But if you don't feel ready about it,follow the instructions in the main [README](https://github.com/Superalgos/Superalgos#small_orange_diamond-superalgos-120) file for developers and contributors to get the Setup up and running. You can also get help from the videos about the installation. For example: https://youtu.be/Q4HVdfNdHbk


## :small_orange_diamond: Pre-Requisites

Running a network node is actually pretty easy. What you need is your user profile that you have added to the Superalgos Governance System and a P2P node that you will create in your profile. This video on creating a profile for the governance system can guide you : https://youtu.be/Sa5B-bwg81A

If everything is ready, we can go now 🏃

## :small_orange_diamond: Network Node Setup

Now that you have completed the Superalgos installation and created your user profile, we can proceed to the Network Node configuration. 

You need to add a few nodes to your User Profile, and once you finish, you need to contribute it to the Governance repo and make sure that it is merged by the PR merging bot. 

Here is the complete list of nodes you need to add to your profile, in case you don't already have them. All paths are starting from the User Profile node.

**1. User Profile Node -> Add Child -> Add P2P Network Nodes :**  | This option is optimized for non-technical users and is by far the easiest way to get started with Superalgos. These are not suitable for development or for contributing.

**2. User Profile Node -> Add Child -> Add P2P Network Nodes -> Add P2P Network Node :** | The P2P Network Node node defines a node to run on the Superalgos peer to peer network. When we add this node, several child nodes are created under the node:
  + Network Interfaces
  + Network Services
  + P2P Network Reference
 
 There are a few more child nodes that we need to add to these created nodes.
 
  + We add **Websockets Network Interface** and **HTTP Network Interface** child nodes under the **Network Interfaces** node.
  + We add **Machine Learning** child nodes under the Network Services node.

### Change the Config

After that, open the config of the P2P Network Node. It looks like this:

```sh
{
    "codeName": "",
    "host": "localhost"
}
```

* codeName: You can leave this with the default..
* host: Change this configuration by typing the IP address of the machine where you will run the Network Node. For example *78.175.44.125*

**IMPORTANT: The websocket port of the machine you will use as a network node must be open. If it is not open, do not forget to provide the necessary configuration from the firewall settings.This port number is 18042 by default.**

### Signing Accounts

Finally, you need to generate the signing accounts of your User Profile, so that a new node of type Signing Accounts is created under the "P2P Network Node". The procedure to do this is the following:

1. At the Governance Project node create a Profile Constructor node.
2. Reference the Profile Constructor to your User Profile.
3. At the Profile Constructor menu, click on Install Signing Accounts. This will generate a new node under "P2P Network Node" and save a file to your My-Secrets folder with the Signing Accounts of your User Profile.

Now you are done with your profile.

Remember to save your User Profile plugin, contribute it and check that it was merged at the Governance repository.

It takes a few minutes for your profile to be auto-merged into the Governance repository.After changes to your profile, wait for around 10 minutes before expecting it to be able to connect to the Superalgos Network node.

## :small_orange_diamond: Running

Now we have come to the end of the work. There is only one thing left to do: run the network node.

Starting the network node is just like starting Superalgos. To do so, just run this command from the Superalgos main folder:

```sh
node network
```

 
  














