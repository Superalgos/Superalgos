# Superalgos Platform

The Superalgos Platform provides a visual environment for developing, testing and automating crypto-trading strategies as well as processing markets data and building indicators.

![Illustration](https://user-images.githubusercontent.com/13994516/63528460-4550ae80-c503-11e9-8db6-22995e0b9c16.gif)

## Testing Exchanges

The version in development opens up the door to working with multiple exchanges and multiple markets. For your reference, this is a quick report on the progress of our tests:

| Exchange | Historic Data Capability [*] | Trading Capability [**] |
| :--- | :---: | :---: | 
| Binance | &#x2611; | &#x2611; |
| Bitfinex | &#x2611; | &#x2610; |
| Bitmex | &#x2611; | &#x2610; |
| HitBTC | &#x2610; | &#x2610; |
| Kraken | &#x2611; | &#x2610; |
| Poloniex | &#x2610; | &#x2610; |

[*] The ability to fetch historic data for backtesting purposes has been verified.

[**] The ability to run strategies in live-trading mode has been verified.

## Documentation

The [Users Manual](https://github.com/Superalgos/Platform/wiki) in this repository's wiki features the documentation corresponding to the latest release.

A [new documentation site](https://superalgos.github.io/Documentation/) is in the making. Bear in mind the new version of the documentation is undergoing a massive restructuring, therefore, it is incomplete and should be complemented with the current User Manual.

## Codebase and Development Environment

To build each release, the Superalgos Platform used to draw code from several repositories within the Superalgos Github organization, as well as from organizations belonging to Teams. This has changed.

The ```develop``` branch in this repository now features the latest codebase and development environment.  

The codebase is distributed with the platform's release, and constitutes a fully functional development environment right out of the package. The platform runs uncompilled on the actual code (```node run``` from the root folder).

> If you are testing the version in development, you need to use the workspace in the root directory. Workspaces of older versions do not work in the new one.

## Contributing

We'd love you to join us in the Dev Team. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for the details on how to engage with it.

## License

The Superalgos Desktop App is open-source software released under [Apache License 2.0](LICENSE).
