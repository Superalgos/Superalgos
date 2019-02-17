# Files Component

The Files Component provides the functionality needed to load into the browser's memory data structures populated from plain text files grabbed from the cloud and optimized for different scenarios. Each of these scenarios are represented by a single js module as listed below.

Once the information is initially loaded, it is automatically updated as times goes by or as the users changes its position on the timeline, both on the time dimension as in the time period (1m, 2m, 3m, 4m, 5m, 10m, ..., 1 hour, 2 hours, ..., 24 hs) dimension. 

## Single File

As the name suggests, this is used to load a single file.

## File Sequence

This is a multi-file data structure in which is stored information of a sequence of files. Let's imagine that the App using this component needs to read File_1, File_2, File_3 and File_4, this data structure is capable of doing that.

## Market File

The system-wide concept of a Market File is defined as a file containing data corresponding to the whole market history. If the data were candles for instance, it would be containing all candles since the beginning on the market until the head of the market (the most recent information).

Since for each market there are multiple Market Files (one for 1 hour time period, one for 2 hours, 4 hours, 6, 8, 12 and 24 hs.) this data structure loads all of these files and have them readily available in memory for consumption.

## Daily Files

The system-wide concept of a Daily File is defined as a file containing data corresponding only to one single day. If the data were candles for instance, it would be containing all candles calculated from trades that happened in a single day only.

Since for each market there are multiple Daily Files (one for 1 min time period, one for 2 min, 3 min, 4, 5, 10, 15, 20, 30 and 45 minutes) this data structure loads all of these files and have them readily available in memory for consumption.

Moreover, it uses the concept of a File Cursor to load more files of the previous days and the following days in order to have them ready in memory if needed.
