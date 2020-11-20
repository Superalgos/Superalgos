# I'm Artudito, a t-bot!
AKA a trading algobot running on the AAPlatform by Advanced Algos Ltd.

### My Specialty
I work on the USDT-BTC market with a strategy based on linear regression curves.

### Ideal for
Trading short-lived but established trends.

### Details

| **Name** | **Type** | **Version** | **Release Date** | **Current dataSet** |
|----------|----------|----------|----------|----------|
| Artudito |Trading | 1.0 | May 2018 | dataSet.V1 |

# My Strategy

### Markets
* **Exchanges**: Poloniex
* **Markets**: USDT-BTC

### Description

I use the analysis performed by [AAMasters Gauss i-bot](https://github.com/AAMasters/AAGauss-Indicator-Bot) on recent historic prices in which he applies a [linear regression]( https://en.wikipedia.org/wiki/Linear_regression) to a set of price values in the 15, 30 and 60 minutes candles to obtain model linear regression curves. Based on those curves, I apply my own ruleset.

#### Basic Rule Set

* If the tilt of the linear regression curve points up on the 15, 30, and 60 minutes scale then I go long.
* If the tilt of the linear regression curve points down on the 15, 30, and 60 minutes scale then I go short.
* If the linear regression curve of the 15 and 30 minutes scale change direction, I exit.

#### Examples
* The asset is trending up on the 15, 30 and 60 minutes scale. Then the 15 minutes curve turns down and the 30 minutes curve goes flat: I exit.
* The asset is trending down on all three indicators. Then the 15 minutes curve turns up and the 30 minutes curve turns flat or upwards: I enter.
* The tilt of the 15, 30 and 60 minutes curves is flat: I don't enter or exit.

### Compatible Plotters
[AAMasters Plotters-Trading](https://github.com/AAMasters/Plotters-Trading)

### Dependencies
* [AAMasters Bruce](https://github.com/AAMasters/AABruce-Indicator-Bot)
* [AAMasters Olivia](https://github.com/AAMasters/AAOlivia-Indicator-Bot)
* [AAMasters Gauss](https://github.com/AAMasters/AAGauss-Indicator-Bot)

### Trading as a Service (TaaS) Fees
No fees.

# Disclaimer

THE AA MASTERS BOTS AND THEIR ASSOCIATED PRODUCTS AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, SUITABILITY FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

IN NO EVENT WILL ADVANCED ALGOS BE LIABLE TO ANY PARTY FOR ANY DIRECT, INDIRECT, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES FOR ANY USE OF THE AACLOUD, THE AA ARENA COMPETITION, THE AA MASTERS BOTS, OR ANY OTHER ASSOCIATED SERVICE OR WEB SITE, INCLUDING, WITHOUT LIMITATION, ANY LOST PROFITS, BUSINESS INTERRUPTION, LOSS OF FUNDS, PROGRAMS OR OTHER DATA OR OTHERWISE, EVEN IF WE ARE EXPRESSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
