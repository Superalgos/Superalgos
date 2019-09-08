# Task Server

Whithin the Superalgos project, we have the concept of Financial Beings, which are autonomous agents that have a financial life. These FBs entities have a master (imagine a class in programming) and clones (imagine an instance of a class running). The master is the one who aquires reputation after competitions. Every time we need to do a backtest, live trading or participating in a competition, a clone is extracted from the master and is put to run, either in backtest mode, live trading mode or competition mode. The clone lifespan is constrained by the purpose it was created. For instance, a clone created for a competition will live only during the period of such competition.

The software needed to execute these clones is the Task Server.

## Installation

To install the Task Server plase clone this repo and:

```
npm install
```

Then, ask for the .ENV and config files to the Core Team (This is a temporary measure until we pack everything into a Superalgos Node).

You can use then the included visual studio solution to start debugging right away, or:

```
node server.js
```

## Copyright and License Notice

© Copyright 2018 Advanced Algos. Please see the [Task Server License](/LICENSE) for information on how you can use this software.

## Disclaimer

THE AACLOUD AND ITS ASSOCIATED PRODUCTS AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, SUITABILITY FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

IN NO EVENT WILL ADVANCED ALGOS BE LIABLE TO ANY PARTY FOR ANY DIRECT, INDIRECT, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES FOR ANY USE OF THE AACLOUD, THE AA ARENA COMPETITION, THE AA MASTERS BOTS, OR ANY OTHER ASSOCIATED SERVICE OR WEB SITE, INCLUDING, WITHOUT LIMITATION, ANY LOST PROFITS, BUSINESS INTERRUPTION, LOSS OF FUNDS, PROGRAMS OR OTHER DATA OR OTHERWISE, EVEN IF WE ARE EXPRESSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
