#pragma once

#include <ctime>
#include <string>
#include "Line.h"

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
	tm           dateTime;
	long         orderNumber;
	string       pair;
	buySell      type;
	double       orderPrice;
	double       orderAmount;
	double       avgTradingPrice;
	double       filled;
	double       total;
	orderStatus  status;
	bool         ballanceLine; // A SummaryLine to hold opening ballance
	bool         firstLine;    // First line in list, (there will be some figures we don't print)
	bool         firstLineOfDay; // This record is the first in the current day
	bool         lastLineOfDay;  // This record is the last in the current day
	SummaryLine* pprevLine;

	SummaryLine() {
		ballanceLine = false;
		firstLine = false;
		firstLineOfDay = false;
		lastLineOfDay = false;
	};

	void feedToken(int tokenNumber, string token);

	void printSelf();
	void printSummarySelf();
	void printHeader();
	void printSummaryHeader();

	double btcReceive() { return orderAmount; };
	double btcPay() { return -orderAmount; };
	double usdtReceive() { return total; };
	double usdtPay() { return -total; };

	double btcBallance() 
	{ 
		if( ballanceLine)
			return btcReceive();
		else
			if (type == buySell_buy)
				return btcReceive() + pprevLine->btcBallance();
			else
				return btcPay() + pprevLine->btcBallance();
	}
	double usdtBallance() 
	{ 
		if (ballanceLine)
			return -usdtPay();
		else
			if (type == buySell_buy)
				return usdtPay() + pprevLine->usdtBallance();
			else 
				return usdtReceive() + pprevLine->usdtBallance(); 
	}
	double btcBalEquiv() { return btcBallance() * avgTradingPrice; }
	double totBallances() { return usdtBallance() + btcBalEquiv(); }
	double totAssChange() { if (firstLine) return 0; else return totBallances() - pprevLine->totBallances(); }
	double runTotAssChange() { if (firstLine) return 0; else return pprevLine->runTotAssChange() + totAssChange(); }
	double runDailyProfit() { if (firstLineOfDay) return totAssChange(); else return totAssChange() + pprevLine->runDailyProfit(); }
};
