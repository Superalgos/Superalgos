# Trader Fetcher

This is a simple script initially buit to pull trade history from Binance but it does use the ccxt SDK so it can theoretically pull from any exchange that follows the same rules.

## Execution

The script has 3 required parameters:

- --exchange or -e
- --key-file, --keyFile or -f
- --trades or --orders only one can be selected depending on whether you want the trade history or order history

and 2 optional parameters

- --out-file, --outFile or -o
- --last-month or --lastMonth

Here some run options for running the script:

```sh
# generated data for current month trades with results output to the command line
node index --exchange binance --key-file <PATH_TO_EXCHANGE_KEY_FILE> --trades
# generated data for current month orders with results output to the command line
node index --exchange binance --key-file <PATH_TO_EXCHANGE_KEY_FILE> --orders

# generated data for current month traders with output writen to the provided outfile -> this file will be created or overwritten
node index --exchange binance --key-file <PATH_TO_EXCHANGE_KEY_FILE> --out-file <PATH_TO_OUTPUT_FILE> --trades
# generated data for current month orders with output writen to the provided outfile -> this file will be created or overwritten
node index --exchange binance --key-file <PATH_TO_EXCHANGE_KEY_FILE> --out-file <PATH_TO_OUTPUT_FILE> --orders

# generated data for the previous month traders with results output to the command line
node index --exchange binance --key-file <PATH_TO_EXCHANGE_KEY_FILE> --last-month --trades
# generated data for the previous month orders with results output to the command line
node index --exchange binance --key-file <PATH_TO_EXCHANGE_KEY_FILE> --last-month --orders

# generated data for the previous month trades with output writen to the provided outfile -> this file will be created or overwritten
node index --exchange binance --key-file <PATH_TO_EXCHANGE_KEY_FILE> --out-file <PATH_TO_OUTPUT_FILE> --last-month --trades
# generated data for the previous month orders with output writen to the provided outfile -> this file will be created or overwritten
node index --exchange binance --key-file <PATH_TO_EXCHANGE_KEY_FILE> --out-file <PATH_TO_OUTPUT_FILE> --last-month --orders
```

## Credentials key file

The API needs to have the credentials passed in as a JSON file in the correct format for your exchange. The suggested method for this is to store your keys in the My-Secrets folder in the root Superalgos directory. This folder is excluded from source control and you will not accidentally compromise your API  keys.

### Binance

```JSON
{
    "apiKey": "VALUE",
    "secret": "VALUE"
}
```

## Additional info

The script will iterate through each day of the month, requests often have limits to amount they return. AS this has initially be built for binance the soft limit is 500 items, if that limit is hit in a single request then the last order time from the batch is taken and used as a start time for that same day, this process iterates until all the items for that day are collected. When all the days are completed then the item list has duplicates removed, using the trade ID as the unique identifier. For different exchanges this will most likely need a new variation created and mapped to the exchange name.

Once the unqiue list of trades has been generated the data is then written in a csv format and either output to a file or the command line.

The currency pair is also hard coded to BTCUSDT, but this can be updated when required.
