# Trade Analysis
Starting with the pair BTC / USDT on the Binance Exchange, this program sets out to add additional information to the basic trade log provided by exchanges. Information like Profit and Wallet balances.

Current Version: 0.8.1
## Installation
TradeAnalysis is now paired with the work done by Alex White, "Trade Fetcher", to allow quick and easy downloading of trade/order data.
### Linux version (Raspberry Pi)
These instructions are assuming Superalgos is installed off your home directory '~', please change if your install is in a different location.

If not already installed, install cmake:
```
sudo apt update
sudo apt install cmake
```
Build TradeAnalysis
```
cd ~/Superalgos/Reports/RnD/TradeAnalysis/TradeAnalysis
cmake .
make
```
Prepare your signing file.
Make a copy and rename the tradeFetcherSecretExample.json file and at the same time move this to your Superalgos secrets directory
```
cp  ~/Superalgos/Reports/TradeFetcher/tradeFetcherSecretExample.json ~/Superalgos/My-Secrets/tradeFetcherSecret.json
```
Edit this file and fill in your Binance API key information

Make the DoReport.sh shell script executable
```
chmod +x ~/Superalgos/Reports/RnD/TradeAnalysis/My-Trade-Reports/DoReport.sh
```
Create a directory under ~/Superalgos/Reports/RnD/TradeAnalysis/My-Trade-Reports for the current month, i.e.
```
mkdir ~/Superalgos/Reports/RnD/TradeAnalysis/My-Trade-Reports/2023-01
```
You can now run the example shell script to fetch and generate your report.
```
cd ~/Superalgos/Reports/RnD/TradeAnalysis/My-Trade-Reports/2023-01
../DoReport.sh
```
Note, it may take a minute to fetch your trade data.

Done! You may now load the report .csv file into your spreadsheet program. Take a minute to format the data, starting with allowing wrapping in the header cells.

You may edit the DoReport.sh (or make different versions) to create different reports.
Further information on Trade Fetcher is in Alex's area:
~/Superalgos/Reports/TradeFetcher

### Pure Windows installation (without Superalgos installed)
See the link:
https://github.com/BigGremlin/TradeAnalysis_Releases
for Windows Binaries and instructions.


## Notes on using Trade Analysis
Simply type TradeAnalysis (from the executable directory ~/Superalgos/Reports/RnD/TradeAnalysis) to get usage and version information.

```
TradeAnalysis

Trade Analysis Ver. 0.8.1
Usage:
  TradeAnalysis filename.csv BTC_Ballance USDT_Ballance -s

  -s To print summary only
```

If you don't know (or care) about your starting ballances, simply enter zero '0' for the BTC and USDT ballance information. This will generate 'simple' reports where the 'Complex Spot Profit (%)' column is not produced.

Basically, the 'Simple Spot Profit (%)' column is a calculation purely on changes in USDT.
Where as the 'Complex Spot Profit (%)' column takes into consideration fluctuations in the price of BTC you hold during trades.

## General

TradeAnalysis is written in C++ and has been developed with Visual Studio. I used a cmake project so it should compile under any environment that Superalgos can be installed.

I've created it out of my own needs/wants but I can see it morphing into the Superalgos Social Trading App as a report or even live view.

## Latest Changes
(v 0.8.1)
- Added the ability to run the program without accurate starting balances (Simple Mode)
- Added simple and complex % Profit
- Added some resiliance to missing Sell trades (caused by manually/accidently stopping trades)
- Other bug fixes
