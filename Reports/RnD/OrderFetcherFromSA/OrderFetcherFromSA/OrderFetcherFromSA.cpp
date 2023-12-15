// OrderFetcherFromSA.cpp : Defines the entry point for the application.
//

#include "OrderFetcherFromSA.h"

#include <filesystem>
#include <iostream>
#include <fstream>
#include <cstdlib>
#include <map>
#include <ctime>
#include "nlohmann/json.hpp"
#include "cxxopts/include/cxxopts.hpp"


using namespace std;
using namespace filesystem;
using json = nlohmann::json;

cxxopts::Options options("OrderFetcherFromSA", "Program to fetch Order information in the style of Binance's Order Export\n");

cxxopts::ParseResult result;

map< string, string, function< bool(string,string) > > 
orderMap( [](const string& lhs, const string& rhs)
    {
        return lhs > rhs;
    }
);

bool debug = false;   // Debug option/argument has been specified on command line
bool explore = false; // Explore option has been specified on command line

int myDailyLoop( string myPath, string stPair, string stBuySell, bool fullProcess )
{
    stringstream  line;
    ifstream input(myPath);

    json     data;
    int      count;
    int      validOrderCount = 0;

    input >> data;

    // Print the contents of the JSON object
    if (debug)
    {
        cout << "JSON object:" << endl << data.dump(4) << endl
            << endl;
    }

    time_t unix_time;
    struct tm* timeinfo;
    char buffer[80];
    string key;
    string field;

    for (count = 0; count < data.size(); count++)
    {
        if (data[count][6] == "Filled")
            validOrderCount++;
        else
            continue;

        // Unix timestamp (in seconds)
        unix_time = data[count][4]; // milliseconds
        unix_time /= 1000;

        // Convert Unix timestamp to struct tm
        timeinfo = localtime(&unix_time);

        // Format time as string
        strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", timeinfo);

        if (debug)
        {
            cout << buffer << ", "           // Date/Time
                << data[count][0] << ", "   // OrderNo
                << stPair << ", "           // Pair
                << stBuySell << ", "        // Type
                << 0 << ", "                // Order Price
                //<< std::setprecision(8)
                << data[count][21] << ", "  // Order Amount
                << data[count][13] << ", "  // AvgTrading Price
                << data[count][25] << ", "  // Filled
                << data[count][26] << ", "  // Total
                << data[count][6]           // status
                << endl;
        }

        if (fullProcess)
        {
            line.str("");
            line << buffer << ", ";         // Date/Time
            field = data[count][0];
            field.erase(remove(field.begin(), field.end(), '\"'), field.end());  // Strips quotes from string
            line << field << ", "            // OrderNo
                << stPair << ","            // Pair
                << stBuySell << ", "        // Type
                << 0 << ", "                // Order Price
                //<< std::setprecision(8)
                << data[count][21] << ", "  // Order Amount
                << data[count][13] << ", "  // AvgTrading Price
                << data[count][25] << ", "  // Filled
                << data[count][26] << ",";  // Total
            field = data[count][6];
            field.erase(remove(field.begin(), field.end(), '\"'), field.end());  // Strips quotes from string
            line << field;                   // status

            key = to_string(data[count][3]);

            orderMap[key] = line.str();
        }
    }

    return validOrderCount;
} // myDailyLoop

void yearLoop( string myPath, string stYear, string stPair, string stBuySell, bool lastOrderType )
{
    string  stMonth;
    string  stDay;
    string  path2;


    myPath += "/";
    myPath += stYear;

    int  month      = 0;
    bool foundMonth = false;


    if (result.count("month"))
        month = result["month"].as<int>();

    // Get Month
    for (auto& entry : directory_iterator(myPath))
    {
        // Got Month
        stMonth = entry.path().filename().string();

        if (month)
        {
            if (month == atoi(stMonth.c_str()))
            {
                // Yey
                foundMonth = true;
            }
            else
                continue;
        }

        if ((month && foundMonth) || !month)
        {
            // good
        }
        else
        {
            // Not interested
            continue;
        }


        if (debug)
            cout << "Got Month: " << stMonth << endl;
        else if (explore)
        {
            cout << "         ";

            if (lastOrderType)
                cout << " ";
            else
                cout << '|';

            cout << "     ";

            cout << (char)192 << " Month : " << stMonth << endl;
        }


        path2 = myPath;

        path2 += "/";
        path2 += stMonth;

        string dayPath;

        if (explore)
        {
            cout << "         ";

            if (lastOrderType)
                cout << " ";
            else
                cout << '|';

            cout << "        ";
            cout << (char)192 << " Day:Orders ";
        }

        // Get Day
        for (auto& entry : directory_iterator(path2))
        {
            static int numOrders;

            // Got Day
            stDay = entry.path().filename().string();

            if (debug)
                cout << "Got Day: " << stDay << endl;

            dayPath = path2;

            dayPath += "/";
            dayPath += stDay;
            dayPath += "/Data.json";

            if (debug)
                cout << dayPath << endl;

            numOrders = myDailyLoop(dayPath, stPair, stBuySell, true);

            if (explore && numOrders )
            {
                cout << stDay << ":" << numOrders << ", ";
            }
        }

        if( debug || explore )
            cout << endl;
    }
}

void orderTypeLoop( bool lastOrderType, string myPath, string stPair, string stBuySell )
{
    string  stYear;


    // Get Year
    for (auto& entry : directory_iterator(myPath))
    {
        // Got Year
        stYear = entry.path().filename().string();

        if (debug)
            cout << "Got Year: " << stYear << endl;
        else if (explore)
        {
            cout << "         ";

            if (lastOrderType)
                cout << " ";
            else
                cout << '|';

            cout << "  ";

            cout << (char)192 << " Year: " << stYear << endl;
        }

        yearLoop( myPath , stYear, stPair, stBuySell, lastOrderType );
    }
} // orderTypeLoop

void strategyLoop( string myPath, string stStrategy, string stPair )
{
    myPath += "/";
    myPath += stStrategy;


    string pathToOrderType;

    // First looking at Market Buy Orders
    pathToOrderType= myPath.c_str();
    pathToOrderType += "/Market-Buy-Orders/Multi-Time-Frame-Daily/01-min";
    if (explore)
        cout << "         " << (char)195 << " Order Type: Market Buy Orders" << endl;
    orderTypeLoop(false, pathToOrderType, stPair, "BUY");

    // Then Market Sell Orders
    pathToOrderType = myPath.c_str();
    pathToOrderType += "/Market-Sell-Orders/Multi-Time-Frame-Daily/01-min";
    if (explore)
        cout << "         " << (char)195 << " Order Type: Market Sell Orders" << endl;
    orderTypeLoop(false, pathToOrderType, stPair, "SELL");

    // Then Limit Buy Orders
    pathToOrderType = myPath.c_str();
    pathToOrderType += "/Limit-Buy-Orders/Multi-Time-Frame-Daily/01-min";
    if (explore)
        cout << "         " << (char)195 << " Order Type: Limit Buy Orders" << endl;
    orderTypeLoop(false, pathToOrderType, stPair, "BUY");

    // Then Limit Sell Orders
    pathToOrderType = myPath.c_str();
    pathToOrderType += "/Limit-Sell-Orders/Multi-Time-Frame-Daily/01-min";
    if (explore)
        cout << "         " << (char)192 << " Order Type: Limit Sell Orders" << endl;
    orderTypeLoop(true, pathToOrderType, stPair, "SELL");
} // strategyLoop

void pairLoop( path myPath, string stPair )
{
    string  stStrategy;

    myPath += "/";
    myPath += stPair;

    myPath += "/Output";

    // Get Strategy
    for (auto& entry : directory_iterator(myPath))
    {
        // Got Strategy
        stStrategy = entry.path().filename().string();

        if (debug)
            cout << "Got Strategy: " << stStrategy << endl;
        else if (explore)
            cout << "      " << (char)192 << " Strategy: " << stStrategy << endl;

        strategyLoop(myPath.string(), stStrategy, stPair);
    }
}

int main(int argc, char** argv)
{
    string  stringHomePath;
    path    myPath; 
    char*   pHomePath;

    string  stExchange;
    string  stPair;
    string  stStrategy;


    // * Process program arguments
    options.add_options()
        ("e,exchange", "i.e. binance. *** This is a mandatory argument ***", cxxopts::value<string>())
        ("p,path-to-SA-install", "This is the path up to the 'Superalgos' directory of your install.\nFor Windows users it might be something like '/Users/YourUserName'\n"
                                 "Careful when using '~' when trying to access your home directory and that you let the operating system expand it. i.e. don't put it in quotes", cxxopts::value<string>())
        ("m,month", "Orders for specific month. i.e. 1 = Jan, 2 = Feb etc.", cxxopts::value<int>())
        ("h,help", "(This) basic usage help")
        ("d,debug", "Print long debug information")
        ("x,explore", "Tree view of available data")
        ;

    result = options.parse(argc, argv);

    if (argc == 1 || result.count("help") || !result.count("exchange") )
    {
        cout << endl << "Order Fetcher (direct) from Superalgos (logs)         Ver: " << version << endl << endl;
        cout << options.help() << endl;
        return 0;
    }

    if (result.count("debug"))
        debug = true;

    if (result.count("explore"))
    {
        debug = false;
        explore = true;
    }

    bool foundExchange= false;

    pHomePath= getenv("HOME");

    if (pHomePath)
        stringHomePath = pHomePath;

    if (result.count("path-to-SA-install"))
    {
        stringHomePath = result["path-to-SA-install"].as<string>();
    }

    if (stringHomePath.empty())
    {
        cout << endl << "Sorry, haven't been able to get a default starting path." << endl
             << "Try specifying one throught the '-p' argument." << endl;
        return(0);
    }

    myPath = stringHomePath;
    myPath += "/Superalgos";

    if (exists(myPath))
    {
        if (debug)
            cout << endl << "Found Path: " << myPath << endl;
    }
    else
    {
        cout << endl << "Could not find Superalgos directory: " << myPath << endl;
        cout << "Perhaps the path to Superalgos isn't quite right?" << endl;
        return 0;
    }

    myPath += "/Platform/My-Data-Storage/Project/Algorithmic-Trading/Trading-Mine/Masters/Low-Frequency";

    if (explore)
    {
        cout << endl << "Starting Directory: " << myPath.string() << endl << endl;
    }

    string stTempExchange;
    if( debug || explore )
        cout << "Found Exchanges:" << endl;

    // Get Exchange
    for (auto& entry : directory_iterator(myPath))
    {
        // Got exchange
        stTempExchange = entry.path().filename().string();

        if (debug || explore)
        {
            cout << "   " << stTempExchange << endl;
        }

        if (stTempExchange == result["exchange"].as<string>())
        {
            // Good, go with requested exchange
            foundExchange = true;
            stExchange = stTempExchange;
        }
    }

    if( ( debug || explore ) && foundExchange )
    {
        cout << endl << stExchange << endl;
    }
    else if( !foundExchange )
    {
        cout << "Didn't find that exchange" << endl;
        return 0;
    }

    myPath += "/";
    myPath += stExchange;

    // Get Pair
    for (auto& entry : directory_iterator(myPath))
    {
        // Got Pair
        stPair = entry.path().filename().string();

        if (debug)
            cout << "Got Pair: " << stPair << endl;
        else if (explore)
            cout << "   " << (char)192 << " Pair: " << stPair << endl;

        pairLoop( myPath, stPair );
    }

    // Print Results

    if (!explore)
    {
        cout << "Date(UTC),OrderNo,Pair,Type,Order Price,Order Amount,AvgTrading Price,Filled,Total,status" << endl;

        for (const auto& [key, value] : orderMap)
            cout << value << endl;
    }

    return 1;
} // main