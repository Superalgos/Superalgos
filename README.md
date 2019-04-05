# Bruce

Bruce is a low level Indicator bot that has as an input trades files and outputs 1 minute candles packaged on daily files.

## Single Period Daily

This process reads trades packed in 1 minutes files. For every day it creates a file with candles at 1 minute.

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

# Disclaimer

THE AA MASTERS BOTS AND THEIR ASSOCIATED PRODUCTS AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, SUITABILITY FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

IN NO EVENT WILL ADVANCED ALGOS BE LIABLE TO ANY PARTY FOR ANY DIRECT, INDIRECT, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES FOR ANY USE OF THE AACLOUD, THE AA ARENA COMPETITION, THE AA MASTERS BOTS, OR ANY OTHER ASSOCIATED SERVICE OR WEB SITE, INCLUDING, WITHOUT LIMITATION, ANY LOST PROFITS, BUSINESS INTERRUPTION, LOSS OF FUNDS, PROGRAMS OR OTHER DATA OR OTHERWISE, EVEN IF WE ARE EXPRESSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
