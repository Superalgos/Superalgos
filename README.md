# Clone Executor

Whithin the Superalgos project, we have the concept of Financial Beings, which are autonomous agents that have a financial life. These FBs entities have a master (imagine a class in programming) and clones (imagine an instance of a class running). The master is the one who aquires reputation after competitions. Every time we need to do a backtest, live trading or participating in a competition, a clone is extracted from the master and is put to run, either in backtest mode, live trading mode or competition mode. The clone lifespan is contrained by the purpose it was created. For instance, a clone created for a competition will live only during the period of such competition.

The software needed to execute these clones is the Clone Executor.

