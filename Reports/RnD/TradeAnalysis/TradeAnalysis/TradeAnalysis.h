// TradeAnalysis.h : Include file for standard system include files,
// or project specific include files.

#pragma once


#include <iostream>
#include <cstring>


using namespace std;


const char version[] = "0.8.6";

extern bool gSimpleBallances; // User has entered 0, 0 for initial ballances, won't track Holding amounts very well

extern bool gIncTriggerCondition;

extern string ghtmlXGraph;
extern string ghtmlYGraph;
extern bool   gwantHtml;

typedef enum
{
	lineType_Heading,
	lineType_Summary,
	lineType_TradePiece,
	lineType_TradePiece_Heading,
	lineType_TradePiece_Piece,
	lineType_Unknown
}LineType;

// TODO: Reference additional headers your program requires here.
