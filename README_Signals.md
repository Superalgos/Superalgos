# SUPERALGOS OUTGOING AND INCOMING SIGNALS


![image](https://user-images.githubusercontent.com/93773753/184357506-230ef79a-cf45-40f9-a1f8-3b83ace321e1.png)


Table of Content:

- Getting Ready
- Set up your [User Profile](#set-up-your-user-profile)
- Set up Superalgos [P2P Environment](#note)
- Set up a Workspace for [SENDING](#outgoing-signals) Signals
- Set up a Workspace for [RECEIVING](#incoming-signals) Signals
- [Troubleshoots](#troubleshooting-errors)

---

## GETTING READY

This Readme covers the set up of Superalgos in order to be able to send or receive *signals* from the Superalgos P2P Network.

It's supposed that you're familiar with Superalgos. But if you don't feel ready about it, follow the instructions in the main README file for developers and contributors. 

You can get help from videos about installation https://youtu.be/Q4HVdfNdHbk or how to make a User Profile https://youtu.be/Sa5B-bwg81A.

Whether you want to be a *Sender* or a *Receiver* there are few concepts to keep in mind:

- The **User Profile** that becames essential to be able to identify users in the P2P network (i.e. A Sender can decide to send signals only to specific users. And a Receiver can be sure that signals are sent from a specific user and nobody else)

- The **P2P Network** that is mandatory for *Senders* but NOT for *Receivers*!

- A running **SERVER** that is mandatory for *Senders* but NOT for *Receivers*!



## SET UP YOUR USER PROFILE

![image](https://user-images.githubusercontent.com/38046064/183973288-81b2ccd3-f36e-41b2-92e3-6a0f3c683d9e.png)


The User Profile setup of *Senders* is only slightly different from a Receiver. 

#### FOR RECEIVERS

Set up your User Profile adding these nodes:

- User Apps > Server Apps > Task Server
- User Apps > Server Apps > Social Trading Server
- User Bots > Social Trading Bots > Social Trading Bot > Available Signals



#### FOR SENDERS 

All the above plus:

- User Bots > Social Trading Bots > Social Trading Bot > Available Signals > Trading System Signals > Trading Strategy Signals
- User Bots > Social Trading Bots > Social Trading Bot > Available Storage
- User Storage > Github Storage > Github Storage Container

Under the P2P Network Node in your user profile:
- Add Network Services > Trading Signals
- Reference P2P Network Reference to the network of choice (mainnet or testnet for public signals or your own permissioned P2P network)

N.B. Under the Social Trading Bot node in your profile, you must:
- Reference Available Storage Reference to the Github Storage Container of choice
- Edit/check Trading Strategy Signals. Here you setup which signals you want to send. More details are found under the section "[OUTGOING SIGNALS](#outgoing-signals)"


### Github Storage Container

In order to be able to send signals, *Senders* must have a Storage Container. In this current development Superalgos makes use of Github repositories that will host the files, don't worry they are encrypted :)

Under the Github Storage Container:
- Edit codeName to a unique identifier
- Edit githubUserName to your github user account
- Edit repositoryName to your github repository where you'll save the trading signals

You must also add a JSON-file to your Superalgos folder, under Superalgos/My-Secrets create a file called "ApisSecrets.json", enter the following details in the following format.

```js
{
	"secrets": [
		{
			"nodeCodeName": "codeName-that-you-have-chosen-in-github-storage-container",
			"apiToken": "your-api-token-from-github"
		},
		{
			"nodeCodeName": "codeName-that-you-have-chosen-in-github-storage-container-number2",
			"apiToken": "your-api-token-from-github"
		}
		]
}
```



### Signing Account 

After you are done with your changes to your user profile, you must sign them. This is to ensure that you are you and noone else. This is done with the Profile Constructor (part of the Governance project). 

- Reference your User Profile to the profile constructor
- Profile contructor > Installing signing account
- User Profile > Save Plugin
- **PR your updated profile**

![image](https://user-images.githubusercontent.com/93773753/184140606-b94435cd-96ec-4ab5-8d22-ed989cab85ef.png)

Remember to save your User Profile plugin, contribute it and check that it was merged at the Governance repository.

**IMPORTANT**: It takes a few minutes for your profile to be auto-merged into the Governance repository and another 5 minutes to be picked up by the running Network Node. After changes to your profile, wait for around 10 minutes before expecting it to be able to connect to the Superalgos Network node.



## SUPERALGOS P2P ENVIRONMENT

Whatever network you choose to send signals over, or even if you just want to receive signals, you have to make sure that in the Environment.js files the P2P Network that will be used must be in sync with the User Profile P2P Network config.

For example the following was used for Permissioned P2P Network hosted by the user Blaa:

```js
SOCIALTRADING_TARGET_NETWORK_TYPE: 'Permissioned P2P Network',
SOCIALTRADING_TARGET_NETWORK_CODENAME: 'BlaaSignals',
TASK_SERVER_TARGET_NETWORK_TYPE: 'Permissioned P2P Network',
TASK_SERVER_TARGET_NETWORK_CODENAME: 'BlaaSignals',
```

In this case the user Blaa (as a *sender*) must config his network with these lines of code, while a *receiver* would anyway modify the code in the same way in order to be able to connect to Blaa's Permissioned P2P Network.


**Using Tesnet will at the moment result in interference with the Machine Learning Project, as they are using Testnet. Should not happen, but seems to be a bug there.**


	
**NOTE:** There needs to be network nodes running for the choosen network, if permissioned p2p you need to run your own node. 

To run a node simply run the following command, which will run your default network node (default is set to number one), 
```js
node network
```
If you wish to run any other you can use the following command, and changing the number to the corresponding node number from your user profile.
```js
node network-node-2
```

	
---
## OUTGOING SIGNALS

To be able to send signals using the built in features of Superalgos, you must add your User Profile with specific nodes to the Workspace with the Trading System you want to use. At minimal your workspace should looks like the screenshot below with your User Profiles.

![image](https://user-images.githubusercontent.com/93773753/184310271-fd0d171f-a414-4518-af35-2bd806546cd6.png)



### Trading System

Next step is to setup the trading system! 

- Reference Trading System Outgoing Signal Reference to Trading System Signal (Under Socical Trading Bot > Available Signals)
- Add outgoing signals for choice, you can add as many or as few that you wish
	- If signals are based on formulas, you can if you wish add Signal Context Formula, to even further edit the value being sent. 
- Reference all outgoing signals to the correct Signal under Trading Strategy Signals.
	- For instance, a Market Buy Signal in the trading system goes to the Market Buy Signal under Trading Strategy Signals. 

![image](https://user-images.githubusercontent.com/93773753/184138630-d169a22a-102d-40fb-ba62-81f2691f0a17.png)


### Trading Task Node

Almost there, you need to add a couple of nodes before you run your trading task (either Testing Trading Tasks or Production Trading Tasks).

- Add Task Server Reference on Task
	- Reference Task Server Reference to the a free Task Server in the User Profile 
- Add Social Trading Bot Reference to Trading Bot Instance
	- Reference Social Trading Bot Reference to the correct Social Trading Bot in User Profile (the one that will send your signals)

![image](https://user-images.githubusercontent.com/93773753/184290130-ecdd07a8-d894-46ee-9252-56a8b05b99a2.png)

---

# INCOMING SINGALS 
Set up a Workspace for *receiving* signals from a Superalgos User.

To be able to receive signals using the built in features of Superalgos, you must add the User Profile which sends the signgals to a Workspace with the Trading System you want to use. At minimal your workspace should looks like the screenshot below with your User Profiles.

![image](https://user-images.githubusercontent.com/38046064/184152474-3231b3e1-1cc8-4bc6-bdca-354ae594ff9f.png)


## User profile
- Add User Apps > Server Apps > Task Server
- Add User Bots > Social Trading Bots > Social Trading Bot > Available Signals > Incoming Signals

## Incoming Signals

Here you add what signals you want to use in your trading system. 
You reference them from the user profile that is sending the signals (under available signals > trading system signals > trading strategy signals)

![image](https://user-images.githubusercontent.com/93773753/184138327-1a3fa950-51d6-41ee-bc43-c2c72c75ecb9.png)

Signals cannot be used as a conditions on it's own, to use signals as a true/false statement, enter the following as a conditions to the event: 

```js
if (signals !== undefined && signals.length > 0) {
    true
} else {
    false
}
```

**Note**: You have to add the trading system signal, otherwise the candles won't sync. 
![image](https://user-images.githubusercontent.com/93773753/184138062-cb032cf4-f01b-4602-9c63-e81a0e7daec4.png)

## Signing Account

- Reference your User Profile to the profile constructor
- Profile contructor > Installing signing account
- User Profile > Save Plugin
- **PR your updated profile**

Remember to save your User Profile plugin, contribute it and check that it was merged at the Governance repository.


## Trading Task Node 
To receive trading signals into the trading task you need to add a couple of nodes before you run your trading task (either Testing Trading Tasks or Production Trading Tasks).

- Add Task Server Reference on Task
	- Reference Task Server Reference to the a free Task Server in the User Profile 
- Add Social Trading Bot Reference to Trading Bot Instance
	- Reference Social Trading Bot Reference to the correct Social Trading Bot in User Profile (the one that will send your signals)

![image](https://user-images.githubusercontent.com/93773753/184290323-d6908658-c318-4e29-b692-f4a08b7078fb.png)

---

# TROUBLESHOOTING ERRORS

### Network Client Identity

"Fatal Error. Can not run this task. The Network Client Identity does not match any node at User Profiles Plugins."
This error occurs when the signing account does not match the Governance plugin repository's account. To ensure they are the same, import your user profile on the workspace using the "Add specified User Profile" command under Plugins -> Plugin Project -> Plugin User Profiles. Add the correct nodes, references and signing account to the plugin as detailed in App Setup. Save the plugin and push the changes to the Governance repository and wait 10 minutes for it to merge and be picked up by the Forecast Server.

