#pragma once

#include <ctime>
#include <string>
#include "Line.h"
#include "TradeAnalysis.h"

using namespace std;

typedef enum
{
	buySell_buy,
	buySell_sell
} buySell;

typedef enum
{
	orderStatus_filled
} orderStatus;

class SummaryLine : public Line
{
public:
	tm           dateTime;         // "Date(UTC)" Date Time Structure
	long long    orderNumber;      // "Order Number"
	string       pair;             // "Pair" Currency pair
	buySell      type;             // "Type" Buy or Sell
	double       orderPrice;       // "Order Price"
	double       orderAmount;      // "Order Amount"
	double       avgTradingPrice;  // "Avg Trading Price" Exchange Rate, Price in USDT for 1 BTC
	double       filled;           // "Filled" Amount of BTC being traded
	double       total;            // "Total" Amount of USDT being traded
	string       triggerCondition; // "Trigger Condition"
	double       btcBallance;      // "BTC Wallet Ballance"
	double       usdtBallance;     // "USDT Wallet Ballance"
	orderStatus  status;           // "status"
	string       feeCurrency;      // "Fee Currency"
	double       feeBothEst;       // "Fee Both Est. (USD)"
	double       feeTradePrice;    // This is the unique Trade Price for part orders
	bool         ballanceLine;     // A SummaryLine to hold opening ballance
	bool         firstLine;        // First line in list, (there will be some figures we don't print)
	bool         firstLineOfDay;   // This record is the first in the current day
	bool         lastLineOfDay;    // This record is the last in the current day
	SummaryLine* pprevLine;

	SummaryLine() {
		ballanceLine   = false;
		feeBothEst     = 0;
		firstLine      = false;
		firstLineOfDay = false;
		lastLineOfDay  = false;
	};

	void feedToken(LineType lineType, int tokenNumber, string token);

	void printSelf();
	void printSummarySelf();
	void printHeader();
	void printSummaryHeader();

	double btcReceive() { return orderAmount; };
	double btcPay() { return -orderAmount; };
	double usdtReceive() { return total; };
	double usdtPay() { return -total; };

	void calcBtcBallance() 
	{ 
		if( ballanceLine)
			btcBallance= btcReceive();
		else
			if (type == buySell_buy)
				if(firstLine)
					btcBallance= btcReceive() + pprevLine->btcBallance;
				else if (pprevLine->type == buySell_buy)
				{
					btcBallance = btcReceive() + pprevLine->pprevLine->btcBallance;
				}
				else
					btcBallance = btcReceive() + pprevLine->btcBallance;
			else
				if(firstLine)
					btcBallance = btcPay() + pprevLine->btcBallance;
				else if (pprevLine->type == buySell_sell)
				{
					btcBallance = btcPay() + pprevLine->pprevLine->btcBallance;
				}
				else 
					btcBallance = btcPay() + pprevLine->btcBallance;
	}
	void calcUsdtBallance() 
	{ 
		if (ballanceLine)
			usdtBallance= -usdtPay();
		else
		{
			if (type == buySell_buy)
			{
				if (firstLine)
					usdtBallance = usdtPay() + pprevLine->usdtBallance;
				else if (pprevLine->type == buySell_buy)
				{
					usdtBallance = usdtPay() + pprevLine->pprevLine->usdtBallance;
				}
				else
				{
					usdtBallance = usdtPay() + pprevLine->usdtBallance;
				}
			}
			else
			{
				if (firstLine)
					usdtBallance = usdtReceive() + pprevLine->usdtBallance;
				else if (pprevLine->type == buySell_sell)
				{
					usdtBallance = usdtReceive() + pprevLine->pprevLine->usdtBallance;
				}
				else
				{
					usdtBallance = usdtReceive() + pprevLine->usdtBallance;
				}
			}
		}
	}
	double btcBalEquiv() 
	{
		return btcBallance * avgTradingPrice;
	}
	// "Both Wallet Ballance (USDT)"
	double totBallances() { return usdtBallance + btcBalEquiv(); }
	// "Spot Profit (USDT)"
	double totAssChange() { if (firstLine) return 0; else return totBallances() - pprevLine->totBallances(); }
	// "Simple Spot Profit (%)"
	double simpleTotAssChangePercent()
	{
		if (firstLine)
			return 0;
		else
			if (type == buySell_sell)
			{
				return 100 * (usdtReceive() + pprevLine->usdtPay()) / -pprevLine->usdtPay();
			}
			else
			{
				return 0;
			}
	}
	// "Complex Spot Profit (%)"
	double complexTotAssChangePercent()
	{
		if (firstLine)
			return 0;
		else
			if (type == buySell_sell)
			{
				return 100 * (totBallances() - pprevLine->totBallances()) / pprevLine->totBallances();
			}
			else
			{
				return 0;
			}
	}
	// "Running Tot Profit"
	double runTotAssChange() { if (firstLine) return 0; else return pprevLine->runTotAssChange() + totAssChange(); }
	// "Running Tot Profit (USDT)
	double runDailyProfit() 
	{ 
		if (firstLineOfDay) 
			return totAssChange(); 
		else 
			return totAssChange() + pprevLine->runDailyProfit(); 
	}
};
