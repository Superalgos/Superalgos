# Bruce

Bruce is a low level Indicator bot that has as an input trades files and outputs 1 minute candles packaged on daily files.

## Single Period Daily

This process reads trades packed in 1 minutes files. For every day it creates a file with candles at 1 minute.

### Start Mode

This process runs every 1 minute under allMonths start mode, where a yearly range must be specified (initial processing year and final processing year)

## Dataset 1: Candles in 1 Minute Resolutions

### Current Dataset Scope
* **Exchanges**: Poloniex, Coss
* **Markets**: USDT-BTC
* **Range**: Market Start Date – Current Time (-0 to 59 secs)

### Current Dataset
* **Version:** dataSet.V1
* **Update Frequency**: 1 minute
* **Cloud Output Location:** AAMasters > AABruce.1.0 > AACloud.1.1 > ExchangeName > dataSet.V1
* **Folder Structure Tree**: Output > Candles > Multi-Period-Daily > (01-min | 02-min | 03-min | 04-min | 05-min | 10-min | 15-min | 20-min | 30-min | 45-min) > Year > Month > Day > Hour > Minute
* **Files Structure**: One .json file stored at the Minute level of the Folder Tree Structure
* **In-File Record Structure**:
  * Minimum, decimal;
  * Maximum, decimal;
  * Open, decimal;
  * Close, decimal;
  * Begin, decimal;
  * End, decimal;
* **In-File Record Example**:
  * [[13760.00000003,13799.99999984,13799.99999984,13785.89250371,1514764800000,1514764859999],[13760,13785.89250371,13766.22307573,13785.89250322,1514764860000,1514764919999], ... ,[13760,13785.89250322,13760.00000114,13760.00000089,1514764920000,1514764979999]]

## Dataset 2: Volumes in 1 Minute Resolutions

### Current Dataset Scope
* **Exchanges**: Poloniex, Coss
* **Markets**: USDT-BTC
* **Range**: Market Start Date – Current Time (-0 to 59 secs)

### Current Dataset
* **Version:** dataSet.V1
* **Update Frequency**: 1 minute
* **Cloud Output Location:** AAMasters > AACloud.1.1 > ExchangeName > dataSet.V1
* **Folder Structure Tree**: Output > Volumes > Multi-Period-Daily >  (01-min | 02-min | 03-min | 04-min | 05-min | 10-min | 15-min | 20-min | 30-min | 45-min) > Year > Month > Day > Hour > Minute
* **Files Structure**: One .json file stored at the Minute level of the Folder Tree Structure
* **In-File Record Structure**:
  * Buy Volume, decimal;
  * Sell Volume, decimal;
  * Open Volume, decimal;
  * Close Volume, decimal
* **In-File Record Example**:
  * [[7412.27033867,7414.5873403,7414.57532252,7414.5873403],[7390.42410104,7414.5873403,7412.06261697,7390.42410104], ... ,[7390,7392.88810353,7392.88810353,7390]]

### Compatible Plotters
[AAMasters Plotters-Candles-Volumes](https://github.com/AAMasters/Plotters-Candles-Volumes)

### Dependencies
[AAMasters Charly](https://github.com/AAMasters/AACharly-Extraction-Bot)

### Data as a Service (DaaS) Fees
No fees.

# Disclaimer

THE AA MASTERS BOTS AND THEIR ASSOCIATED PRODUCTS AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, SUITABILITY FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

IN NO EVENT WILL ADVANCED ALGOS BE LIABLE TO ANY PARTY FOR ANY DIRECT, INDIRECT, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES FOR ANY USE OF THE AACLOUD, THE AA ARENA COMPETITION, THE AA MASTERS BOTS, OR ANY OTHER ASSOCIATED SERVICE OR WEB SITE, INCLUDING, WITHOUT LIMITATION, ANY LOST PROFITS, BUSINESS INTERRUPTION, LOSS OF FUNDS, PROGRAMS OR OTHER DATA OR OTHERWISE, EVEN IF WE ARE EXPRESSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
