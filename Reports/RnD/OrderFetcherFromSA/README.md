# Order Fetcher From SA
Ver 0.4 <br>

This program is designed to run in (but doesn't strictly have to) the Superalgos (SA) environment and fetch order data direct from SA's logs. It also formats the data to the same format as Binance's "Order Export" format. This is to allow other programs and services (like Trade Analysis) to produce reports and further analyis on your Order / Trade information.
## Installation
### Linux version (Raspberry Pi)
If not already installed, install cmake:
```
sudo apt update
sudo apt install cmake
```
Build OrderFetcherFromSA
```
cd ~/Superalgos/Reports/RnD/OrderFetcherFromSA/OrderFetcherFromSA
cmake .
make
```
### Other Operating Systems
This is a C++, CMake project which is supported by most operating systems and where a simple development environment can be setup.
#### Windows version
I develop and maintain these programs on Windows computers using Microsoft Visual Studio, Community Edition.
## Usage
```
  OrderFetcherFromSA [OPTION...]

  -e, --exchange arg  i.e. binance. * This is a mandatory argument *
  -m, --month arg     Orders for specific month. i.e. 1 = Jan, 2 = Feb etc.
  -h, --help          Basic usage help
  -d, --debug         Print long debug information
```
## Examples
```
OrderFetcherFromSA -e binance -m 10
```
This fetches Order data for the Binace Exchange for October and writes the information to the screen, for instant viewing.

```
OrderFetcherFromSA -e binance -m 10 > FetchedOrderData.csv
```
Same as above but the '>' symbol saves the data the file 'FetchedOrderData.csv'
## Credits
This program uses the libraries:
#### cxxopts
https://github.com/jarro2783/cxxopts
#### JSON for Modern C++
https://github.com/nlohmann/json
