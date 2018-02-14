
/* The Dashboard is the root object that contains all the other stuff in it. Some of that stuff is visible, some other is invisible. */

var canvas;
var markets;  

var viewPort = newViewPort();

const DEBUG_START_UP_DELAY = 0 //3000; // This is a waiting time in case there is a need to debug the very first steps of initialization, to be able to hit F12 on time.
const INITIAL_DEFAULT_MARKET = 2;       // This is the market that will be shown when loading the site for the first time.

const WIDHTER_VOLUME_BAR_BASE_FACTOR = 2.5;
const LESS_WIDHTER_VOLUME_BAR_TOP_FACTOR = 1 / 4;

const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
const _12_HOURS_IN_MILISECONDS = 12 * 60 * 60 * 1000;
const _6_HOURS_IN_MILISECONDS = 6 * 60 * 60 * 1000;
const _3_HOURS_IN_MILISECONDS = 3 * 60 * 60 * 1000;
const _1_HOUR_IN_MILISECONDS = 1 * 60 * 60 * 1000;
const _30_MINUTES_IN_MILISECONDS = 30 * 60 * 1000;
const _10_MINUTES_IN_MILISECONDS = 10 * 60 * 1000;
const _5_MINUTES_IN_MILISECONDS = 5 * 60 * 1000;
const _1_MINUTE_IN_MILISECONDS = 1 * 60 * 1000;

const EARLIEST_DATE = new Date(2014, 0, 18, 4, 26, 8);
const FONT_ASPECT_RATIO = 0.60;
const CHART_ASPECT_RATIO = 1 / 10;
const INITIAL_TIME_PERIOD = _10_MINUTES_IN_MILISECONDS;

/* Here we list the valid Time Periods: */

const PERIOD_24_HS = "24-hs";
const PERIOD_12_HS = "12-hs";
const PERIOD_06_HS = "06-hs";
const PERIOD_03_HS = "03-hs";
const PERIOD_01_HS = "01-hs";
const PERIOD_30_MIN = "30-min";
const PERIOD_10_MIN = "10-min";
const PERIOD_05_MIN = "05-min";
const PERIOD_01_MIN = "01-min";

var newDate = new Date();
newDate.setMilliseconds(0);
newDate.setDate(newDate.getDate() - 90);

const INITIAL_DATE = newDate;

var maxDate = new Date();
maxDate.setMilliseconds(0);
maxDate.setDate(maxDate.getDate() + 10);

const MAX_PLOTABLE_DATE = maxDate;


var smallBalls = []; // Array of small circles for debugging purposes.

function dashboardStart() {

    setTimeout(start, DEBUG_START_UP_DELAY);    
    
}


function start() {

    const ID_EXCHANGE_POLONIEX = 1;

    var server = newFileServer();
    server.initialize();

    server.getMarkets(ID_EXCHANGE_POLONIEX, onResultSetReady);

    function onResultSetReady(resultSet) {

        markets = new Map(); 

        var totalRows = resultSet.length;

        for (var i = 0; i < totalRows; i++) {

            var row = resultSet[i];

            /* We move the information from the result set to an order object, and use that from now on. */

            market = {
                id: row[0],
                assetA: row[1],
                assetB: row[2]
            };

            markets.set(market.id, market);

        }


        canvas = newCanvas();
        canvas.initialize();

    }

}






function drawSmallBall() {

    for (var i = 0; i < smallBalls.length; i++) {

        x = smallBalls[i][0];
        y = smallBalls[i][1];
        radius = smallBalls[i][2];
        fillStyle = smallBalls[i][3];

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(x, y);
        browserCanvasContext.arc(x, y, radius, 0, Math.PI * 2, true);
        browserCanvasContext.closePath();
        browserCanvasContext.fillStyle = fillStyle;
        browserCanvasContext.fill();

    }
}


