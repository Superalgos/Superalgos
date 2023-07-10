// TradeAnalysis.cpp : Defines the entry point for the application.
//

#include "TradeAnalysis.h"
#include "SummaryLine.h"
#include <iostream>
#include <fstream>
#include <filesystem>
#include <vector>
#include <iomanip>
#include "cxxopts/include/cxxopts.hpp"  // Command line arguments processing


using namespace filesystem;


bool gSimpleBallances; // User has entered 0, 0 for initial ballances, won't track Holding amounts very well
bool gIncTriggerCondition;
string ghtmlXGraph;
string ghtmlYGraph;
bool   gwantHtml= false;


cxxopts::Options options("TradeAnalysis", "Program to produce reports from your Binance style, order export information\n");
cxxopts::ParseResult result;


int main(int argc, char* argv[])
{
	path     myPath;
	ifstream tradeFile;
	string   token;
	char     myChar;
	bool     endOfFile   = false;
	bool     summaryOnly = false;
	int      charCount;
	int      tokenCount;
	int      itr;
	int      numDays;            // "Day Number"
	int      numTrades;          // "Trade Number"
	double       dayTotFees;     // "Fees (USD)" (Summary)
	double       startingTotWallet;
	double       dailyTotWallet; // "Daily Running Tot Profit (USDT)"
	tm           currentDay;     // "Day Number"
	SummaryLine  summaryLine;
	SummaryLine  ballanceSummaryLine;
	LineType     lineType = lineType_Unknown;
	vector<SummaryLine>  vectorSummaryLine;



	// * Process program arguments
	options.add_options()
		("CSV_InputFile", "The Binance style .csv file you want to process", cxxopts::value<string>())
		("BTC_Ballance", "Amount of BTC you initially have", cxxopts::value<double>())
		("USD_Ballance", "Amount of USD you initially have", cxxopts::value<double>())
		("s,summary", "Output daily summary only")
		("h,html", "Produce HTML file (with graph)")
		;

	options.parse_positional({ "CSV_InputFile", "BTC_Ballance", "USD_Ballance" });

	result = options.parse(argc, argv);

	options.positional_help("CSV_InputFile BTC_Ballance USD_Ballance");

	// if (result.count("CSV_InputFile"))
	// 	cout << result["CSV_InputFile"].as<string>() << endl;
	// 
	// options.show_positional_help();   // Doesn't appear to work

	if ( !result.count("CSV_InputFile") || !result.count("BTC_Ballance") || !result.count("USD_Ballance" ) )
	{
		cout << endl;
		cout << "Trade Analysis Ver. " << version << endl;
		cout << endl;
		cout << options.help() << endl
			<< "CSV_InputFile    The Binance style .csv file you want to process (mandatory argument)" << endl
			<< "BTC_Ballance     Amount of BTC you initially have                (mandatory argument, enter 0 if unknown)" << endl
			<< "USD_Ballance     Amount of USD you initially have                (mandatory argument, enter 0 if unknown)" << endl;

		return 0;
	}


	tradeFile.open(result["CSV_InputFile"].as<string>() );

	ballanceSummaryLine.orderAmount = result["BTC_Ballance"].as<double>();
	ballanceSummaryLine.total       = result["USD_Ballance"].as<double>();

	// Test double variables for zero
	if ( ( -0.00000001 < ballanceSummaryLine.orderAmount && ballanceSummaryLine.orderAmount < 0.00000001) &&
		 ( -0.00000001 < ballanceSummaryLine.total       &&	ballanceSummaryLine.total       < 0.00000001)    )
		gSimpleBallances = true;
	else
		gSimpleBallances = false;

	ballanceSummaryLine.type = buySell_buy;
	ballanceSummaryLine.ballanceLine = true;
	ballanceSummaryLine.calcBtcBallance();
	ballanceSummaryLine.calcUsdtBallance();

	if ( result.count("summary") )
	{
		summaryOnly= true;
	}

	if (result.count("html"))
	{
		gwantHtml = true;
	}

	cout.precision(11);

	if (!tradeFile.is_open())
	{
		cout << endl;
		cout << "Can't open input file" << endl;
		cout << endl;

		return(0);
	}

	// Set current day to a null day initially
	currentDay.tm_year = -1;
	currentDay.tm_mon = -1;
	currentDay.tm_mday = -1;

	if (summaryOnly)
		summaryLine.printSummaryHeader();
	else
		summaryLine.printHeader();

	gIncTriggerCondition = false;

	///////////////////////////////////////////////////////////////////
	// Begin Work
	///////////////////////////////////////////////////////////////////


	// File parsing loop
	while (true) // reading file
	{
		tokenCount = 1;
		while (true) // reading line
		{
			// Check for empty file
			if (tradeFile.eof())
			{
				endOfFile = true;
				break;
			}

			charCount = 0;
			while (true) // reading token
			{
				tradeFile >> noskipws >> myChar; // single character read

				// 1st line type determination
				if (tokenCount == 1 && charCount == 0)
				{
					// Determine line type by first character
					switch (myChar)
					{
					case 'D':
						lineType = lineType_Heading;
						break;
					case ',':
						lineType = lineType_TradePiece;
						break;
					case '2':
						lineType = lineType_Summary;
						// Reset summaryLine here (part order variables)
						summaryLine.feeBothEst = 0;
						break;
					default:
						lineType = lineType_Unknown;
					}
				}

				// Adjust line type to be more specific if line is part of an order
				if (tokenCount == 2 && charCount == 0 && lineType == lineType_TradePiece)
				{
					switch (myChar)
					{
					case '2':
						lineType = lineType_TradePiece_Piece;
						break;
					case 'D':
						lineType = lineType_TradePiece_Heading;
						break;
					}
				}

				if (lineType == lineType_Heading && tokenCount == 10 && charCount == 6)
					if (token == "Trigge")
						gIncTriggerCondition = true;
					else // Heading Column 10 is "status"
						tokenCount++;

				if (tradeFile.eof())
				{
					endOfFile = true;
					break;
				}
				else if (myChar == ',' || myChar == '\n' || myChar == '\r')
				{
					break;
				}
				else
				{
					charCount++;
					token += myChar;
				}
			}

			switch( lineType )
			{
				case lineType_Summary:
					summaryLine.feedToken(lineType_Summary, tokenCount, token);
					break;
				case lineType_TradePiece_Piece:
					summaryLine.feedToken(lineType_TradePiece_Piece, tokenCount, token);
					break;
			}

			token = "";
			tokenCount++;

			if (lineType != lineType_Heading && tokenCount == 10 && !gIncTriggerCondition)
				tokenCount++;

			if (tradeFile.eof())
			{
				endOfFile = true;
				break;
			}
			else if (myChar == '\n' || myChar == '\r')
			{
				break;
			}
		}

		switch (lineType)
		{
		    case lineType_Summary:
				vectorSummaryLine.push_back(summaryLine);
				break;
			case lineType_TradePiece_Piece:
				// Update last vectorSummaryLine summaryLine
				vectorSummaryLine[vectorSummaryLine.size() - 1].feeBothEst += summaryLine.feeBothEst;
				break;
		}

		if (endOfFile)
		{
			break;
		}
	}

	// Mark line at beginning of day and end of day
	// Set pointers to previous lines
	for (itr = vectorSummaryLine.size() - 1; itr >= 0; itr--)
	{
		// If first line
		if (itr == vectorSummaryLine.size() - 1)
		{
			vectorSummaryLine[itr].firstLineOfDay = true;
			vectorSummaryLine[itr].pprevLine = &ballanceSummaryLine;
		}
		else // all other lines
		{
			if (vectorSummaryLine[itr].dateTime.tm_mday != currentDay.tm_mday)
			{
				vectorSummaryLine[itr].firstLineOfDay = true;
				vectorSummaryLine[itr + 1].lastLineOfDay = true;
			}

			vectorSummaryLine[itr].pprevLine = &vectorSummaryLine[itr + 1];
		}

		currentDay = vectorSummaryLine[itr].dateTime;

		if (itr == 0)
			vectorSummaryLine[itr].lastLineOfDay = true;
	}

	// Output Loop
	for (itr = vectorSummaryLine.size() - 1; itr >= 0 ; itr--)
	{
		// If first Line
		if (itr == vectorSummaryLine.size() - 1)
		{
			vectorSummaryLine[itr].firstLine = true;

			vectorSummaryLine[itr].calcBtcBallance();
			vectorSummaryLine[itr].calcUsdtBallance();

			numDays = 1;
			numTrades = 0;
			dayTotFees = 0;

			startingTotWallet = vectorSummaryLine[itr].totBallances();
			dailyTotWallet    = vectorSummaryLine[itr].totBallances();

			if( !summaryOnly)
				ballanceSummaryLine.printSelf();
		}
		else
		{
			vectorSummaryLine[itr].calcBtcBallance();
			vectorSummaryLine[itr].calcUsdtBallance();
		}

		if (vectorSummaryLine[itr].type == buySell_sell)
			numTrades++;

		dayTotFees += vectorSummaryLine[itr].feeBothEst;

		// * Print majority of line
		if ( ( vectorSummaryLine[itr].lastLineOfDay ) || !summaryOnly )
		{
			if (summaryOnly)
			{
				vectorSummaryLine[itr].printSummarySelf();

				ghtmlXGraph += ", ";
				ghtmlYGraph += ", ";
			}
			else
			{
				vectorSummaryLine[itr].printSelf();

				ghtmlXGraph += ", ";
				ghtmlYGraph += ", ";
			}
		}

		// Print rest of line
		if (itr != vectorSummaryLine.size() - 1)// all lines except the first, finish off line
		{
			if (vectorSummaryLine[itr].lastLineOfDay) // add totals to end of last line of the day.
			{
				cout << ", ";

				if (summaryOnly)
					cout << dayTotFees << ", ";  // "Fees (USD)"

				if (vectorSummaryLine[itr].type == buySell_buy)
				{
					if (summaryOnly)
						cout << defaultfloat << setprecision(5);
					else
						cout << setw(1) << setprecision(1);
					cout << numTrades + 0.5 << ", "; // "Trade Number"
					cout << setprecision(5);
				}
				else
				{
					cout << numTrades << ", "; // "Trade Number"
				}

				if(!gSimpleBallances)
				{
					cout << fixed << setprecision(4)
						 << 100 * vectorSummaryLine[itr].runDailyProfit() / dailyTotWallet << "%, "   // "Daily % Profit"
						 << 100 * vectorSummaryLine[itr].runTotAssChange() / startingTotWallet << "%, "   // "% Profit Since Start"
						 << defaultfloat;
				}

				cout << numDays;                                                                          // "Day Number"

				if (!summaryOnly)
					cout << endl;  // Blank line for end of day

				numDays++;
				numTrades = 0;

				dailyTotWallet = vectorSummaryLine[itr].totBallances();
			}
			else
			{
				if ((vectorSummaryLine[itr].lastLineOfDay) || !summaryOnly)
				{
					if (vectorSummaryLine[itr].type == buySell_sell)
					{
						cout << ", " << numTrades;
					}
				}
			}
		}

		if ((vectorSummaryLine[itr].lastLineOfDay) || !summaryOnly)
		{
			cout << endl;
		}
	}

	if (gwantHtml)
	{
		string htmlGraph;


		htmlGraph = R"HTML(
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        </head>
        <body>
            <div id="graph"></div>
            <script>
                var data = [{
                    type: 'scatter',
                    mode: 'lines',
                    x: [
        )HTML";

        htmlGraph += ghtmlXGraph;
		htmlGraph += "],\n";
		htmlGraph += "                  y: [ ";
		htmlGraph += ghtmlYGraph;
		htmlGraph += R"HTML(
              ]
                  }];
		  
                  var layout = {
        )HTML";

		if (summaryOnly)
			htmlGraph += "title: 'Summary Graph',";
		else
			htmlGraph += "title: 'Detailed Graph',";

		htmlGraph += R"HTML(
                      xaxis: { type: 'date',
                               title: 'Date' },
                      yaxis: { title: 'Profit (USD)' }
                  };
		  
                  Plotly.newPlot('graph', data, layout);
              </script>
          </body>
          </html>
        )HTML";


		////////////////////////////////////////////
		// Output html file

		string htmlFileName;
		
		myPath = result["CSV_InputFile"].as<string>();

		htmlFileName = "Processed ";
		if( summaryOnly )
			htmlFileName += "Summary ";
		htmlFileName += myPath.stem().string();
		htmlFileName += ".html";

		myPath.replace_filename(htmlFileName);

		cout << endl << myPath << endl;

		std::ofstream htmlFile( myPath ); 
		if (htmlFile.is_open())
		{
			htmlFile << htmlGraph;
			htmlFile.close();
		}
	}
}
