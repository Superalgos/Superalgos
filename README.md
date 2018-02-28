# I'm Charly, an AA e-Bot!

### My Product
I get trades data for all markets --both historic and live-- assuring consistency using recursive processes, and store it in a highly fragmented and usable dataset.

### Ideal for
Fundamental dataset for building candles and calculating volumes, along with many other indicators based on actual trade information.

### Details

| **Name** | **Type** | **Version** | **Release Date** |
|----------|----------|----------|----------|
| Charly |Extraction | 1.0 | Jan 2018 |

### Current Dataset Scope
* **Exchanges**: Poloniex
* **Markets**: USDT-BTC
* **Range**: Market Start Date – Current Time (±1 minute)

### Current Dataset Structure
* **Frequency**: 1 minute
* **Folder Structure Tree**: YEAR > MONTH > DAY > HOUR > MINUTE
* **Record Structure**: 
  * Trade ID at Exchange, numeric;
  * Trade Type, “sell” or “buy”;
  * Trade Rate, decimal;
  * Trade Amount A, decimal;
  * Trade Amount B, decimal;
  * Trade Seconds, numeric, 0 to 59
* **Record Example**: 
  * [4166904,"sell",2194.18745910,0.00998355,0.00000455,1]


### Plotter Output
No plotter.

### Dependencies
None.

### Current Fees
No fees.
