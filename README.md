# I'm Olivia, an AA i-Bot!

### My Specialty
I produce several datasets:
* One with candles at 1, 2, 3, 4, 5, 10, 15, 20, 30, 45 minutes resolution;
* One with candles at 1, 2, 3, 4, 6, 8, 12, 24 hours resolution;
* One with volumes at 1, 2, 3, 4, 5, 10, 15, 20, 30, 45 minutes resolution;
* One with volumes at 1, 2, 3, 4, 6, 8, 12, 24 hours resolution.

### Ideal for
My datasets are ideal for analysing candle shapes and types, candle patterns, volume fluctuations and for producing all kinds of studies based in those two (candles & volumes) Technical Analysis fundamentals, at multiple resolution levels.

### Details

| **Name** | **Type** | **Version** | **Release Date** | **Current dataSet** |
|----------|----------|----------|----------|----------|
| Olivia | Indicator | 1.0 | 28 Feb 2018 | dataSet.V1 |

# My Products

## Dataset 1: Daily Candles in Resolutions Below 1 hour

### Current Dataset Scope
* **Exchanges**: Poloniex
* **Markets**: USDT-BTC
* **Range**: Market Start Date – Current Time (-0 to 59 secs)

### Current Dataset
* **Version:** dataSet.V1
* **Update Frequency**: 1 minute
* **Cloud Output Location:** AAMasters > AAOlivia.1.0 > AACloud.1.1 > ExchangeName > dataSet.V1
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
  * [[10194.64038378,10308.25665115,10261.25665108,10236.90000135,1517443200000,1517443799999],[10236.90000135,10300.680924,10236.90000229,10288.10043292,1517443800000,1517444399999], ... ,[10288.10043292,10367.78412393,10288.10043293,10309.00000025,1517444400000,1517444999999],[10201.97490283,10367.78412393,10309.00000025,10201.97490283,1517445000000,1517445599999]]

## Dataset 2: All-time, Market-long Candles in Resolutions Between 1 and 24 Hours

### Current Dataset Scope
* **Exchanges**: Poloniex
* **Markets**: USDT-BTC
* **Range**: Market Start Date – Current Time (-0 to 59 mins)

### Current Dataset
* **Version:** dataSet.V1
* **Update Frequency**: 1 hour
* **Cloud Output Location:** AAMasters > AAOlivia.1.0 > AACloud.1.1 > ExchangeName > dataSet.V1
* **Folder Structure Tree**: Output > Candles > Multi-Period-Market > (01-hs| 02-hs | 03-hs | 04-hs | 06-hs | 08-hs | 12-hs | 24-hs)
* **Files Structure**: One .json file stored at the deepest level of the Folder Tree Structure
* **In-File Record Structure**:
  * Minimum, decimal;
  * Maximum, decimal;
  * Open, decimal;
  * Close, decimal;
  * Begin, decimal;
  * End, decimal;
* **In-File Record Example**: 
  * [[10194.64038378,10308.25665115,10261.25665108,10236.90000135,1517443200000,1517443799999],[10236.90000135,10300.680924,10236.90000229,10288.10043292,1517443800000,1517444399999], ... ,[10288.10043292,10367.78412393,10288.10043293,10309.00000025,1517444400000,1517444999999],[10201.97490283,10367.78412393,10309.00000025,10201.97490283,1517445000000,1517445599999]]

## Dataset 3: Daily Volumes in Resolutions Below 1 hour

### Current Dataset Scope
* **Exchanges**: Poloniex
* **Markets**: USDT-BTC
* **Range**: Market Start Date – Current Time (-0 to 59 secs)

### Current Dataset
* **Version:** dataSet.V1
* **Update Frequency**: 1 minute
* **Cloud Output Location:** AAMasters > AAOlivia.1.0 > AACloud.1.1 > ExchangeName > dataSet.V1
* **Folder Structure Tree**: Output > Volumes > Multi-Period-Daily >  (01-min | 02-min | 03-min | 04-min | 05-min | 10-min | 15-min | 20-min | 30-min | 45-min) > Year > Month > Day > Hour > Minute
* **Files Structure**: One .json file stored at the Minute level of the Folder Tree Structure
* **In-File Record Structure**:
  * Buy Volume, decimal;
  * Sell Volume, decimal;
  * Open Volume, decimal;
  * Close Volume, decimal
* **In-File Record Example**: 
  * [[33271.902671610005,13940.15380426,1514764800000,1514764859999],[15312.391007760001,18734.01756361,1514764860000,1514764919999], ... ,[16261.87486184,2788.53802902,1514764920000,1514764979999],[513.24710259,9896.328325810004,1514764980000,1514765039999]]

## Dataset 4: All-time, Market-long Volumes in Resolutions Between 1 and 24 Hours

### Current Dataset Scope
* **Exchanges**: Poloniex
* **Markets**: USDT-BTC
* **Range**: Market Start Date – Current Time (-0 to 59 mins)

### Current Dataset
* **Version:** dataSet.V1
* **Update Frequency**: 1 hour
* **Cloud Output Location:** AAMasters > AAOlivia.1.0 > AACloud.1.1 > ExchangeName > dataSet.V1
* **Folder Structure Tree**: Output > Volumes > Multi-Period-Market > (01-hs| 02-hs | 03-hs | 04-hs | 06-hs | 08-hs | 12-hs | 24-hs) >
* **Files Structure**: One .json file stored at the deepest level of the Folder Tree Structure
* **In-File Record Structure**:
  * Buy Volume, decimal;
  * Sell Volume, decimal;
  * Open Volume, decimal;
  * Close Volume, decimal
* **In-File Record Example**: 
  * [[33271.902671610005,13940.15380426,1514764800000,1514764859999],[15312.391007760001,18734.01756361,1514764860000,1514764919999], ... ,[16261.87486184,2788.53802902,1514764920000,1514764979999],[513.24710259,9896.328325810004,1514764980000,1514765039999]]

### Compatible Plotters
[AAMasters Plotters-Candles-Volumes](https://github.com/AAMasters/Plotters-Candles-Volumes)

### Dependencies
[AAMasters Charly](https://github.com/AAMasters/AACharly-Extraction-Bot)
[AAMasters Bruce](https://github.com/AAMasters/AABruce-Indicator-Bot)

### Data as a Service (DaaS) Fees
No fees.

# Disclaimer

THE AA MASTERS BOTS AND THEIR ASSOCIATED PRODUCTS AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, SUITABILITY FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

IN NO EVENT WILL ADVANCED ALGOS BE LIABLE TO ANY PARTY FOR ANY DIRECT, INDIRECT, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES FOR ANY USE OF THE AACLOUD, THE AA ARENA COMPETITION, THE AA MASTERS BOTS, OR ANY OTHER ASSOCIATED SERVICE OR WEB SITE, INCLUDING, WITHOUT LIMITATION, ANY LOST PROFITS, BUSINESS INTERRUPTION, LOSS OF FUNDS, PROGRAMS OR OTHER DATA OR OTHERWISE, EVEN IF WE ARE EXPRESSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
