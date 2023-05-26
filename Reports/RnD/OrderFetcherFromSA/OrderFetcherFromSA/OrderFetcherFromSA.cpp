// OrderFetcherFromSA.cpp : Defines the entry point for the application.
//

#include "OrderFetcherFromSA.h"

#include <filesystem>
#include <iostream>
#include <fstream>
#include <map>
#include <ctime>
#include "nlohmann/json.hpp"
#include "cxxopts/include/cxxopts.hpp"


using namespace std;
using namespace filesystem;
using json = nlohmann::json;

cxxopts::Options options("OrderFetcherFromSA", "Program to fetch Order information in the style of Binance's Order Export");

cxxopts::ParseResult result;

map<string, string, function<bool(string,string)>> 
orderMap([](const string& lhs, const string& rhs)
{
    return lhs > rhs;
}                                                 );

bool debug = 0;

void myDailyLoop( string path1, string stPair, string stBuySell)
{
    stringstream  line;
    ifstream input(path1);

    json     data;


    input >> data;

    // Print the contents of the JSON object
    if( debug )
      cout << "JSON object:" << endl << data.dump(4) << endl;

    if (debug)
        cout << endl;

    time_t unix_time;
    struct tm* timeinfo;
    char buffer[80];
    string key;
    string field;

    for (int count = 0; count < data.size(); count++)
    {
        // Unix timestamp (in seconds)
        unix_time = data[count][4]; // milliseconds
        unix_time /= 1000;

        // Convert Unix timestamp to struct tm
        timeinfo = localtime(&unix_time);

        // Format time as string
        strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", timeinfo);

        if (debug)
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

        key= to_string(data[count][0]);

        orderMap[key]= line.str();
    }
} // myDailyLoop

void orderTypeLoop( string path1, string stPair, string stBuySell )
{
    string  stYear;
    string  stMonth;
    string  stDay;


    // Get Year
    for (auto& entry : directory_iterator(path1))
    {
        // Got Year
        stYear = entry.path().filename().string();

        if (debug)
            cout << "Got Year: " << stYear << endl;

        break;
    }

    path1 += "/";
    path1 += stYear;

    int month = 0;
    if (result.count("month"))
        month = result["month"].as<int>();
    bool foundMonth= false;

    // Get Month
    for (auto& entry : directory_iterator(path1))
    {
        // Got Month
        stMonth = entry.path().filename().string();

        if (debug)
            cout << "Got Month: " << stMonth << endl;

        if (month )
            if (month == atoi(stMonth.c_str()))
            {
                // Yey
                foundMonth = true;
                break;
            }

        // TODO, add function so we can recurse months
    }

    if (!foundMonth && month)
    {
        // printf("Didn't find anything for supplied month\n");
        return;
    }

    path1 += "/";
    path1 += stMonth;

    string dayPath;

    // Get Day
    for (auto& entry : directory_iterator(path1))
    {
        // Got Day
        stDay = entry.path().filename().string();

        if (debug)
            cout << "Got Day: " << stDay << endl;

        dayPath = path1;

        dayPath += "/";
        dayPath += stDay;
        dayPath += "/Data.json";

        if (debug)
            cout << dayPath << endl;

        myDailyLoop(dayPath, stPair, stBuySell);
    }
} // orderTypeLoop

int main(int argc, char** argv)
{
    path path1 = "/Users/greg/Superalgos"; // Starting directory

    path1 += "/Platform/My-Data-Storage/Project/Algorithmic-Trading/Trading-Mine/Masters/Low-Frequency";

    string  stExchange;
    string  stPair;
    string  stStrategy;


    // * Process program arguments
    options.add_options()
        ("e,exchange", "i.e. binance. * This is a mandatory argument *", cxxopts::value<string>())
        ("m,month", "Orders for specific month. i.e. 1 = Jan, 2 = Feb etc.", cxxopts::value<int>())
        ("h,help", "(This) basic usage help")
        ("d,debug", "Print long debug information")
        ;

    result = options.parse(argc, argv);

    if (argc == 1 || result.count("help") || !result.count("exchange") )
    {
        cout << options.help() << endl;
        return 0;
    }

    if (result.count("debug"))
        debug = 1;

    bool foundExchange= false;

    // Get Exchange
    for (auto& entry : directory_iterator(path1))
    {
        // Got exchange
        stExchange = entry.path().filename().string();

        if (debug)
            cout << "Got Exchange: " << stExchange << endl;

        if (stExchange == result["exchange"].as<string>())
        {
            foundExchange = true;
            // Good, go with requested exchange
            break;
        }
    }

    if (!foundExchange)
    {
        printf("Didn't find that exchange\n");
        return 0;
    }

    path1 += "/";
    path1 += stExchange;

    // Get Pair
    for (auto& entry : directory_iterator(path1))
    {
        // Got Pair
        stPair = entry.path().filename().string();

        if (debug)
            cout << "Got Pair: " << stPair << endl;

        break;
    }

    path1 += "/";
    path1 += stPair;

    path1 += "/Output";

    // Get Strategy
    for (auto& entry : directory_iterator(path1))
    {
        // Got Strategy
        stStrategy = entry.path().filename().string();

        if (debug)
            cout << "Got Strategy: " << stStrategy << endl;

        break;
    }

    path1 += "/";
    path1 += stStrategy;


    string pathToOrderType;

    // First looking at Market Buy Orders
    pathToOrderType= path1.string();
    pathToOrderType += "/Market-Buy-Orders/Multi-Time-Frame-Daily/01-min";
    orderTypeLoop(pathToOrderType, stPair, "BUY");

    // Then Market Sell Orders
    pathToOrderType = path1.string();
    pathToOrderType += "/Market-Sell-Orders/Multi-Time-Frame-Daily/01-min";
    orderTypeLoop(pathToOrderType, stPair, "SELL");

    // Then Limit Buy Orders
    pathToOrderType = path1.string();
    pathToOrderType += "/Limit-Buy-Orders/Multi-Time-Frame-Daily/01-min";
    orderTypeLoop(pathToOrderType, stPair, "BUY");

    // Then Limit Sell Orders
    pathToOrderType = path1.string();
    pathToOrderType += "/Limit-Sell-Orders/Multi-Time-Frame-Daily/01-min";
    orderTypeLoop(pathToOrderType, stPair, "SELL");


    // Print Results

    cout << "Date(UTC),OrderNo,Pair,Type,Order Price,Order Amount,AvgTrading Price,Filled,Total,status" << endl;

    for (const auto& [key, value] : orderMap)
        std::cout << value << endl;

    return 1;
} // main