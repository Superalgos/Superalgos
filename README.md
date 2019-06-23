# Charly

Charly is a Sensor bot that is capable of extracting trades from exchanges. It has 3 main processes which together creates an ongoing dataset of trades guaranteed to be reliable.

## Live Trades

This process extracts the latest 2 minutes of trade records and save 2 files of 1 minute each. The last file written is overwritten at the next run, allowing the process to complete with the trades that happened after the previous execution retrieval of data. 

### Start Mode

The process need to run every 1 minute in noTime mode. 

```
"startMode": {
        "noTime": {
          "run": "false"
        }
      }
```

## Hole Fixing

When the Live Trades process goes down, the exchange goes down or anything in the middle goes down, data from the exchange can not be retrieved. Once Live Trades is running normally again a whole on the dataset appears between the last files saved and the new files after the restart.

The Hole Fixing process is there to detect those holes and retrieve the missing information, allowing the dataset to be 100% reliable. 

### Start Mode

This process runs every 1 minute under allMonths start mode, where a yearly range must be specified (initial processing year and final processing year)

```
"startMode": {
        "allMonths": {
          "run": "true",
          "minYear": "2019",
          "maxYear": "2021"
        }
      }
```

## Historic Trades

This process is designed to grabb historical trades information from an exchange, starting from the latest trades, and going all the way back to the begining of the market, respecting the exchange limits on trades per batch extracted.

This process is currently not being mantained, meaning that there is no guarantee that it can still run.

# Disclaimer

THE AA MASTERS BOTS AND THEIR ASSOCIATED PRODUCTS AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, SUITABILITY FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

IN NO EVENT WILL ADVANCED ALGOS BE LIABLE TO ANY PARTY FOR ANY DIRECT, INDIRECT, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES FOR ANY USE OF THE AACLOUD, THE AA ARENA COMPETITION, THE AA MASTERS BOTS, OR ANY OTHER ASSOCIATED SERVICE OR WEB SITE, INCLUDING, WITHOUT LIMITATION, ANY LOST PROFITS, BUSINESS INTERRUPTION, LOSS OF FUNDS, PROGRAMS OR OTHER DATA OR OTHERWISE, EVEN IF WE ARE EXPRESSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
