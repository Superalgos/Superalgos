/**
 * Base File: CandleTechnicalAnalisysChartLayer.js 
 */
function newLinearRegressionCurve() {
    var candles = [];
    let timePeriod = INITIAL_TIME_PERIOD;
    var plotArea = newPlotArea();
    var datetime = INITIAL_DATE;

    var linearRegressionCurveChartLayer = {
        onLayerStatusChanged: onLayerStatusChanged,
        onCandlesChanged: onCandlesChanged,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    linearRegressionCurveChartLayer.container = container;

    container.displacement.containerName = "Linear Regression Curve Chart";
    container.zoom.containerName = container.displacement.containerName;
    container.frame.containerName = container.displacement.containerName;

    let marketId;
    let exchangeId;

    let marketIndex;
    let dailyFilesCursor;

    let LRCArray15 = [];
    let LRCArray30 = [];
    let LRCArray60 = [];

    let layerStatus = 'off';

    return linearRegressionCurveChartLayer;

    function initialize(exchange, market, index, dailyFiles, chartLayersPanel) {
        marketId = market;
        exchangeId = exchange;

        marketIndex = index;
        dailyFilesCursor = dailyFiles;

        recalculateScale();

        layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.LINEAR_REGRESION_CURVE);
    }

    function getContainer(point) {
        var container;
        /* First we check if this point is inside this space. */
        if (this.container.frame.isThisPointHere(point) === true) {
            return this.container;
        } else {
            /* This point does not belong to this space. */
            return undefined;
        }
    }

    function onLayerStatusChanged(eventData) {
        if (eventData.layer === 'Linear Regression Curve')
            layerStatus = eventData.status;
    }

    function onCandlesChanged(newCandles) {
        candles = newCandles;
        recalculatePatterns();
    }

    function setTimePeriod(period) {
        timePeriod = period;
    }

    function setDatetime(newDatetime) {
        datetime = newDatetime;
    }

    function draw() {
        if (layerStatus !== 'on') return;
        this.container.frame.draw();
        plotPatternChart(LRCArray15, 'rgba(182, 190, 255, 0.95)');
        plotPatternChart(LRCArray30, 'rgba(109, 125, 255, 0.95)');
        plotPatternChart(LRCArray60, 'rgba(57, 79, 255, 0.95)');
    }

    function recalculatePatterns() {
        if (layerStatus === 'off') return;
        
        LRCArray15 = calculateLRC(15); //TODO Maybe one single for statement will be more efficient to calculate the 3 LRC at once.
        LRCArray30 = calculateLRC(30);
        LRCArray60 = calculateLRC(60);        
    }
    
    function calculateLRC(depth){
    	let LRCArray = [];
    	let lrc15 = new LRCIndicator(depth);
        for (let i = 0; i < candles.length - 1; i++) {
            let currentCandle = candles[i];
            
            let averagePrice = ( currentCandle.open + currentCandle.close ) / 2; // TODO Check which price should be take to get the LRC
            lrc15.update(averagePrice);
            
            let yValue = averagePrice;
            if(lrc15.result != false) // TODO Check the history to get correct values on the calculation
            	yValue = lrc15.result;
            
            let lrcPoint = {
                    x: currentCandle.begin,
                    y: yValue
                };
            
            LRCArray.push(lrcPoint);
        }
        return LRCArray;
    }

    function plotPatternChart(LRCArray, color) {
        if (LRCArray.length > 0) {
            for (var i = 0; i < LRCArray.length; i++) {
                let currentLRCPoint = LRCArray[i];
                let nextLRCPoint = LRCArray[i+1];
                
                if(nextLRCPoint === undefined) continue; // TODO Make sure this works well when there is data being received from the server

                currentLRCPoint = plotArea.inverseTransform(currentLRCPoint, linearRegressionCurveChartLayer.container.frame.height);
                nextLRCPoint = plotArea.inverseTransform(nextLRCPoint, linearRegressionCurveChartLayer.container.frame.height);

                currentLRCPoint = transformThisPoint(currentLRCPoint, linearRegressionCurveChartLayer.container);
                nextLRCPoint = transformThisPoint(nextLRCPoint, linearRegressionCurveChartLayer.container);

                currentLRCPoint = viewPort.fitIntoVisibleArea(currentLRCPoint);
                nextLRCPoint = viewPort.fitIntoVisibleArea(nextLRCPoint);
                
                browserCanvasContext.beginPath();
                browserCanvasContext.moveTo(currentLRCPoint.x, currentLRCPoint.y);
                browserCanvasContext.lineTo(nextLRCPoint.x, nextLRCPoint.y);
                browserCanvasContext.closePath();
                
                browserCanvasContext.strokeStyle = color;
                browserCanvasContext.fill();
                browserCanvasContext.lineWidth = 1;
                browserCanvasContext.stroke();
            }
        }
    }
    
    function recalculateScale() {
        var minValue = {
            x: EARLIEST_DATE.valueOf(),
            y: 0
        };

        var maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf(),
            y: nextPorwerOf10(marketIndex.maxRate())
        };

        plotArea.initialize(
            minValue,
            maxValue,
            linearRegressionCurveChartLayer.container.frame.width,
            linearRegressionCurveChartLayer.container.frame.height
        );
    }
}