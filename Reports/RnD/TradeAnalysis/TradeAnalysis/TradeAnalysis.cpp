// TradeAnalysis.cpp : Defines the entry point for the application.
//

#include "TradeAnalysis.h"
#include "SummaryLine.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <iomanip>


using namespace std;

typedef enum
{
	lineType_Heading,
    lineType_Summary,
	lineType_TradePiece,
	lineType_Unknown
}LineType;

int main(int argc, char* argv[])
{
	ifstream tradeFile;
	string   token;
	char     myChar;
	bool     endOfFile = false;
	bool     summaryOnly = false;
	int      charCount;
	int      tokenCount;
	int      itr;
	int      numDays;
	int      numTrades;
	double       startingTotWallet;
	double       dailyTotWallet;
	tm           currentDay;
	SummaryLine  summaryLine;
	SummaryLine  ballanceSummaryLine;
	LineType     lineType = lineType_Unknown;
	vector<SummaryLine>  vectorSummaryLine;


	if ( argc <  4 || argc > 5 )
	{
		cout << endl;
		cout << "Usage:" << endl;
		cout << "  TradeAnalysis filename.csv BTC_Ballance USDT_Ballance -s" << endl;
		cout << endl;
		cout << "  -s To print summary only" << endl;
		cout << endl;
	
		return 0;
	}

	tradeFile.open((char*)argv[1]);

	ballanceSummaryLine.orderAmount = atof( argv[2] );
	ballanceSummaryLine.total = atof( argv[3] );
	ballanceSummaryLine.type = buySell_buy;
	ballanceSummaryLine.ballanceLine = true;
	if ( argc == 5 && !strcmp(argv[4], "-s") )
	{
		summaryOnly= true;
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

	// File parsing loop
	while (true) // reading line
	{
		tokenCount = 1;
		while (true) // reading token
		{
			if (tradeFile.eof())
			{
				endOfFile = true;
				break;
			}

			charCount = 0;
			while (true)
			{
				tradeFile >> noskipws >> myChar;

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
						break;
					default:
						lineType = lineType_Unknown;
					}
				}

				if (tradeFile.eof())
				{
					endOfFile = true;
					break;
				}
				else if (myChar == ',' || myChar == '\n')
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
				summaryLine.feedToken(tokenCount, token);
				break;
			}

			token = "";
			tokenCount++;

			if (tradeFile.eof())
			{
				endOfFile = true;
			}
			else if (myChar == '\n')
			{
				break;
			}

			if (endOfFile)
			{
				break;
			}
		}

		switch (lineType)
		{
		    case lineType_Summary:
			{
				vectorSummaryLine.push_back(summaryLine);

				break;
			}
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

			numDays = 1;
			numTrades = 0;

			startingTotWallet = vectorSummaryLine[itr].totBallances();
			dailyTotWallet = vectorSummaryLine[itr].totBallances();

			if( !summaryOnly)
				ballanceSummaryLine.printSelf();
		}

		if (vectorSummaryLine[itr].type == buySell_sell)
			numTrades++;

		// * Print majority of line
		if ( ( vectorSummaryLine[itr].lastLineOfDay ) || !summaryOnly )
		{
			if( summaryOnly)
				vectorSummaryLine[itr].printSummarySelf();
			else
				vectorSummaryLine[itr].printSelf();
		}

		// Print rest of line
		if (itr != vectorSummaryLine.size() - 1)// all lines except the first, finish off line
		{
			if (vectorSummaryLine[itr].lastLineOfDay) // add totals to end of last line of the day.
			{
				cout << ", ";

				if (vectorSummaryLine[itr].type == buySell_buy )
				{
					if( summaryOnly )
						cout << setprecision(5);
					else
						cout << setw(1) << setprecision(1);
					cout << numTrades + 0.5 << ", ";
					cout << setprecision(5);
				}
				else
				{
					cout << numTrades << ", ";
				}

				cout << 100 * vectorSummaryLine[itr].runDailyProfit() / dailyTotWallet << "%, "
					<< 100 * vectorSummaryLine[itr].runTotAssChange() / startingTotWallet << "%, "
					<< numDays;

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
}
