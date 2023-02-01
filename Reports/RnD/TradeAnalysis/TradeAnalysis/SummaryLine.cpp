#include "SummaryLine.h"
#include <iostream>
#include <string>
#include <iomanip>
#include "TradeAnalysis.h"


using namespace std;


void SummaryLine::feedToken(int tokenNumber, string token)
{
	switch (tokenNumber)
	{
	case 1: // Date and Time
	{
		// char ctoken[100];
		char buffer[100];

		strncpy(buffer, &token.c_str()[0], 4);
		buffer[4] = 0;
		dateTime.tm_year = atoi(buffer)-1900;

		strncpy(buffer, &token.c_str()[5], 2);
		buffer[2] = 0;
		dateTime.tm_mon = atoi(buffer)-1;

		strncpy(buffer, &token.c_str()[8], 2);
		buffer[2] = 0;
		dateTime.tm_mday = atoi(buffer);

		strncpy(buffer, &token.c_str()[11], 2);
		buffer[2] = 0;
		dateTime.tm_hour = atoi(buffer);

		strncpy(buffer, &token.c_str()[14], 2);
		buffer[2] = 0;
		dateTime.tm_min = atoi(buffer);

		strncpy(buffer, &token.c_str()[17], 2);
		buffer[2] = 0;
		dateTime.tm_sec = atoi(buffer);

	    break;
	}
	case 2: // orderNumber
		orderNumber = atoll(token.c_str());
		break;
	case 3: // pair
		pair = token;
		break;
	case 4: // type
		if (token == "SELL")
		{
			type = buySell_sell;
		}
		else if (token == "BUY")
		{
			type = buySell_buy;
		}
		break;
	case 5: // orderPrice
		orderPrice = atof  (token.c_str());
		break;
	case 6: // orderAmount
		orderAmount = atof(token.c_str());
		break;
	case 7: // Avg Trading Price
		avgTradingPrice = atof(token.c_str());
		break;
	case 8: // Filled?
		filled = atof(token.c_str());
		break;
	case 9: // total
		total = atof(token.c_str());
		break;
	case 10: // status
		if (token == "Filled")
		{
			status = orderStatus_filled;
		}
		break;
	}
}

void SummaryLine::printSelf()
{
	calcBtcBallance();
	calcUsdtBallance();

	if (ballanceLine)
	{
		cout << ",,,,,,,,,,,,,,,," << btcBallance << ", " << usdtBallance << endl;

	}
	else
	{
		cout
			<< std::setw(2) << std::setfill('0')
			<< dateTime.tm_mday << "/"

			<< std::setw(2) << std::setfill('0')
			<< dateTime.tm_mon + 1 << "/"

			<< dateTime.tm_year + 1900 << ", "

			<< std::setw(2) << std::setfill('0')
			<< dateTime.tm_hour << ":"

			<< std::setw(2) << std::setfill('0')
			<< dateTime.tm_min << ":"

			<< std::setw(2) << std::setfill('0')
			<< dateTime.tm_sec << ", ";

		cout << orderNumber << ", " << pair << ", ";

		if (type == buySell_buy) // "Type"
		{
			cout << "BUY , ";
		}
		else if (type == buySell_sell)
		{
			cout << "SELL, ";
		}
		else
		{
			cout << "????, ";
		}

		cout << std::setprecision(2)
			<< orderPrice << ", "       // "Order Price"
			<< std::fixed
			<< std::setprecision(8)
			<< orderAmount << ", "     // "Order Amount"
			<< std::setprecision(3)
			<< avgTradingPrice << ", " // "Avg Trading Price"
			<< std::setprecision(8)
			<< filled << ", "          // "Filled"
			<< std::setprecision(5)
			<< total << ", ";          // "Total"

		if (status == orderStatus_filled) // "Status"
		{
			cout << "Filled, ";
		}
		else
		{
			cout << "??????, ";
		}

		cout << ", ";

		if (type == buySell_buy)
		{
			cout << btcReceive() << ", "          // "BTC Receive"
				 << ", , " << usdtPay() << ", ";  // "USDT Pay"
		}
		else
		{
			cout << ", " << btcPay()      << ", "           // "BTC Pay"
				         << usdtReceive() << ", " << ", ";  // "USDT Receive"
		}

		cout << btcBallance << ", "     // "BTC Wallet Ballance"
			 << usdtBallance << ", "    // "USDT Wallet Ballance"
			 << btcBalEquiv() << ", "   // "BTC Wallet Ballance Est USDT"
			 << totBallances() << ", "  // "Both Wallet Ballance (USDT)"
			 << totAssChange() << ", "; // "Spot Profit (USDT)"

		if (firstLine)
			cout << ", , ";
		else
		    if (type == buySell_sell)
		    {
		    	cout << simpleTotAssChangePercent() << "%, "; // "Simple Spot Profit (%)"
		    }
		    else
		    {
		    	cout << " , ";
		    }

		if ( !gSimpleBallances )
		{
			if (firstLine)
				cout << ", , ";
			else
				cout << complexTotAssChangePercent() << "%, "; // "Complex Spot Profit (%)"
		}

	    cout << runTotAssChange() << ", "  // "Running Tot Profit (USDT)"
			 << runDailyProfit();  // "Daily Running Tot Profit (USDT)"
	}
}

void SummaryLine::printSummarySelf()
{
	cout << std::setw(2) << std::setfill('0')
		 << dateTime.tm_mday << "/"
		 
		 << std::setw(2) << std::setfill('0')
		 << dateTime.tm_mon + 1 << "/"
		 
		 << dateTime.tm_year + 1900 << ", ";


	cout << totBallances() << ", "    // "Wallet Ballance (USDT)"
		 << runTotAssChange() << ", " // "Profit Since Start (USDT)"
		 << runDailyProfit();         // "Daily Profit (USDT)"
}

void SummaryLine::printHeader()
{
	cout
		<< "Date (UTC),"
		<< "Time,"
		<< "Order No,"
		<< "Pair,"
		<< "Type,"
		<< "Order Price,"
		<< "Order Amount,"
		<< "Avg Trading Price,"
		<< "Filled,"
		<< "Total,"
		<< "status,"
		<< ","
		<< "BTC Receive,"
		<< "BTC Pay,"
		<< "USDT Receive,"
		<< "USDT Pay,"
		<< "BTC Wallet Ballance,"
		<< "USDT Wallet Ballance,"
		<< "BTC Wallet Ballance Est (USDT),"
		<< "Both Wallet Ballance (USDT),"
		<< "Spot Profit (USDT),"
		<< "Simple Spot Profit (%),";

	if (!gSimpleBallances)
		cout << "Complex Spot Profit (%),";

	cout
		<< "Running Tot Profit (USDT),"
		<< "Daily Running Tot Profit (USDT),"
		<< "Trade Number,";

	if (!gSimpleBallances)
		cout
			<< "Complex Daily Profit (%),"
			<< "Complex Since Start Profit (%),";

	cout
		<< "Day Number,"
		<< "v" << version
		<< endl;
}

void SummaryLine::printSummaryHeader()
{
	cout
		<< "Date (UTC),"
		<< "Wallet Ballance (USDT),"
		<< "Profit Since Start (USDT),"
		<< "Daily Profit (USDT),"
		<< "Number Of Trades,";

	if (!gSimpleBallances)
		cout << "Complex Daily Profit (%),"
			 << "Complex Since Start Profit (%),";

	cout
		<< "Day Number,"
		<< "v" << version
		<< endl;
}