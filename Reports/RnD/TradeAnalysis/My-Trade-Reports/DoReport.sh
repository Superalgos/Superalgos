node ~/Superalgos/Reports/TradeFetcher/index --orders --exchange binance --key-file ~/Superalgos/My-Secrets/tradeFetcherSecret.json --out-file tradeData.csv --last-month
~/Superalgos/Reports/RnD/TradeAnalysis/TradeAnalysis/TradeAnalysis tradeData.csv 0 0 > tradeReport.csv
