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

cxxopts::Options options("OrderFetcherFromSA", "Program to fetch Binance, Order Export style information");

cxxopts::ParseResult result;

map<string, string, function<bool(string,string)>> 
orderMap([](const string& lhs, const string& rhs)
{
    return lhs > rhs;
}                                                 );

bool debug = 0;

// namespace fs = filesystem;

void TraverseDirectory(const path& path, int level)
{
    // Print directory name
    cout << string(level * 2, ' ') << "+- " << path.filename().string() << endl;

    // Recursively traverse subdirectories
    for (auto& entry : directory_iterator(path))
    {
        if (entry.is_directory())
        {
            TraverseDirectory(entry.path(), level + 1);
        }
        else
        {
            cout << string((level + 1) * 2, ' ') << "- " << entry.path().filename().string() << endl;
        }
    }
}

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
        //strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", timeinfo);
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

//        if( data[count][6] == "Filled" )
//        orderMap.insert({ key, line.str() });
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
        printf("Didn't find anything for supplied month\n");
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
        ("o,outfile", "Output file name", cxxopts::value<string>())
        ("m,month", "Orders for specific month. i.e. 1 = Jan, 2 = Feb etc.", cxxopts::value<int>())
        ("h,help", "Basic usage help")
        ("d,debug", "Print long debug information")
        ;

    // options.parse_positional({});

    // auto result = options.parse(argc, argv);
    result = options.parse(argc, argv);

    if (argc == 1 || result.count("help") || !result.count("exchange") )
    {
        cout << options.help() << endl;
        return 0;
    }

    if (result.count("debug"))
        debug = 1;

    // * End Process program arguments


    // path path2;

    // TraverseDirectory(path, 0);

    // Look for "Platform" directory

//    directory_iterator      it;
//    const directory_entry&  entry= *it;
//
//    for ( it =  path1; it != directory_iterator(); ++it)
//    {
//        entry = *it;


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



// if (entry.is_directory() &&
//     entry.path().filename().string() == "Platform")
// {
//     cout << "Found \"Platform\" directory" << endl;
// 
//     //            string gregsString;
//     //
//     //            gregsString = path1.string();
//     //
//     path2 = entry.path();
//     //
//                 // Look for "My-Data-Storage" directory
//     for (auto& entry2 : directory_iterator(path2))
//     {
//         if (entry2.is_directory() &&
//             entry2.path().filename().string() == "My-Data-Storage")
//         {
//             cout << "Found \"My-Data-Storage\" directory" << endl;
//         }
//     }
// }



//  int main()
//  {
//  	// path pwd = current_path();
//  	// path newPath;
//  	// 
//  	// cout << endl;
//  	// cout << endl;
//  	// cout << pwd.string() << endl;
//  	// cout << endl;
//  	// cout << endl;
//  	// 
//  	// 
//  	// recursive_directory_iterator dirIter(pwd.string());
//  	// 
//  	// // dirIter.pop();
//  	// 
//  	// newPath= dirIter->path();
//  	// 
//  	// cout << newPath.string() << endl;
//  
//  	
//  	//path pwd = current_path();
//  
//  
//  	//char filepath[] = pwd.string();
//  
//  	
//  	// Create object library
//  //	path library_path(current_path());
//  	path library_path( "/Users/greg/Superalgos" );
//  
//  	if ( is_directory(library_path) )
//  	{
//  		directory_iterator iter( library_path );
//  		directory_iterator end;
//  
//  		while ( iter != end )
//  		{
//  			if (is_directory(iter->path()))
//  			{
//  //				object_idx.push_back(images.size());
//  //				object_names.push_back(iter->path().filename().generic_string());
//  
//  				//std::cout << "Object: " <<  object_names.back() << " " << object_idx.back() << std::endl;
//  
//  				cout << iter->path() << endl;
//  
//  				if (iter->path() == "Platform")
//  				{
//  					// Found Platform Directory
//  					cout << "*** Found Platform Directory ***" << endl;
//  				}
//  // 				// Handle Symlink Directories
//  // 				if ( is_symlink( iter->path() ) )
//  // 				{
//  // //					iter = recursive_directory_iterator(canonical(read_symlink(iter->path()), library_path));
//  // 				}
//  			}
//  			else
//  			{
//  				// Initialize object feature
//  //				Mat img_object = imread(iter->path().generic_string(), CV_LOAD_IMAGE_COLOR);
//  
//  //				if (!img_object.data)
//  //				{
//  //					throw std::runtime_error("Error Reading Image");
//  //				}
//  //				ImageData img = processImage(img_object);
//  //				img.name = iter->path().stem().generic_string();
//  				//std::cout << "Object: " << object_names.back() << " Image: " << img.name << std::endl;
//  
//  //				if (img.name == object_names.back())
//  //				{
//  //					object_img_idx.push_back(images.size());
//  //					//std::cout << object_names.back() << " " << images.size() << std::endl;
//  //				}
//  //
//  //				//-- Step 3: Add to object library
//  //				images.push_back(std::move(img));
//  			}
//  			++iter;
//  		}
//  	}
//  
//  
//  
//  
//  	return 0;
//  }