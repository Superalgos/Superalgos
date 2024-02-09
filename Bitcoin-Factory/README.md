# Bitcoin Factory Crowd-Testing of Machine Learning Models.

## Introduction
What if I told you the price of the next market candle?  What would you do or pay to get that information? Knowing the min, max and close of the next candle is a big deal! It may seem like there must be a crystal ball or gimmick involved, but here at the Bitcoin Factory, we are putting together the power of advanced data mining and machine learning to do just that! 

The thing about Machine Learning, however, is that it takes a lot of processing power. Way more than the average person can afford. That is why the Bitcoin Factory has set out to crowd source the processing power needed to push the prediction power of the collective forward! What this means is that with limited data mining or machine learning experience, you can help make telling the future more and more of a reality! All you need is some basic technical abilities to run Superalgos (our open-source crypto trading automation platform) and contribute some CPU/GPU cycles to the collective effort!

The way this works behind the scenes is by collectively testing all possible combinations of machine learning model parameters that not only define the architecture of the model, but also the shape of the data and many other things. For each of these parameters, there is a valid range of values that could work, but only in combination with other parameters which also have their own valid ranges. Nobody knows what combination is going to produce the best results for a particular Asset / Timeframe. A Machine Learning models accuracy is determined by the error measured when producing forecasts using a test dataset after training the model. These forecasts are compared with the actual values and from there an objective Error measure is taken. 

In order to obtain that error measure, first an ML model with certain parameters and certain data need to be created and trained, which usually takes time (from a few minutes to potentially hours).  In order for this to be successful, all possible combinations of the parameters need to be tested for each and every market and time frame you wish to work with. There is no way to know which data sets are the most relevant to make useful predictions. This means that training the machine learning model needs to test not just thousands, but millions of cases in order to reach a good amount of stability.

Testing combinations of parameters and data (with potentially hundreds of indicators to choose from, thousands of crypto assets, and dozens of time-frames) by hand, one by one, would be a nightmare. The Bitcoin Factory system solves this problem by automating the discovery of the best performing ML models, for a certain range of parameters values and certain set of indicators, for each combination of Asset / Timeframe. Over time, we will learn which set of parameters and data produces the best model for a certain Asset / Timeframe. Now add that markets evolve and change all the time, meaning that even if you found the perfect set of parameters for today’s predictions, the model will eventually become obsolete! This is a job for a growing and unstoppable collective!

Once a set of parameters and data is discovered to have good prediction value, it will be used to calculate a Superalgos prediction indicator.  As testing continues and a better performing prediction is found, it will replace the old prediction. Then all the forecasts for that asset / timeframe are recalculated using this new performant ML model.  This process continues eventually replacing the prediction again with an even better ML model in the future. This continual cycle will overtime lower the ML model's % error.  Using this cyclic method, the accuracy of predictions will improve the longer the Bitcoin Factory runs and the larger the collective grows. 

This continual and never-ending task of brute-force testing so many possible combinations is the perfect candidate for a crowdsourced effort, because no individual can run all the required tests on their own unless they are willing to make substantial investments to set up and operate a significant data processing facility. Not only that, but running such an operation as an individual opens up the door for directed attacks and disruptions. However, working as a collective will make it impossible to shutdown or beat a distributed, ever-growing crowdsourced effort, and that is why you will want to join!

If that wasn't enough to get you excited about joining the Bitcoin Factory's efforts, there is one more huge set of incentives. When you run the ML Test Client and contribute processing power, the test client will keep track of the test cases your hardware solves.  It then sends the results to the ML Test Server which logs the work performed by your User Profile. This contributed processing power will be rewarded each month with Superalgos' native token! Once you have accumulated enough tokens for your contributions, you will be granted access to the best available predictions offered by the Bitcoin Factory.  These will include predictions of the next candle for top crypto assets paired against USDT for time frames of 1, 2, 3, 4, 6, 8, 12, and 24 hours. You will also be granted access to buy and sell signals derived from other collective ML models we are training. All of these prediction and signals will be accessible from a unique indicator that can be used to trade manually or incorporate into automated strategies you may build using Superalgos. 


## Overview of Architecture 
### How does the Bitcoin Factory Architecture Work?

The Bitcoin Factory is a set of Software built on top of the Superalgos Ecosystem. The Bitcoin Factory itself consists of three main components or applications: 

1. The Superalgos Network Node
2. The Test Server Application        
3. The ML Test Client Application --> This is what individuals will run to contribute processing power.
4. The Forecast Client Application

#### The Superalgos Network Node

Superalgos supports a decentralised Peer 2 Peer network that offers many ways to share and grow trading intelligence. Superalgos Network Nodes live on the open internet and function as access points for the Peer 2 Peer network.  Contributors to the Bitcoin Factory are currently running Network Nodes to allow the other pieces of the Bitcoin Factory to communicate with one another as a collective.   

#### The Test Server Application

The test server app acts as a coordinator for all testing and forecast cases.  It does not actually run any of these tests or calculate forecasts. Instead, you can think of it as the traffic officer directing traffic from the middle of a busy street. It records, organizes, and assigns test cases to all active Test Client apps. Every time a test case is solved, it is sent back to the test server app and recorded.  Whenever the test server receives a parameter combination with a lower Error % for a certain Asset / Timeframe, the test case is transformed into a Forecast Case.  This new forecast case then replaces the previous best performing forecast case for that same Asset / Timeframe. This is then sent to Forecast Clients apps to be processed.

**Note:** The test server app is run by the Bitcoin Factory. 

#### The ML Test Client Application 

The Test Client app feeds itself from the Test Server with test cases. It runs each Test Case at the Tensor Flow Docker Container. Then reports back to the Test Server with the test results. Once these results have been reported, the test server will send back a new test case, as well as the most recent forecast data. The new test case will then be tested, while the forecast data will be converted and saved to Superalgos as an indicator. 

#### The Forecast Client

The Forecast Client app feeds itself from the Test Server's forecast cases. A forecast case is the best known set of parameters for a certain Asset / Timeframe. The job of this App is to recreate the model discovered by a Tester using the Test Client App.  Once this model is recreated, it is used to start forecasting the next candle for that Asset / Timeframe. The forecasts produced by this App are then sent to the Test Server and distributed to the Test Client Apps every time they solve a new test case. 

## How do we know which are the best Forecasts?

Each tested model (created based on a set of parameters and a custom dataset) has a certain implied Error: the root-mean-square error (RMSE).

https://en.wikipedia.org/wiki/Root-mean-square_deviation

The whole point of crowd-testing is to find the model with the lowest % of error for a certain Asset / Time-Frame. 

**Note:** All forecasts are done at the Asset/USDT markets on Binance for now.

When you are running a Test Client App, you are testing certain combinations of parameters for a certain Asset / Time-Frame including a custom dataset for your specific test, which might include a certain combination of indicators data.

The crowd-sourced forecasts you receive after each test, are the ones belonging to ML models with the lowest % error for a certain Asset / Time-Frame.

## Why is this System Beautiful?

The beauty of the Bitcoin Factory is that the precision of the forecasts will only improve over time. Think about it, once we find the right set of parameters and data for BTC / 1Hs with an error value of 0.8 %. We will be forecasting with this model until the minute anyone in the crowd finds another set of parameters and data for BTC / 1Hs with a lower error. For example, if the new error value is 0.6 %, from that point in time all forecasts will be done with the new ML model until an even better model is found with even less % error.

It might take time, but our collective intelligence can and will only improve over time. 

All this finding and forecasting is 100% automated. Only computers working together. The more people join the effort, the faster we find better models, the better the forecasts become for all the people participating. Beautiful, isn't it?

Having said that, please don't expect that forecasts will be precise in the beginning. We are discovering the best combination of parameters and data for each Asset / Timeframe with pure brute-force, and that might take a while to produce models with reasonable performance. However, once we have them, we have them forever.


## How to Start
1. **Download and Install Superalgos**
- Once you’re ready to go, click this link https://github.com/Superalgos/Superalgos#readme to go to the Superalgos Github repository and follow the instructions on the main README file to get up and running with the Installation for Developers and Contributors (other installations are not tested for the ML project).

- If you have any issues with the installation or the learning curve, join the Superalgos Support group on Telegram or the Superalgos Discord server to get help from the community.

- You should also join the Superalgos Machine Learning group on Telegram to get help with running the testing tasks and to get in touch with the crowd driving the ML area of the project.

2. **Do the First Three Tutorials**
- You need to get familiar with Superalgos before you may participate in the crowd-testing efforts.

- I’ll be completely honest with you… Superalgos is a vast system designed to unleash incredible power — but requires time to master. It’ll take anything from two to three hours to complete the first three in-app interactive tutorials.

- Those first few tutorials will give you an overall understanding of how the system works. There are many more tutorials that you can go through, and over 1500 pages of documentation built into the app.

- The whole thing may not be suitable for a weekend adventure. But if you’re interested in trading, automation, and ML, then I’m confident Superalgos will blow your mind and I’m certain the learning process will be worth every second of your time!

3. **Create and Contribute Your User Profile**
- Your user profile is your identity within the project. You will need it to authenticate with the test server.

- To create your profile you will go to the Token-Distribution-Superalgos workspace and do the Creating Your User Profile Tutorial.

4. **Learn How to Run the ML Test Client**
- By the time you’re familiar with Superalgos and have created your User Profile, you’ll be ready to start participating in the testing efforts!

- Go to the Bitcoin Factory folder open the Test-Client directory and follow the instructions in the Test Client's README file to get up and running!

## Development To Do List

### Bug's that need fixing:
 1.  The forecaster is sending undefined values.

## Dashboard setup and progress
The dashboard is in early stages of development but will be useful for members to quickly view statistics and data supplied from servers and test clients. Discussions, views and opinions on this matter should be brought up in the telegram group.

### Example Dashboard features:
 - Lowest % error & What user found it.
 - Timeframe
 - Asset
 - Data mine / Indicators activated / Live server readings (green/Red icons)
 - Trusted server list/ Trusted server icon?
 - Percent test cases processed per user account
 - Average time to complete cases?
 - Test cases completed out of total number of cases...

## Server Operator Guidelines
Only trusted members will be selected to run servers, these members are known as server operators and must have token rewards, contributions to the project and must have good knowledge of the entire system. Test servers are to be deployed as and when the system requires it, not when someone requests to run one.
Server operators who are testing mines and indicators are required to record the results and create reports with their findings. Taking into account market conditions, predictions and other useful information then contribute the findings.

### Who will authorise new server operators.
Lead developers and senior members of the group should vote if a new server is required, then after authorisation a team member will be asked if they would like to participate. If you feel like you are experiencing bottlenecks or other server related issues then bring them to the attention of the group.

### How and where will we mark servers as Trusted?
 - At the moment all servers are trusted, but when the system scales there may become a need to approve servers. Trusted servers will allow users to identify easily if they prefer to connect to a SA approved server. An icon or something similar could be used to show that servers are approved within the dashboard or workspace?

 - Server operators are required to compile reports, automatic analysis & report compiling could be added to via a script or node. Including report merging ready for governance?

### Governance & Fair ML case generation
 - Test cases at the time of writing are to be standardised to 750 epochs, this will ensure the test cases completed and governance rewards are fair. The future of test case rewards will be based on the user finding the lowest %ErrorRMSE.
 - Epochs set to 750 and indicators activated are to be per data mine or up to 10 indicators activated.


## Complaints and reporting abuse, scams or cheats.
- If you suspect member(s) are cheating the system please notify lead developers, server operators or senior team members either directly or via the telegram group.
- Any issues that arise that may allow users to claim rewards unfairly must be brought to the attention of the group immediately.

## P2P storage for centralised real-time data sharing
 - Mine & Indicator tracking within separate servers.
 - Live data feed inside the dashboard with green/red icons per data mine/ indicators active/inactive.
 - How will server operators run servers? example: single server node dedicated to one data mine/indicator set activated?
 - Test clients to decide who to connect to or auto connect to the best performing (trusted) servers.



## Network Nodes:
Some notes here are open for discussion
 - How many do we need?
 - Who and Where hosted?
 - Setting up new network groups (Testnet, Mainnet, Usernet, Anynet)
 - Whitelisting network groups, allowing subgroups to focus resources on chosen areas.

## Reinforcement Learning:


## System level coordination for test servers:

## Updates
