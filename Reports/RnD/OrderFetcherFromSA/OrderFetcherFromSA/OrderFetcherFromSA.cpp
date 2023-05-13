// OrderFetcherFromSA.cpp : Defines the entry point for the application.
//

#include "OrderFetcherFromSA.h"

#include <filesystem>
#include <iostream>
#include <fstream>
#include <ctime>
#include "nlohmann/json.hpp"


using namespace std;
using namespace filesystem;
using json = nlohmann::json;


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

int main()
{
    path path1 = "/Users/greg/Superalgos"; // Starting directory

    path1 += "/Platform/My-Data-Storage/Project/Algorithmic-Trading/Trading-Mine/Masters/Low-Frequency";

    string  stExchange;
    string  stPair;
    string  stStrategy;
    string  stYear;
    string  stMonth;
    string  stDay;


    // path path2;

    // TraverseDirectory(path, 0);

    // Look for "Platform" directory

//    directory_iterator      it;
//    const directory_entry&  entry= *it;
//
//    for ( it =  path1; it != directory_iterator(); ++it)
//    {
//        entry = *it;


    // Get Exchange
    for (auto& entry : directory_iterator(path1))
    {
        // Got exchange
        stExchange = entry.path().filename().string();

        cout << "Got Exchange: " << stExchange << endl;
        break;
    }

    path1 += "/";
    path1 += stExchange;

    // Get Pair
    for (auto& entry : directory_iterator(path1))
    {
        // Got Pair
        stPair = entry.path().filename().string();

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

        cout << "Got Strategy: " << stStrategy << endl;
        break;
    }

    path1 += "/";
    path1 += stStrategy;

    // First looking at Market Buy Orders
    path1 += "/Market-Buy-Orders/Multi-Time-Frame-Daily/01-min";

    // Get Year
    for (auto& entry : directory_iterator(path1))
    {
        // Got Year
        stYear = entry.path().filename().string();

        cout << "Got Year: " << stYear << endl;
        break;
    }

    path1 += "/";
    path1 += stYear;

    // Get Month
    for (auto& entry : directory_iterator(path1))
    {
        // Got Month
        stMonth = entry.path().filename().string();

        cout << "Got Month: " << stMonth << endl;
        break;
    }

    path1 += "/";
    path1 += stMonth;

    // Get Day
    for (auto& entry : directory_iterator(path1))
    {
        // Got Day
        stDay = entry.path().filename().string();

        cout << "Got Day: " << stDay << endl;
        break;
    }

    path1 += "/";
    path1 += stDay;

    path1 += "/Data.json";

    ifstream input(path1);

    json data;

    input >> data;

    // Print the contents of the JSON object
    cout << "JSON object:" << endl << data.dump(4) << endl;

    cout << endl;

    time_t unix_time;
    struct tm* timeinfo;
    char buffer[80];

    for (int count = 0; count < data.size(); count++)
    {
        // Unix timestamp (in seconds)
        unix_time = data[count][4]; // milliseconds
        unix_time /= 1000;

        // Convert Unix timestamp to struct tm
        timeinfo = localtime(&unix_time);

        // Format time as string
        //strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", timeinfo);
        strftime(buffer, sizeof(buffer), "%d/%m/%Y %H:%M:%S", timeinfo);

        cout << buffer << ", "  // Date/Time
            << data[count][0] << ", "  // OrderNo
            << stPair << ", "  // Pair
            << "BUY" << ", "  // Type
            << 0 << ", "  // Order Price
            //<< std::setprecision(8)
            << data[count][21] << ", "  // Order Amount
            << data[count][13] << ", "  // AvgTrading Price
            << data[count][25] << ", "  // Filled
            << data[count][26] << ", "  // Total
            << data[count][6]           // status
            << endl;
    }

    return 1;
}



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