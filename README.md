# Superalgos

Superalgos provides a toolbox with many integrated tools that could help you research crypto markets and design / automate trading strategies. You can use Superalgos to download market data from crypto exchanges, make arbitrary calculations with it (including indicators), plot the results of your calculations, design, test and automate trading strategies, and more. You can do any of the above individually or alltogether plus reuse all information gathered and generated (standarized in multiple time frames, stored at text files by exchange/market) as an input for your own software / systems. Superalgos runs at your computer, it is free and open source.  

![Superalgos video capture (16)](https://user-images.githubusercontent.com/9479367/77251218-76d25980-6c4d-11ea-8e47-be7db2e8abdb.gif)

## Documentation

Please refer to the [documentation site](https://docs.superalgos.org/).

## Exchange Testing Queue

The current version opens up the door to working with multiple exchanges and multiple markets. For your reference, this is a quick report on the progress of our tests:

| Exchange | Historic OHLCVs Capability [*] | Trading Capability [**] | Comments |
| :--- | :---: | :---: |  :---: | 
| Binance | &#x2611; | &#x2611; | Fully tested. Market history from Sep 2017. |
| Bitfinex | &#x2611; | &#x2611; | Fully tested. Expect 1 year max of market history. |
| Bitmex | &#x2611; | &#x2610; | We need to implement the concept of Contracts within the system in order to be able to test trading capabilities. |
| HitBTC | &#x2610; | &#x2610; | Not tested yet. |
| Kraken | &#x2610;  | &#x2610; | Historical data only accessed by id (not by date). Live trading not tested yet. |
| Poloniex | &#x2610; | &#x2610; | At the moment we can not retrieve OHLCVs from Poloniex because we require 1 minute time frame while Poloniex only offers 5 minutes and above. |
| Bittrex | &#x2611; | &#x2610; | Only 6 Months of historical data is provided. Live trading not tested yet. |
| Gemini | &#x2611; | &#x2610; | Only a few hours of historical data is provided. Live trading not tested yet. |

[*] The ability to fetch historic data for backtesting purposes has been verified.

[**] The ability to run strategies in live-trading mode has been verified.

## Contributing

We'd love you to join us in the Dev Team. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for the details on how to engage with it.

## License

The Superalgos Desktop App is open-source software released under [Apache License 2.0](LICENSE).
