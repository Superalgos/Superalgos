<h1 align="center">Bitcoin-Factory Round 5</h1>

 ## List Of All Data Mines Included In Round 5 Indicator List

#### _&nbsp;   &nbsp;Note: Data Mines Awaiting Review Have Not Been Included_

<br>

 1. Alligator Data Mine
 2. Alpha Data Mine
 3. Anchored VWAP Data Mine
 4. Barcelona Data Mine
 5. Bollinger Data Mine
 6. Candles Data Mine
 7. Chande Data Mine
 8. Coppock Data Mine
 9. Delta Data Mine
 10. Enhanced Bollinger Stochastic Data Mine
 11. Expontential Moving Averages Data Mine
 12. Fibonacci Data Mine
 13. HannWindow Data Mine
 14. Heikin Data Mine
 15. Keltner Bollinger Strategy Data Mine
 16. Madi System Mine Data Mine
 17. Masters Data Mine
 18. Mayer Multiple Data Mine
 19. Normalized Momentum Data Mine
 20. Omega-Grids Data Mine
 21. Omega-One Data Mine
 22. Optimized Trend Tracker Data Mine
 23. Over Sampled Data Mine
 24. Pivots Data Mine
 25. Pluvtech Data Mine
 26. Quantum Data Mine
 27. Relative Vigor Index Data Mine
 28. Schaff Trend Data Mine
 29. Smart Money Data Mine
 30. Sparta Data Mine
 31. Trends Data Mine
 32. Turtles Data Mine
 33. Weighted EMA Cross Strategy Data Mine
 34. Zeus Data Mine

#### _&nbsp;&nbsp;Data Mines Still Awaiting Review Can Be Found [HERE.](https://github.com/theblockchainarborist/Bitcoin-Factory-Indicators/tree/main/Awaiting_Review)_

<br>
<h2>
 <details>
  <summary>Full List Of Data Mine Indicators</summary>

    {
    "networkCodeName": "Testnet",
    "targetSuperalgosHost": "192.168.1.156",
    "targetSuperalgosHttpPort": 34248,
    "pythonScriptName": "Bitcoin_Factory_LSTM.py",
    "timeSeriesFile": {
        "labels": [
            {
                "dataMine": "Candles",
                "indicator": "Candles-Volumes",
                "product": "Candles",
                "objectName": "candle",
                "propertyName": "max",
                "range": [
                    "ON"
                ]
            },
            {
                "dataMine": "Candles",
                "indicator": "Candles-Volumes",
                "product": "Candles",
                "objectName": "candle",
                "propertyName": "min",
                "range": [
                    "ON"
                ]
            },
            {
                "dataMine": "Candles",
                "indicator": "Candles-Volumes",
                "product": "Candles",
                "objectName": "candle",
                "propertyName": "close",
                "range": [
                    "ON"
                ]
            }
        ],
        "features": [
            {
                "parameter": "HOUR_OF_DAY",
                "range": [
                    "OFF"
                ]
            },
            {
                "parameter": "DAY_OF_MONTH",
                "range": [
                    "OFF"
                ]
            },
            {
                "parameter": "DAY_OF_WEEK",
                "range": [
                    "OFF"
                ]
            },
            {
                "parameter": "WEEK_OF_YEAR",
                "range": [
                    "OFF"
                ]
            },
            {
                "parameter": "MONTH_OF_YEAR",
                "range": [
                    "OFF"
                ]
            },
            {
                "parameter": "YEAR",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Candles",
                "indicator": "Candles-Volumes",
                "product": "Candles",
                "objectName": "candle",
                "propertyName": "open",
                "range": [
                    "ON"
                ]
            },
            {
                "dataMine": "Candles",
                "indicator": "Candles-Volumes",
                "product": "Volumes",
                "objectName": "volume",
                "propertyName": "buy",
                "range": [
                    "ON"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Resistances",
                "objectName": "resistance",
                "propertyName": "resistance1Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Resistances",
                "objectName": "resistance",
                "propertyName": "resistance2Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Resistances",
                "objectName": "resistance",
                "propertyName": "resistance3Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Resistances",
                "objectName": "resistance",
                "propertyName": "resistance4Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Resistances",
                "objectName": "resistance",
                "propertyName": "resistance5Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Supports",
                "objectName": "support",
                "propertyName": "support1Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Supports",
                "objectName": "support",
                "propertyName": "support2Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Supports",
                "objectName": "support",
                "propertyName": "support3Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Supports",
                "objectName": "support",
                "propertyName": "support4Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Masters",
                "indicator": "Resistances-And-Supports",
                "product": "Supports",
                "objectName": "support",
                "propertyName": "support5Rate",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Bollinger",
                "indicator": "Bollinger-Bands",
                "product": "Bollinger-Bands",
                "objectName": "bollingerBand",
                "propertyName": "movingAverage",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Bollinger",
                "indicator": "Bollinger-Bands",
                "product": "Bollinger-Bands",
                "objectName": "bollingerBand",
                "propertyName": "deviation",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Bollinger",
                "indicator": "Bollinger-Bands",
                "product": "Percentage-Bandwidth",
                "objectName": "percentageBandwidth",
                "propertyName": "movingAverage",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Bollinger",
                "indicator": "Bollinger-Bands",
                "product": "Percentage-Bandwidth",
                "objectName": "percentageBandwidth",
                "propertyName": "bandwidth",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alligator",
                "indicator": "Alligator",
                "product": "Alligator",
                "objectName": "Alligator",
                "propertyName": "last13",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alligator",
                "indicator": "Alligator",
                "product": "Alligator",
                "objectName": "Alligator",
                "propertyName": "previousEMA5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alligator",
                "indicator": "Alligator",
                "product": "Alligator",
                "objectName": "Alligator",
                "propertyName": "jaw",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alligator",
                "indicator": "Alligator",
                "product": "Alligator",
                "objectName": "Alligator",
                "propertyName": "teeth",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alligator",
                "indicator": "Alligator",
                "product": "Alligator",
                "objectName": "Alligator",
                "propertyName": "lips",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "ATR",
                "product": "ATR-RMA",
                "objectName": "atrRMA",
                "propertyName": "atr14",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "ATR",
                "product": "ATR-RMA",
                "objectName": "atrRMA",
                "propertyName": "atr3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "ATR",
                "product": "ATR-RMA",
                "objectName": "atrRMA",
                "propertyName": "atr2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "ATR",
                "product": "ATR-SMA",
                "objectName": "atrSMA",
                "propertyName": "atr14",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "ATR",
                "product": "ATR-SMA",
                "objectName": "atrSMA",
                "propertyName": "atr3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "ATR",
                "product": "ATR-SMA",
                "objectName": "atrSMA",
                "propertyName": "atr2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "ROC",
                "product": "ROC-76",
                "objectName": "roc76",
                "propertyName": "value",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "ROC",
                "product": "ROC-32",
                "objectName": "roc32",
                "propertyName": "value",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "ROC",
                "product": "ROC-9",
                "objectName": "roc9",
                "propertyName": "value",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "Stochastic",
                "product": "Stoch-14-3-3",
                "objectName": "stoch1433",
                "propertyName": "slowLine",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Alpha",
                "indicator": "Stochastic",
                "product": "Stoch-14-3-3",
                "objectName": "stoch1433",
                "propertyName": "fastLine",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Anchored_VWAP",
                "indicator": "anchoredVWAP",
                "product": "anchoredVWAP",
                "objectName": "anchoredVWAP",
                "propertyName": "high",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Anchored_VWAP",
                "indicator": "anchoredVWAP",
                "product": "anchoredVWAP",
                "objectName": "anchoredVWAP",
                "propertyName": "low",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Anchored_VWAP",
                "indicator": "anchoredVWAP",
                "product": "anchoredVWAP",
                "objectName": "anchoredVWAP",
                "propertyName": "botLow",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Anchored_VWAP",
                "indicator": "anchoredVWAP",
                "product": "anchoredVWAP",
                "objectName": "anchoredVWAP",
                "propertyName": "botMid",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Anchored_VWAP",
                "indicator": "anchoredVWAP",
                "product": "anchoredVWAP",
                "objectName": "anchoredVWAP",
                "propertyName": "topHigh",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Anchored_VWAP",
                "indicator": "anchoredVWAP",
                "product": "anchoredVWAP",
                "objectName": "anchoredVWAP",
                "propertyName": "topMid",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Barcelona",
                "indicator": "Koncorde",
                "product": "Koncorde",
                "objectName": "koncorde",
                "propertyName": "histogram",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Barcelona",
                "indicator": "Koncorde",
                "product": "Koncorde",
                "objectName": "koncorde",
                "propertyName": "signal",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Barcelona",
                "indicator": "Koncorde",
                "product": "Koncorde",
                "objectName": "koncorde",
                "propertyName": "green",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Barcelona",
                "indicator": "Koncorde",
                "product": "Koncorde",
                "objectName": "koncorde",
                "propertyName": "brown",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Barcelona",
                "indicator": "Koncorde",
                "product": "Koncorde",
                "objectName": "koncorde",
                "propertyName": "blue",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Barcelona",
                "indicator": "Koncorde",
                "product": "koncorde_pattern",
                "objectName": "koncorde_pattern",
                "propertyName": "pattern",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Barcelona",
                "indicator": "Koncorde",
                "product": "koncorde_pattern",
                "objectName": "koncorde_pattern",
                "propertyName": "trend",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Chande",
                "indicator": "ChandeForecastOscillator",
                "product": "CFO",
                "objectName": "CFO",
                "propertyName": "CFO",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Chande",
                "indicator": "ChandeMomentumOscillator",
                "product": "CMO",
                "objectName": "CMO",
                "propertyName": "CMO",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Chande",
                "indicator": "ChandeKrollStop",
                "product": "CKS",
                "objectName": "CKS",
                "propertyName": "shortStop",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Chande",
                "indicator": "ChandeKrollStop",
                "product": "CKS",
                "objectName": "CKS",
                "propertyName": "longStop",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Coppock",
                "indicator": "CoppockCurve",
                "product": "cCurve",
                "objectName": "cCurve",
                "propertyName": "cCurve",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Delta",
                "indicator": "RSI-W",
                "product": "RSI-W14",
                "objectName": "rsiw14",
                "propertyName": "overbought",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Delta",
                "indicator": "RSI-W",
                "product": "RSI-W14",
                "objectName": "rsiw14",
                "propertyName": "oversold",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Delta",
                "indicator": "RSI-W",
                "product": "RSI-W14",
                "objectName": "rsiw14",
                "propertyName": "value",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Delta",
                "indicator": "MFI",
                "product": "MFI",
                "objectName": "mfi",
                "propertyName": "oversold",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Delta",
                "indicator": "MFI",
                "product": "MFI",
                "objectName": "mfi",
                "propertyName": "overbought",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Delta",
                "indicator": "MFI",
                "product": "MFI",
                "objectName": "mfi",
                "propertyName": "value",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Enhanced_Bollinger_Stochastic",
                "indicator": "Enhanced_Bollinger",
                "product": "EBollinger",
                "objectName": "ebollinger",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Enhanced_Bollinger_Stochastic",
                "indicator": "Enhanced_Bollinger",
                "product": "EBollinger",
                "objectName": "ebollinger",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Enhanced_Bollinger_Stochastic",
                "indicator": "Enhanced_Bollinger",
                "product": "EBollinger",
                "objectName": "ebollinger",
                "propertyName": "ema",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Enhanced_Bollinger_Stochastic",
                "indicator": "Stochastic",
                "product": "stochastic",
                "objectName": "stochastic",
                "propertyName": "k",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Enhanced_Bollinger_Stochastic",
                "indicator": "ATR",
                "product": "ATR",
                "objectName": "ATR",
                "propertyName": "atr",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Expontential_Moving_Averages",
                "indicator": "DEMA",
                "product": "DEMA",
                "objectName": "DEMA",
                "propertyName": "DEMA",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Expontential_Moving_Averages",
                "indicator": "TEMA",
                "product": "TEMA",
                "objectName": "TEMA",
                "propertyName": "TEMA",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Expontential_Moving_Averages",
                "indicator": "QEMA",
                "product": "QEMA",
                "objectName": "QEMA",
                "propertyName": "QEMA",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Expontential_Moving_Averages",
                "indicator": "PEMA",
                "product": "PEMA",
                "objectName": "PEMA",
                "propertyName": "PEMA",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "F1618",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "F1000",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "F0786",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "F0618",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "F0500",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "F0382",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "F0236",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "F0",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "low",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "Fibonacci",
                "indicator": "autoFibRetracement",
                "product": "autoFibRetracement",
                "objectName": "autoFibRetracement",
                "propertyName": "high",
                "range": [
                    "ON",
                    "OFF"
                ]
            },
            {
                "dataMine": "HannWindow",
                "indicator": "DMH",
                "product": "DMH",
                "objectName": "DMH",
                "propertyName": "DMH",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "HannWindow",
                "indicator": "RSIH",
                "product": "RSIH",
                "objectName": "RSIH",
                "propertyName": "RSIH",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "HannWindow",
                "indicator": "MADH",
                "product": "MADH",
                "objectName": "MADH",
                "propertyName": "maLong",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "HannWindow",
                "indicator": "MADH",
                "product": "MADH",
                "objectName": "MADH",
                "propertyName": "maShort",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "HannWindow",
                "indicator": "MADH",
                "product": "MADH",
                "objectName": "MADH",
                "propertyName": "MADH",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Super-Trend",
                "product": "Heikin-Super-Trend",
                "objectName": "HeikinsuperTrend",
                "propertyName": "trend",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Super-Trend",
                "product": "Heikin-Super-Trend",
                "objectName": "HeikinsuperTrend",
                "propertyName": "downtrend",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Super-Trend",
                "product": "Heikin-Super-Trend",
                "objectName": "HeikinsuperTrend",
                "propertyName": "uptrend",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Super-Trend",
                "product": "Heikin-Super-Trend",
                "objectName": "HeikinsuperTrend",
                "propertyName": "atrNPeriod",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Super-Trend",
                "product": "Heikin-Super-Trend",
                "objectName": "HeikinsuperTrend",
                "propertyName": "trueRange",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Ashi",
                "product": "Heikin-Candle",
                "objectName": "heikincandle",
                "propertyName": "HeikinDirection",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Ashi",
                "product": "Heikin-Candle",
                "objectName": "heikincandle",
                "propertyName": "min",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Ashi",
                "product": "Heikin-Candle",
                "objectName": "heikincandle",
                "propertyName": "max",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Ashi",
                "product": "Heikin-Candle",
                "objectName": "heikincandle",
                "propertyName": "close",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Heikin",
                "indicator": "Heikin-Ashi",
                "product": "Heikin-Candle",
                "objectName": "heikincandle",
                "propertyName": "open",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Super-Trend143",
                "product": "Super-Trend143",
                "objectName": "superTrend143",
                "propertyName": "trend",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Super-Trend143",
                "product": "Super-Trend143",
                "objectName": "superTrend143",
                "propertyName": "downtrend",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Super-Trend143",
                "product": "Super-Trend143",
                "objectName": "superTrend143",
                "propertyName": "uptrend",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Super-Trend143",
                "product": "Super-Trend143",
                "objectName": "superTrend143",
                "propertyName": "atrNPeriod",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Super-Trend143",
                "product": "Super-Trend143",
                "objectName": "superTrend143",
                "propertyName": "trueRange",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Keltner",
                "product": "MAMA",
                "objectName": "MAMA",
                "propertyName": "closePrice",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Keltner",
                "product": "MAMA",
                "objectName": "MAMA",
                "propertyName": "fama",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Keltner",
                "product": "MAMA",
                "objectName": "MAMA",
                "propertyName": "mama",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Keltner",
                "product": "Keltner",
                "objectName": "keltner",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Keltner",
                "product": "Keltner",
                "objectName": "keltner",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Keltner",
                "product": "Keltner",
                "objectName": "keltner",
                "propertyName": "MAMA",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Keltner",
                "product": "KeltnerEMA",
                "objectName": "keltnerema",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Keltner",
                "product": "KeltnerEMA",
                "objectName": "keltnerema",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Keltner",
                "product": "KeltnerEMA",
                "objectName": "keltnerema",
                "propertyName": "ema",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Enhanced_Bollinger",
                "product": "EBollinger",
                "objectName": "ebollinger",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Enhanced_Bollinger",
                "product": "EBollinger",
                "objectName": "ebollinger",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "Enhanced_Bollinger",
                "product": "EBollinger",
                "objectName": "ebollinger",
                "propertyName": "ema",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Keltner_Bollinger_Strategy",
                "indicator": "ATR",
                "product": "ATR",
                "objectName": "ATR",
                "propertyName": "atr",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Madi_System_Mine",
                "indicator": "RSI",
                "product": "RSI",
                "objectName": "rsi",
                "propertyName": "valueD",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Madi_System_Mine",
                "indicator": "RSI",
                "product": "RSI",
                "objectName": "rsi",
                "propertyName": "valueK",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Madi_System_Mine",
                "indicator": "RSI",
                "product": "RSI",
                "objectName": "rsi",
                "propertyName": "stochRSI",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Madi_System_Mine",
                "indicator": "RSI",
                "product": "RSI",
                "objectName": "rsi",
                "propertyName": "rsi",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Madi_System_Mine",
                "indicator": "MADI",
                "product": "MADI",
                "objectName": "MADI",
                "propertyName": "d",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Madi_System_Mine",
                "indicator": "MADI",
                "product": "MADI",
                "objectName": "MADI",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Madi_System_Mine",
                "indicator": "MADI",
                "product": "MADI",
                "objectName": "MADI",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Madi_System_Mine",
                "indicator": "MADI",
                "product": "MADI",
                "objectName": "MADI",
                "propertyName": "madi",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Mayer_Multiple",
                "indicator": "MayerMultiple",
                "product": "MayerMultiple",
                "objectName": "MayerMultiple",
                "propertyName": "MayerMultiple",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Mayer_Multiple",
                "indicator": "MayerMultipleEMA",
                "product": "MayerMultipleEMA",
                "objectName": "MayerMultipleEMA",
                "propertyName": "MayerMultiple",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_Stochastic",
                "product": "Normalized_Stochastic",
                "objectName": "Normalized_Stochastic",
                "propertyName": "maz",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_Stochastic",
                "product": "Normalized_Stochastic",
                "objectName": "Normalized_Stochastic",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_Stochastic",
                "product": "Normalized_Stochastic",
                "objectName": "Normalized_Stochastic",
                "propertyName": "z",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_Stochastic",
                "product": "Normalized_Stochastic",
                "objectName": "Normalized_Stochastic",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_RSI",
                "product": "Normalized_RSI",
                "objectName": "Normalized_RSI",
                "propertyName": "maz",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_RSI",
                "product": "Normalized_RSI",
                "objectName": "Normalized_RSI",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_RSI",
                "product": "Normalized_RSI",
                "objectName": "Normalized_RSI",
                "propertyName": "z",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_RSI",
                "product": "Normalized_RSI",
                "objectName": "Normalized_RSI",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_auto_RSI",
                "product": "Normalized_auto_RSI",
                "objectName": "Normalized_auto_RSI",
                "propertyName": "maz",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_auto_RSI",
                "product": "Normalized_auto_RSI",
                "objectName": "Normalized_auto_RSI",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_auto_RSI",
                "product": "Normalized_auto_RSI",
                "objectName": "Normalized_auto_RSI",
                "propertyName": "z",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Normalized_auto_RSI",
                "product": "Normalized_auto_RSI",
                "objectName": "Normalized_auto_RSI",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Kinetic_Detrender",
                "product": "Kinetic_Detrender",
                "objectName": "Kinetic_Detrender",
                "propertyName": "maz",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Kinetic_Detrender",
                "product": "Kinetic_Detrender",
                "objectName": "Kinetic_Detrender",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Kinetic_Detrender",
                "product": "Kinetic_Detrender",
                "objectName": "Kinetic_Detrender",
                "propertyName": "z",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Normalized_Momentum",
                "indicator": "Kinetic_Detrender",
                "product": "Kinetic_Detrender",
                "objectName": "Kinetic_Detrender",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "gridRange",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid20",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid19",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid18",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid17",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid16",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid15",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid14",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid13",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid12",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid11",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid10",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid9",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid8",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid7",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid6",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "fixedPercentageGrid",
                "product": "fixedPercentageGrid",
                "objectName": "fixedPercentageGrid",
                "propertyName": "grid0",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "gridRange",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid20",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid19",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid18",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid17",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid16",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid15",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid14",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid13",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid12",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid11",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid10",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid9",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid8",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid7",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid6",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "atrBasedGrid",
                "product": "atrBasedGrid",
                "objectName": "atrBasedGrid",
                "propertyName": "grid0",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "gridRange",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid20",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid19",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid18",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid17",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid16",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid15",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid14",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid13",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid12",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid11",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid10",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid9",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid8",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid7",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid6",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "periodBasedGrid",
                "product": "periodBasedGrid",
                "objectName": "periodBasedGrid",
                "propertyName": "grid0",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "gridRange",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid20",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid19",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid18",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid17",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid16",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid15",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid14",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid13",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid12",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid11",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid10",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid9",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid8",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid7",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid6",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "bbGrid",
                "product": "bbGrid",
                "objectName": "bbGrid",
                "propertyName": "grid0",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "gridRange",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid20",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid19",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid18",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid17",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid16",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid15",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid14",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid13",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid12",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid11",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid10",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid9",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid8",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid7",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid6",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-Grids",
                "indicator": "smoothedAtrGrid",
                "product": "smoothedAtrGrid",
                "objectName": "smoothedAtrGrid",
                "propertyName": "grid0",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "Chaikin-Oscillator",
                "product": "chaikinOscillator",
                "objectName": "chaikinOscillator",
                "propertyName": "zeroLine",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "Chaikin-Oscillator",
                "product": "chaikinOscillator",
                "objectName": "chaikinOscillator",
                "propertyName": "chaikinOscillator",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Slow",
                "product": "slowARPS",
                "objectName": "slowARPS",
                "propertyName": "percentageApsBear",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Slow",
                "product": "slowARPS",
                "objectName": "slowARPS",
                "propertyName": "percentageApsBull",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Slow",
                "product": "slowARPS",
                "objectName": "slowARPS",
                "propertyName": "percentageARPS",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Slow",
                "product": "slowARPS",
                "objectName": "slowARPS",
                "propertyName": "SMA",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Slow",
                "product": "slowARPS",
                "objectName": "slowARPS",
                "propertyName": "apsBear",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Slow",
                "product": "slowARPS",
                "objectName": "slowARPS",
                "propertyName": "apsBull",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Slow",
                "product": "slowARPS",
                "objectName": "slowARPS",
                "propertyName": "ARPS",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Fast",
                "product": "fastARPS",
                "objectName": "fastARPS",
                "propertyName": "percentageApsBear",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Fast",
                "product": "fastARPS",
                "objectName": "fastARPS",
                "propertyName": "percentageApsBull",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Fast",
                "product": "fastARPS",
                "objectName": "fastARPS",
                "propertyName": "percentageARPS",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Fast",
                "product": "fastARPS",
                "objectName": "fastARPS",
                "propertyName": "SMA",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Fast",
                "product": "fastARPS",
                "objectName": "fastARPS",
                "propertyName": "apsBear",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Fast",
                "product": "fastARPS",
                "objectName": "fastARPS",
                "propertyName": "apsBull",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ARPS-Fast",
                "product": "fastARPS",
                "objectName": "fastARPS",
                "propertyName": "ARPS",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "averageVsAverage",
                "product": "averageVsAverage",
                "objectName": "averageVsAverage",
                "propertyName": "openInterestDeviation",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "averageVsAverage",
                "product": "averageVsAverage",
                "objectName": "averageVsAverage",
                "propertyName": "volumeDeviation",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "averageVsAverage",
                "product": "averageVsAverage",
                "objectName": "averageVsAverage",
                "propertyName": "smaPrice",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "averageVsAverage",
                "product": "averageVsAverage",
                "objectName": "averageVsAverage",
                "propertyName": "bullPriceDeviation",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "Triple-ALMA",
                "product": "tripleALMA",
                "objectName": "tripleALMA",
                "propertyName": "alma03",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "Triple-ALMA",
                "product": "tripleALMA",
                "objectName": "tripleALMA",
                "propertyName": "alma02",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "Triple-ALMA",
                "product": "tripleALMA",
                "objectName": "tripleALMA",
                "propertyName": "alma01",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "emaCrossing",
                "product": "emaCrossing",
                "objectName": "emaCrossing",
                "propertyName": "ema02",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "emaCrossing",
                "product": "emaCrossing",
                "objectName": "emaCrossing",
                "propertyName": "ema01",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "CMA",
                "product": "cma",
                "objectName": "cma",
                "propertyName": "cma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "ALMA",
                "product": "ALMA",
                "objectName": "ALMA",
                "propertyName": "alma01",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "anchoredVwapChannel",
                "product": "anchoredVwapChannel",
                "objectName": "anchoredVwapChannel",
                "propertyName": "devLo2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "anchoredVwapChannel",
                "product": "anchoredVwapChannel",
                "objectName": "anchoredVwapChannel",
                "propertyName": "devLo1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "anchoredVwapChannel",
                "product": "anchoredVwapChannel",
                "objectName": "anchoredVwapChannel",
                "propertyName": "devHi2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "anchoredVwapChannel",
                "product": "anchoredVwapChannel",
                "objectName": "anchoredVwapChannel",
                "propertyName": "devHi1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Omega-One",
                "indicator": "anchoredVwapChannel",
                "product": "anchoredVwapChannel",
                "objectName": "anchoredVwapChannel",
                "propertyName": "vwap",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "VAR_OTT",
                "product": "VAR_OTT",
                "objectName": "VAR_OTT",
                "propertyName": "close",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "VAR_OTT",
                "product": "VAR_OTT",
                "objectName": "VAR_OTT",
                "propertyName": "h",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "VAR_OTT",
                "product": "VAR_OTT",
                "objectName": "VAR_OTT",
                "propertyName": "var",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "VAR_OTT",
                "product": "VAR_OTT",
                "objectName": "VAR_OTT",
                "propertyName": "ott",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "Laguerre_OTT",
                "product": "Laguerre_OTT",
                "objectName": "Laguerre_OTT",
                "propertyName": "close",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "Laguerre_OTT",
                "product": "Laguerre_OTT",
                "objectName": "Laguerre_OTT",
                "propertyName": "h",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "Laguerre_OTT",
                "product": "Laguerre_OTT",
                "objectName": "Laguerre_OTT",
                "propertyName": "var",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "Laguerre_OTT",
                "product": "Laguerre_OTT",
                "objectName": "Laguerre_OTT",
                "propertyName": "ott",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "Butterworth_OTT",
                "product": "Butterworth_OTT",
                "objectName": "Butterworth_OTT",
                "propertyName": "close",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "Butterworth_OTT",
                "product": "Butterworth_OTT",
                "objectName": "Butterworth_OTT",
                "propertyName": "h",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "Butterworth_OTT",
                "product": "Butterworth_OTT",
                "objectName": "Butterworth_OTT",
                "propertyName": "var",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Optimized_Trend_Tracker",
                "indicator": "Butterworth_OTT",
                "product": "Butterworth_OTT",
                "objectName": "Butterworth_OTT",
                "propertyName": "ott",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "Min_Sigma",
                "objectName": "MinSigma",
                "propertyName": "map",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "Min_Sigma",
                "objectName": "MinSigma",
                "propertyName": "sigma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "Min_Sigma",
                "objectName": "MinSigma",
                "propertyName": "ma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "Min_Sigma",
                "objectName": "MinSigma",
                "propertyName": "insta",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "Min_Sigma",
                "objectName": "MinSigma",
                "propertyName": "slope",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "Min_Sigma",
                "objectName": "MinSigma",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "Min_Sigma",
                "objectName": "MinSigma",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "Min_Sigma",
                "objectName": "MinSigma",
                "propertyName": "strike",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "Min_Sigma",
                "objectName": "MinSigma",
                "propertyName": "Z",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "RMax",
                "objectName": "rmax",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "RMax",
                "objectName": "rmax",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Over_Sampled_Probabilities",
                "product": "RMax",
                "objectName": "rmax",
                "propertyName": "Z",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "OverSampled_Bollinger_Bands",
                "product": "OverSampled_Bollinger_Bands",
                "objectName": "OverSampled_Bollinger_Bands",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "OverSampled_Bollinger_Bands",
                "product": "OverSampled_Bollinger_Bands",
                "objectName": "OverSampled_Bollinger_Bands",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "OverSampled_Bollinger_Bands",
                "product": "OverSampled_Bollinger_Bands",
                "objectName": "OverSampled_Bollinger_Bands",
                "propertyName": "MA",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Close_Z_Probability",
                "product": "Close_Sigma",
                "objectName": "CloseSigma",
                "propertyName": "map",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Close_Z_Probability",
                "product": "Close_Sigma",
                "objectName": "CloseSigma",
                "propertyName": "sigma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Close_Z_Probability",
                "product": "Close_Sigma",
                "objectName": "CloseSigma",
                "propertyName": "ma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Close_Z_Probability",
                "product": "Close_Sigma",
                "objectName": "CloseSigma",
                "propertyName": "insta",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Close_Z_Probability",
                "product": "Close_Sigma",
                "objectName": "CloseSigma",
                "propertyName": "slope",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Close_Z_Probability",
                "product": "Close_Sigma",
                "objectName": "CloseSigma",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Close_Z_Probability",
                "product": "Close_Sigma",
                "objectName": "CloseSigma",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Close_Z_Probability",
                "product": "Close_Sigma",
                "objectName": "CloseSigma",
                "propertyName": "strike",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "Close_Z_Probability",
                "product": "Close_Sigma",
                "objectName": "CloseSigma",
                "propertyName": "Z",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "MAX_Z_Probability",
                "product": "MAX_Z_Probability",
                "objectName": "MAX_Z_Probability",
                "propertyName": "map",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "MAX_Z_Probability",
                "product": "MAX_Z_Probability",
                "objectName": "MAX_Z_Probability",
                "propertyName": "sigma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "MAX_Z_Probability",
                "product": "MAX_Z_Probability",
                "objectName": "MAX_Z_Probability",
                "propertyName": "ma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "MAX_Z_Probability",
                "product": "MAX_Z_Probability",
                "objectName": "MAX_Z_Probability",
                "propertyName": "insta",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "MAX_Z_Probability",
                "product": "MAX_Z_Probability",
                "objectName": "MAX_Z_Probability",
                "propertyName": "slope",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "MAX_Z_Probability",
                "product": "MAX_Z_Probability",
                "objectName": "MAX_Z_Probability",
                "propertyName": "lower",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "MAX_Z_Probability",
                "product": "MAX_Z_Probability",
                "objectName": "MAX_Z_Probability",
                "propertyName": "upper",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "MAX_Z_Probability",
                "product": "MAX_Z_Probability",
                "objectName": "MAX_Z_Probability",
                "propertyName": "strike",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Over_Sampled_Indicators",
                "indicator": "MAX_Z_Probability",
                "product": "MAX_Z_Probability",
                "objectName": "MAX_Z_Probability",
                "propertyName": "Z",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleLoPrevLoc",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleHiPrevLoc",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleLowLoc",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleHighLoc",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleLowValPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleHighValPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleLowVal",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleHighVal",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Daily-Pivot-Points",
                "product": "Daily-Pivot-Points",
                "objectName": "Daypivot",
                "propertyName": "s4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Daily-Pivot-Points",
                "product": "Daily-Pivot-Points",
                "objectName": "Daypivot",
                "propertyName": "s3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Daily-Pivot-Points",
                "product": "Daily-Pivot-Points",
                "objectName": "Daypivot",
                "propertyName": "s2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Daily-Pivot-Points",
                "product": "Daily-Pivot-Points",
                "objectName": "Daypivot",
                "propertyName": "s1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Daily-Pivot-Points",
                "product": "Daily-Pivot-Points",
                "objectName": "Daypivot",
                "propertyName": "r4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Daily-Pivot-Points",
                "product": "Daily-Pivot-Points",
                "objectName": "Daypivot",
                "propertyName": "r3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Daily-Pivot-Points",
                "product": "Daily-Pivot-Points",
                "objectName": "Daypivot",
                "propertyName": "r2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Daily-Pivot-Points",
                "product": "Daily-Pivot-Points",
                "objectName": "Daypivot",
                "propertyName": "r1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Daily-Pivot-Points",
                "product": "Daily-Pivot-Points",
                "objectName": "Daypivot",
                "propertyName": "pivot",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Fib",
                "product": "Pivot-Points-Fib",
                "objectName": "PivotFib",
                "propertyName": "s3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Fib",
                "product": "Pivot-Points-Fib",
                "objectName": "PivotFib",
                "propertyName": "s2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Fib",
                "product": "Pivot-Points-Fib",
                "objectName": "PivotFib",
                "propertyName": "s1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Fib",
                "product": "Pivot-Points-Fib",
                "objectName": "PivotFib",
                "propertyName": "r3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Fib",
                "product": "Pivot-Points-Fib",
                "objectName": "PivotFib",
                "propertyName": "r2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Fib",
                "product": "Pivot-Points-Fib",
                "objectName": "PivotFib",
                "propertyName": "r1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Fib",
                "product": "Pivot-Points-Fib",
                "objectName": "PivotFib",
                "propertyName": "pivot",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Woodie",
                "product": "Pivot-Points-Woodie",
                "objectName": "PivotWoodie",
                "propertyName": "s4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Woodie",
                "product": "Pivot-Points-Woodie",
                "objectName": "PivotWoodie",
                "propertyName": "s3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Woodie",
                "product": "Pivot-Points-Woodie",
                "objectName": "PivotWoodie",
                "propertyName": "s2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Woodie",
                "product": "Pivot-Points-Woodie",
                "objectName": "PivotWoodie",
                "propertyName": "s1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Woodie",
                "product": "Pivot-Points-Woodie",
                "objectName": "PivotWoodie",
                "propertyName": "r4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Woodie",
                "product": "Pivot-Points-Woodie",
                "objectName": "PivotWoodie",
                "propertyName": "r3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Woodie",
                "product": "Pivot-Points-Woodie",
                "objectName": "PivotWoodie",
                "propertyName": "r2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Woodie",
                "product": "Pivot-Points-Woodie",
                "objectName": "PivotWoodie",
                "propertyName": "r1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Woodie",
                "product": "Pivot-Points-Woodie",
                "objectName": "PivotWoodie",
                "propertyName": "pivot",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Camarilla",
                "product": "Pivot-Points-Camarilla",
                "objectName": "PivotCamarilla",
                "propertyName": "s4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Camarilla",
                "product": "Pivot-Points-Camarilla",
                "objectName": "PivotCamarilla",
                "propertyName": "s3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Camarilla",
                "product": "Pivot-Points-Camarilla",
                "objectName": "PivotCamarilla",
                "propertyName": "s2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Camarilla",
                "product": "Pivot-Points-Camarilla",
                "objectName": "PivotCamarilla",
                "propertyName": "s1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Camarilla",
                "product": "Pivot-Points-Camarilla",
                "objectName": "PivotCamarilla",
                "propertyName": "r4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Camarilla",
                "product": "Pivot-Points-Camarilla",
                "objectName": "PivotCamarilla",
                "propertyName": "r3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Camarilla",
                "product": "Pivot-Points-Camarilla",
                "objectName": "PivotCamarilla",
                "propertyName": "r2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Camarilla",
                "product": "Pivot-Points-Camarilla",
                "objectName": "PivotCamarilla",
                "propertyName": "r1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Camarilla",
                "product": "Pivot-Points-Camarilla",
                "objectName": "PivotCamarilla",
                "propertyName": "pivot",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Denmark",
                "product": "Pivot-Points-Denmark",
                "objectName": "PivotDenmark",
                "propertyName": "s1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Denmark",
                "product": "Pivot-Points-Denmark",
                "objectName": "PivotDenmark",
                "propertyName": "r1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Pivot-Points-Denmark",
                "product": "Pivot-Points-Denmark",
                "objectName": "PivotDenmark",
                "propertyName": "pivot",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Key-Levels",
                "objectName": "KeyLevel",
                "propertyName": "yearly",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Key-Levels",
                "objectName": "KeyLevel",
                "propertyName": "quarterly",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Key-Levels",
                "objectName": "KeyLevel",
                "propertyName": "monthly",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Key-Levels",
                "objectName": "KeyLevel",
                "propertyName": "weekly",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Key-Levels",
                "objectName": "KeyLevel",
                "propertyName": "daily",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "yearlyPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "quarterlyPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "monthlyPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "weeklyPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "dailyPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "yearly",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "quarterly",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "monthly",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "weekly",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-Key-Levels",
                "objectName": "PrevKeyLevel",
                "propertyName": "daily",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "yearlyLowPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "yearlyHighPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "quarterLowPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "quarterHighPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "monthlyLowPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "monthlyHighPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "weeklyLowPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "weeklyHighPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "dailyLowPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pivots",
                "indicator": "Key-Levels",
                "product": "Previous-HL-Key-Levels",
                "objectName": "PrevHLKeyLevel",
                "propertyName": "dailyHighPrev",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "Fisher",
                "product": "Fisher",
                "objectName": "Fisher",
                "propertyName": "trigger",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "Fisher",
                "product": "Fisher",
                "objectName": "Fisher",
                "propertyName": "fisher",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "HMA",
                "product": "HMA",
                "objectName": "HMA",
                "propertyName": "hma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "McGinley",
                "product": "MD",
                "objectName": "MD",
                "propertyName": "closePrice",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "McGinley",
                "product": "MD",
                "objectName": "MD",
                "propertyName": "md",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "WMA",
                "product": "WMA",
                "objectName": "WMA",
                "propertyName": "closePrice",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "WMA",
                "product": "WMA",
                "objectName": "WMA",
                "propertyName": "wma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "Volume-WMA",
                "product": "VWMA",
                "objectName": "VWMA",
                "propertyName": "closePrice",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "Volume-WMA",
                "product": "VWMA",
                "objectName": "VWMA",
                "propertyName": "vwma",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "low6",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "low5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "low4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "low3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "low2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "low1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "up6",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "up5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "up4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "up3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "up2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "up1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "fibBB",
                "product": "fibBB",
                "objectName": "fibBB",
                "propertyName": "basis",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "MAMA",
                "product": "MAMA",
                "objectName": "MAMA",
                "propertyName": "closePrice",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "MAMA",
                "product": "MAMA",
                "objectName": "MAMA",
                "propertyName": "fama",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Pluvtech",
                "indicator": "MAMA",
                "product": "MAMA",
                "objectName": "MAMA",
                "propertyName": "mama",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "sRVI",
                "product": "sRVI",
                "objectName": "sRVI",
                "propertyName": "trigger",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "sRVI",
                "product": "sRVI",
                "objectName": "sRVI",
                "propertyName": "sRVI",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "sRVI",
                "product": "sRVIoneline",
                "objectName": "sRVIoneline",
                "propertyName": "sRVI",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "sRVI",
                "product": "sRVIoneline",
                "objectName": "sRVIoneline",
                "propertyName": "trigger",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "sfRVI",
                "product": "sfRVI",
                "objectName": "sfRVI",
                "propertyName": "trigger",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "sfRVI",
                "product": "sfRVI",
                "objectName": "sfRVI",
                "propertyName": "sfRVI",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "sfRVI",
                "product": "sfRVIoneline",
                "objectName": "sfRVIoneline",
                "propertyName": "trigger",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "sfRVI",
                "product": "sfRVIoneline",
                "objectName": "sfRVIoneline",
                "propertyName": "sfRVI",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "aRVI",
                "product": "aRVI",
                "objectName": "aRVI",
                "propertyName": "trigger",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "RelativeVigorIndex",
                "indicator": "aRVI",
                "product": "aRVI",
                "objectName": "aRVI",
                "propertyName": "aRVI",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Schaff_Trend_Cycle",
                "indicator": "STC",
                "product": "STC",
                "objectName": "STC",
                "propertyName": "STC",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bearBoxFourBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bearBoxFourTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bearBoxThreeBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bearBoxThreeTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bullBoxFourBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bullBoxFourTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bullBoxThreeBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bullBoxThreeTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bearBoxTwoTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bearBoxTwoBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bearBoxOneBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bearBoxOneTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bullBoxTwoTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bullBoxTwoBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bullBoxOneBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "orderBlock",
                "product": "OB",
                "objectName": "OB",
                "propertyName": "bullBoxOneTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bearBoxFourBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bearBoxFourTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bearBoxThreeBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bearBoxThreeTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bullBoxFourBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bullBoxFourTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bullBoxThreeBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bullBoxThreeTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bearBoxTwoTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bearBoxTwFVGottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bearBoxOneBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bearBoxOneTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bullBoxTwoTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bullBoxTwFVGottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bullBoxOneBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "fairValueGap",
                "product": "FVG",
                "objectName": "FVG",
                "propertyName": "bullBoxOneTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bearBoxFourBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bearBoxFourTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bearBoxThreeBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bearBoxThreeTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bullBoxFourBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bullBoxFourTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bullBoxThreeBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bullBoxThreeTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bearBoxTwoTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bearBoxTwBOSottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bearBoxOneBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bearBoxOneTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bullBoxTwoTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bullBoxTwBOSottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bullBoxOneBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "BreakOfStructureBlock",
                "product": "BOS",
                "objectName": "BOS",
                "propertyName": "bullBoxOneTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleLoPrevLoc",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleHiPrevLoc",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleLowLoc",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleHighLoc",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleLowValPrev",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleHighValPrev",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleLowVal",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "HL-Pivot-Points",
                "product": "HL-Pivot-Points",
                "objectName": "HLpivot",
                "propertyName": "candleHighVal",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bearBoxFourBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bearBoxFourTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bearBoxThreeBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bearBoxThreeTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bullBoxFourBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bullBoxFourTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bullBoxThreeBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bullBoxThreeTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bearBoxTwoTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bearBoxTwRJBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bearBoxOneBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bearBoxOneTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bullBoxTwoTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bullBoxTwRJBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bullBoxOneBottom",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "rejectionBlock",
                "product": "RJB",
                "objectName": "RJB",
                "propertyName": "bullBoxOneTop",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "PPDD",
                "product": "PPDD",
                "objectName": "PPDD",
                "propertyName": "plotDD",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "PPDD",
                "product": "PPDD",
                "objectName": "PPDD",
                "propertyName": "plotPP",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "PPDD",
                "product": "PPDD",
                "objectName": "PPDD",
                "propertyName": "DDweak",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "PPDD",
                "product": "PPDD",
                "objectName": "PPDD",
                "propertyName": "DDstrong",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "PPDD",
                "product": "PPDD",
                "objectName": "PPDD",
                "propertyName": "PPweak",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "PPDD",
                "product": "PPDD",
                "objectName": "PPDD",
                "propertyName": "PPstrong",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "highVolumeBar",
                "product": "HVB",
                "objectName": "HVB",
                "propertyName": "bearHVB",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Smart_Money",
                "indicator": "highVolumeBar",
                "product": "HVB",
                "objectName": "HVB",
                "propertyName": "bullHVB",
                "range": [
                    
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Popular-SMAs",
                "objectName": "popularSMA",
                "propertyName": "sma200",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Popular-SMAs",
                "objectName": "popularSMA",
                "propertyName": "sma100",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Popular-SMAs",
                "objectName": "popularSMA",
                "propertyName": "sma50",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Popular-SMAs",
                "objectName": "popularSMA",
                "propertyName": "sma20",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma1400",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma700",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma350",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma280",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma210",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma140",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma70",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma35",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma28",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma21",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma14",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base7-SMAs",
                "objectName": "base7SMA",
                "propertyName": "sma7",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base11-SMAs",
                "objectName": "base11SMA",
                "propertyName": "sma111",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base11-SMAs",
                "objectName": "base11SMA",
                "propertyName": "sma55",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base11-SMAs",
                "objectName": "base11SMA",
                "propertyName": "sma33",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base11-SMAs",
                "objectName": "base11SMA",
                "propertyName": "sma22",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base11-SMAs",
                "objectName": "base11SMA",
                "propertyName": "sma11",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma1000",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma500",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma250",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma200",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma150",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma100",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma50",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma25",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma20",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma15",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma10",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base5-SMAs",
                "objectName": "base5SMA",
                "propertyName": "sma5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma1200",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma600",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma300",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma240",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma180",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma120",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma60",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma30",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma24",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma18",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma12",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "SMA",
                "product": "Base6-SMAs",
                "objectName": "base6SMA",
                "propertyName": "sma6",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Popular-EMAs",
                "objectName": "popularEMA",
                "propertyName": "ema200",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Popular-EMAs",
                "objectName": "popularEMA",
                "propertyName": "ema100",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Popular-EMAs",
                "objectName": "popularEMA",
                "propertyName": "ema50",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Popular-EMAs",
                "objectName": "popularEMA",
                "propertyName": "ema20",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema1000",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema500",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema250",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema200",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema150",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema100",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema50",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema25",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema20",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema15",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema10",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base5-EMAs",
                "objectName": "base5EMA",
                "propertyName": "ema5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema1400",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema700",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema350",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema280",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema210",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema140",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema70",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema35",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema28",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema21",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema14",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base7-EMAs",
                "objectName": "base7EMA",
                "propertyName": "ema7",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base11-EMAs",
                "objectName": "base11EMA",
                "propertyName": "ema111",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base11-EMAs",
                "objectName": "base11EMA",
                "propertyName": "ema55",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base11-EMAs",
                "objectName": "base11EMA",
                "propertyName": "ema33",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base11-EMAs",
                "objectName": "base11EMA",
                "propertyName": "ema22",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "EMA",
                "product": "Base11-EMAs",
                "objectName": "base11EMA",
                "propertyName": "ema11",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "MACD",
                "product": "MACD-122609",
                "objectName": "macd122609",
                "propertyName": "histogram",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "MACD",
                "product": "MACD-031016",
                "objectName": "macd031016",
                "propertyName": "histogram",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "MACD",
                "product": "MACD-081709",
                "objectName": "macd081709",
                "propertyName": "histogram",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "MACD",
                "product": "MACD-245209",
                "objectName": "macd245209",
                "propertyName": "histogram",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Sparta",
                "indicator": "RSI",
                "product": "RSI-14",
                "objectName": "rsi14",
                "propertyName": "value",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Trends",
                "indicator": "KAMA",
                "product": "KAMA-ind",
                "objectName": "KAMA",
                "propertyName": "value",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Turtles",
                "indicator": "Turtle",
                "product": "Turtle-S1",
                "objectName": "turtleS1",
                "propertyName": "direction",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Turtles",
                "indicator": "Turtle",
                "product": "Turtle-S1",
                "objectName": "turtleS1",
                "propertyName": "exit",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Turtles",
                "indicator": "Turtle",
                "product": "Turtle-S1",
                "objectName": "turtleS1",
                "propertyName": "trend",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Turtles",
                "indicator": "Turtle",
                "product": "Turtle-S1",
                "objectName": "turtleS1",
                "propertyName": "exitLow",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Turtles",
                "indicator": "Turtle",
                "product": "Turtle-S1",
                "objectName": "turtleS1",
                "propertyName": "exitHighi",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Turtles",
                "indicator": "Turtle",
                "product": "Turtle-S1",
                "objectName": "turtleS1",
                "propertyName": "entryLow",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Turtles",
                "indicator": "Turtle",
                "product": "Turtle-S1",
                "objectName": "turtleS1",
                "propertyName": "entryHigh",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "EMA",
                "objectName": "EMA",
                "propertyName": "ema5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "EMA",
                "objectName": "EMA",
                "propertyName": "ema4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "EMA",
                "objectName": "EMA",
                "propertyName": "ema3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "EMA",
                "objectName": "EMA",
                "propertyName": "ema2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "EMA",
                "objectName": "EMA",
                "propertyName": "ema1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "MBO",
                "objectName": "MBO",
                "propertyName": "MBO5",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "MBO",
                "objectName": "MBO",
                "propertyName": "MBO4",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "MBO",
                "objectName": "MBO",
                "propertyName": "MBO3",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "MBO",
                "objectName": "MBO",
                "propertyName": "MBO2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "MeanBreakout",
                "product": "MBO",
                "objectName": "MBO",
                "propertyName": "MBO1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "T2I",
                "product": "T2I",
                "objectName": "T2I",
                "propertyName": "t2i2",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "T2I",
                "product": "T2I",
                "objectName": "T2I",
                "propertyName": "t2i1",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "BetterSineWave",
                "product": "BSV6",
                "objectName": "BSV6",
                "propertyName": "bsv6",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "BetterSineWave",
                "product": "BSV36",
                "objectName": "BSV36",
                "propertyName": "bsv36",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "Ratio_Momentum",
                "product": "RMO",
                "objectName": "RMO",
                "propertyName": "ratio",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "WEMA_signal",
                "product": "WEMAsignal",
                "objectName": "WEMAsignal",
                "propertyName": "color",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "WEMA_signal",
                "product": "WEMAsignal",
                "objectName": "WEMAsignal",
                "propertyName": "filtered",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Weighted_EMA_cross_strategy",
                "indicator": "WEMA_signal",
                "product": "WEMAsignal",
                "objectName": "WEMAsignal",
                "propertyName": "signal",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Zeus",
                "indicator": "DMI",
                "product": "DMI",
                "objectName": "DMI",
                "propertyName": "adx",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Zeus",
                "indicator": "DMI",
                "product": "DMI",
                "objectName": "DMI",
                "propertyName": "minusDI",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "Zeus",
                "indicator": "DMI",
                "product": "DMI",
                "objectName": "DMI",
                "propertyName": "plusDI",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "quantum",
                "indicator": "HARSI",
                "product": "HARSI",
                "objectName": "harsi",
                "propertyName": "StochD",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "quantum",
                "indicator": "HARSI",
                "product": "HARSI",
                "objectName": "harsi",
                "propertyName": "StochK",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "quantum",
                "indicator": "HARSI",
                "product": "HARSI",
                "objectName": "harsi",
                "propertyName": "HaMin",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "quantum",
                "indicator": "HARSI",
                "product": "HARSI",
                "objectName": "harsi",
                "propertyName": "HaMax",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "quantum",
                "indicator": "HARSI",
                "product": "HARSI",
                "objectName": "harsi",
                "propertyName": "HaClose",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "quantum",
                "indicator": "HARSI",
                "product": "HARSI",
                "objectName": "harsi",
                "propertyName": "HaOpen",
                "range": [
                    "OFF"
                ]
            },
            {
                "dataMine": "quantum",
                "indicator": "HARSI",
                "product": "HARSI",
                "objectName": "harsi",
                "propertyName": "rsi",
                "range": [
                    "OFF"
                ]
            }
        ]
    },
    "librariesIndicators": [],
    "parametersRanges": {
        "LIST_OF_ASSETS": [
            [
                "BTC"
            ]
        ],
        "LIST_OF_TIMEFRAMES": [
            [
                "01-hs"
            ]
        ],
        "NUMBER_OF_LAG_TIMESTEPS": [
            10
        ],
        "PERCENTAGE_OF_DATASET_FOR_TRAINING": [
            80
        ],
        "NUMBER_OF_EPOCHS": [
            750
        ],
        "NUMBER_OF_LSTM_NEURONS": [
            50
        ]
      }
    }

</details>
