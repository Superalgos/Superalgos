---
title:  Fundamental Infrastructure Concepts
summary: "There are three types of bots required to process data, and to trade: sensors bots, indicators bots, and the trading bot. Their definitions and the information required to operate them are scattered on all five hierarchies."
sidebar: suite_sidebar
permalink: suite-fundamental-infrastructure-concepts.html
---

<a data-toggle="tooltip" data-original-title="{{site.data.concepts.bot}}">Bots</a> are defined in <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.data_mine}}">data mines</a>. That is, data mines hold the source code and configuration&mdash;the complete set of definitions&mdash;of the three existing kinds of bots: <a data-toggle="tooltip" data-original-title="{{site.data.concepts.sensor_bot}}">sensors</a>, <a data-toggle="tooltip" data-original-title="{{site.data.concepts.indicator_bot}}">indicators</a>, and the <a data-toggle="tooltip" data-original-title="{{site.data.concepts.trading_bot}}">trading bot</a>.

Using any of these bots entails creating an instance of the bot definition, so that this instance may run the bot's code. This is done from within the <a data-toggle="tooltip" data-original-title="{{site.data.network.network}}">network</a> hierarchy.

A bot instance is a reference to a bot as defined in a data mine. The instance of the bot runs the defined <a data-toggle="tooltip" data-original-title="{{site.data.concepts.process}}">processes</a> and generates the defined <a data-toggle="tooltip" data-original-title="{{site.data.concepts.data_product}}">data products</a>.

You use <a data-toggle="tooltip" data-original-title="{{site.data.network.task_manager}}">task managers</a> and <a data-toggle="tooltip" data-original-title="{{site.data.network.task}}">tasks</a> within the network hierarchy to control bot instances, meaning, to start and stop them. Also in the network hierarchy lies the configurations about where the data they generate is to be stored.

Upon execution, bot instances run in a branched sequence determined by their <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.status_dependency}}">status</a> and <a data-toggle="tooltip" data-original-title="{{site.data.data_mine.data_dependency}}">data dependencies</a>. For instance, if bot Alice depends on the data produced by bot Bob, then Alice is configured to run as soon as Bob finishes its execution. These configurations are already set up for all existing bots, in the corresponding data mine. Therefore, you only need to worry about this if you create new bots.

What you do need to understand is that, if Alice depends on data Bob produces, then Bob needs to be running for Alice to do her job. If Bob is not running, then Alice can only sit and wait for Bob to do his part first.

Each bot runs for as long as it may require to perform its job, usually in the order of a few seconds, and remains asleep until the next cycle is due. That is, bots run for short bursts, in frequent cycles. The reason for this behavior is that bots are prepared to read live data feeds and process it online.

Bots need to know which <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.market}}">market</a> of which <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.crypto_exchange}}">exchange</a> they should work with. Exchanges and markets are defined in the <a data-toggle="tooltip" data-original-title="{{site.data.crypto_ecosystem.crypto_ecosystem}}">crypto ecosystem</a> hierarchy. Bots obtain that information by establishing <a data-toggle="tooltip" data-original-title="{{site.data.concepts.reference}}">references</a> with the appropriate markets in that hierarchy.

In the case of the trading bot, it also needs to know which type of <a data-toggle="tooltip" data-original-title="{{site.data.concepts.session}}">trading session</a> it should run, and what <a data-toggle="tooltip" data-original-title="{{site.data.trading_system.trading_system}}">trading system's</a> rules it should follow. For those reasons, trading bots are paired with a specific session, which in turn, references a trading system.

{% include note.html content="The information covered *en passant* on this page is explained in detail throughout these infrastructure pages." %}



