# I'm Charly, an e-bot!
AKA an extractor algobot running on the AAPlatform by Advanced Algos Ltd.

### My Specialty
I get trades data for all markets --both historic and live-- assuring consistency using recursive processes, and store it in a highly fragmented and usable dataset.

### Ideal for
My dataset is fundamental for building candles and calculating volumes, along with many other indicators based on actual trade information.

### Details

| **Name** | **Type** | **Version** | **Release Date** | **Current dataSet** |
|----------|----------|----------|----------|----------|
| Charly |Extraction | 1.0 | Jan 2018 | dataSet.V1 |

# My Product

### Current Dataset Scope
* **Exchanges**: Poloniex
* **Markets**: USDT-BTC (only this market available at this point in time; the rest will follow soon)
* **Range**: Market Start Date – Current Time (-0 to 59 secs)

### Current Dataset
* **Version:** dataSet.V1
* **Update Frequency**: 1 minute
* **Cloud Output Location:** Charly > dataSet.V1
* **Folder Structure Tree**: Output > Trades > ExchangeName > Year > Month > Day > Hour > Minute
* **Files Structure**: One .json file per pair (e.g.: BTC_BCH.json, BTC_BCN.json, ... , ETH_BCH, ETH_BCN, etc.) stored at the Minute level of the Folder Tree Structure
* **In-File Record Structure**:
  * Trade ID at Exchange, numeric;
  * Trade Type, “sell” or “buy”;
  * Trade Rate, decimal;
  * Trade Amount A, decimal;
  * Trade Amount B, decimal;
  * Trade Seconds, numeric, 0 to 59
* **In-File Record Example**: 
  * [[19057863,"buy",7350.00000000,15.09998700,0.00205442,0],[19057864,"sell",7349.27989360,1.49682783,0.00020367,2], ... ,[19057865,"sell",7346.00000000,146.92000000,0.02000000,2],[19057869,"buy",7342.00000000,73.42000000,0.01000000,4]]


### Compatible Plotters
Not applicable.

### Dependencies
None.

### Data as a Service (DaaS) Fees
No fees.

# Disclaimer

THE AA MASTERS BOTS AND THEIR ASSOCIATED PRODUCTS AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, SUITABILITY FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

IN NO EVENT WILL ADVANCED ALGOS BE LIABLE TO ANY PARTY FOR ANY DIRECT, INDIRECT, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES FOR ANY USE OF THE AACLOUD, THE AA ARENA COMPETITION, THE AA MASTERS BOTS, OR ANY OTHER ASSOCIATED SERVICE OR WEB SITE, INCLUDING, WITHOUT LIMITATION, ANY LOST PROFITS, BUSINESS INTERRUPTION, LOSS OF FUNDS, PROGRAMS OR OTHER DATA OR OTHERWISE, EVEN IF WE ARE EXPRESSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
