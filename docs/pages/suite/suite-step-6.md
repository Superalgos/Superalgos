---
title:  Pull Data from Exchanges and Process Indicators
summary: To pull data from exchanges, start the corresponding sensor bot tasks. To process indicators, start the associated indicator bot tasks.
sidebar: suite_sidebar
permalink: suite-step-6.html
toc: false
---

Superalgos puts you in control of the market data you will work with. To do that, the system uses a <a data-toggle="tooltip" data-original-title="{{site.data.concepts.sensor_bot}}">sensor bot</a> to pull raw trades data from exchanges and store it in your machine. As the data starts building up, the system uses <a data-toggle="tooltip" data-original-title="{{site.data.concepts.indicator_bot}}">indicator bots</a> to add value to the raw data by producing more ellaborate <a data-toggle="tooltip" data-original-title="{{site.data.concepts.dataset}}">datasets</a> in the form of candles, and all sorts of indicators.

The sensor bot fetches data starting from a configurable date. Once it reaches the present time, it continues connecting to the exchange once per minute, pulling data in a live stream. Indicators process data in a similar fashion, and keep all your data up to date.

Depending on how you intend to use Superalgos, you may want to pull data from as far back as exchanges are willing to give. Such may be the case if you wish to backtest strategies.

On the other hand, if your interest lies in monitoring markets starting from the present time, then you most likely do not need historical data stretching that far in the past.

{% include tip.html content="It is up to you to decide how much historic data you wish to pull, and which exchanges you wish to work with. Downloading a month's worth of market data from high transaction volume exchanges such as Bitmex or Binance may take 2 to 3 hours. The same period worth of data in low transaction volume exchanges such as Bitfinex may take 10 to 20 minutes. What follows are the instructions to configure a date and start pulling data from you preferred exchanges. You may always go back and do things differently." %}

{% include important.html content="Bear in mind that Binance requires an API key to retrieve data. If your exchange of choice is Binance, then go to the exchange, log in to your account, and generate an API key. Have the public key and secret at hand before you start." %}

## Start Here

**1. Open the design space** by pulling the slider to the top of the screen.

**2. Go to the <a data-toggle="tooltip" data-original-title="{{site.data.network.network}}">network hierarchy</a>**. 

{% include /how_to/find-a-hierarchy.md heading="more" definition="yes" content="yes" extended="no" table="yes" more="yes"%}

**3. Hover the mouse over the network <a data-toggle="tooltip" data-original-title="{{site.data.concepts.node}}">node</a>** and click the {% include inline_image.html file="icons/12-expand.png" %} button on the menu. This action expands the <a data-toggle="tooltip" data-original-title="{{site.data.concepts.hierarchy}}">hierarchy</a>.

**4. Follow the <a data-toggle="tooltip" data-original-title="{{site.data.concepts.structure_of_nodes}}">structure of nodes</a> until you find the <a data-toggle="tooltip" data-original-title="{{site.data.network.data_mining}}">data mining</a> node**. This is where <a data-toggle="tooltip" data-original-title="{{site.data.network.sensor_bot_instance}}">sensor bot instances</a> and <a data-toggle="tooltip" data-original-title="{{site.data.network.indicator_bot_instance}}">indicator bot instances</a> live and function. 

Notice how the hierarchy continues with several <a data-toggle="tooltip" data-original-title="{{site.data.network.task_manager}}">task managers</a>. 

Each task manager has a label that starts with the words <a data-toggle="tooltip" data-original-title="{{site.data.concepts.masters_data_mine}}">Masters</a> or <a data-toggle="tooltip" data-original-title="{{site.data.concepts.sparta_data_mine}}">Sparta</a>. Those are two <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.data_mine}}">data mines<a/> shipping with the system. The label continues with the name of the corresponding <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.crypto_exchange}}">exchange</a> and <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.market}}">market</a>.

**5. Expand the task manager of your preferred exchange under the *Masters* label**. To do that, hover the mouse pointer over the select task manager and click the {% include inline_image.html file="icons/12-expand.png" %} button.

Notice how the hierarchy continues with several <a data-toggle="tooltip" data-original-title="{{site.data.network.task}}">tasks</a>. There is one task per bot. The first one in a clock-wise direction corresponds to the sensor bot.

**6. Select *Configure Bot instance* on the sensor bot menu**. A configuration bubble pops-up with the bot's configuration. 

**7. Enter the date you would like your datasets to start on**. Once the date has been edited, remove the mouse pointer from the bubble so that it closes and saves the configuration. To learn more about the implications of your choice for a starting date, click the link below.

{% include /network/sensor-bot-instance.md heading="" icon="no" adding="" configuring="######" starting="" content="no" definition="no" table="no" more="yes"%}

**8. If you chose to pull data from Binance, this is the time to configure your <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.exchange_key}}">exchange key</a>**. Click the link below to learn how.

<details class='detailsCollapsible'><summary class='nobr'>Click to learn how to configure an exchange key
</summary>

**1. Go to the <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.crypto_ecosystem}}">crypto ecosystem hierarchy</a>** and expand it. If you are on Windows, the <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>E</kbd> key combination should take you there. Otherwise, imitate the actions on the below video until you find it.

[IMAGE]

**2. Look for the exchange of choice** around the <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.crypto_exchanges}}">crypto exchanges</a> node and expand it too.

**3. Find the <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.user_keys}}">user keys</a> node** below <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.exchange_accounts}}">exchange accounts</a> &#8594; <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.user_account}}">user account</a>. 

**4. Configure the <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.exchange_account_key}}">exchange account key</a>**. 

{% include /crypto_ecosystem/exchange-account-key.md heading="" icon="no" adding="" configuring="######" starting="" content="no" definition="no" table="no" more="no"%}

</details>

**9. Go back to the task manager and click *Run All Tasks* on the menu**. This actions puts the sensor bot to run along with all Masters indicators.

