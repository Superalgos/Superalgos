// TradeAnalysis.cpp : Defines the entry point for the application.
//

#include "TradeAnalysis.h"
#include "SummaryLine.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <iomanip>
#include <cstring>


using namespace std;

bool gSimpleBallances; // User has entered 0, 0 for initial ballances, won't track Holding amounts very well
bool gIncTriggerCondition;

int main(int argc, char* argv[])
{
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


	if ( argc <  4 || argc > 5 )
	{
		cout << endl;
		cout << "Trade Analysis Ver. " << version;
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
	ballanceSummaryLine.total       = atof( argv[3] );

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

	gIncTriggerCondition = false;

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
			else if (myChar == '\n')
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

				if (summaryOnly)
					cout << dayTotFees << ", ";  // "Fees (USD)"

				if (vectorSummaryLine[itr].type == buySell_buy)
				{
					if (summaryOnly)
						cout << setprecision(5);
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
					cout << 100 * vectorSummaryLine[itr].runDailyProfit()  / dailyTotWallet    << "%, "   // "Daily % Profit"
						 << 100 * vectorSummaryLine[itr].runTotAssChange() / startingTotWallet << "%, ";  // "% Profit Since Start"
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
}
