


/* User Interface Colors */

UI_COLOR = {
    DARK: "48, 48, 54",
    LIGHT: "234, 226, 222",
    WHITE: "255, 255, 255",
    GOLDEN_ORANGE: "240, 162, 2",
    RUSTED_RED: "204, 88, 53",
    GREEN: "188, 214, 67",
    RED: "223, 70, 60",
    PATINATED_TURQUOISE: "27,153,139",
    TITANIUM_YELLOW: "244,228,9",
    MANGANESE_PURPLE: "91,80,122"
};

/* User Interface Fonts */

UI_FONT = {
    PRIMARY: "Saira",
    SECONDARY: "Source Code Pro"
};

FONT_ASPECT_RATIO = 0.50;

/* User Interface Panels */

UI_PANEL = {
    WIDTH: {
        SMALL: 100,
        NORMAL: 150,
        LARGE: 350
    },
    HEIGHT: {
        SMALL: 65,
        NORMAL: 300,
        LARGE: 450
    }
};


/* The Dashboard is the root object that contains all the other stuff in it. Some of that stuff is visible, some other is invisible. */

let canvas;
let markets;  
let ecosystem = newEcosystem();

let marketFilesPeriods =
    '[' +
    '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
    '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
    '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
    '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
    '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
    '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
    '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
    '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']';

marketFilesPeriods = JSON.parse(marketFilesPeriods);

let dailyFilePeriods =
    '[' +
    '[' + 45 * 60 * 1000 + ',' + '"45-min"' + ']' + ',' +
    '[' + 40 * 60 * 1000 + ',' + '"40-min"' + ']' + ',' +
    '[' + 30 * 60 * 1000 + ',' + '"30-min"' + ']' + ',' +
    '[' + 20 * 60 * 1000 + ',' + '"20-min"' + ']' + ',' +
    '[' + 15 * 60 * 1000 + ',' + '"15-min"' + ']' + ',' +
    '[' + 10 * 60 * 1000 + ',' + '"10-min"' + ']' + ',' +
    '[' + 05 * 60 * 1000 + ',' + '"05-min"' + ']' + ',' +
    '[' + 04 * 60 * 1000 + ',' + '"04-min"' + ']' + ',' +
    '[' + 03 * 60 * 1000 + ',' + '"03-min"' + ']' + ',' +
    '[' + 02 * 60 * 1000 + ',' + '"02-min"' + ']' + ',' +
    '[' + 01 * 60 * 1000 + ',' + '"01-min"' + ']' + ']';

dailyFilePeriods = JSON.parse(dailyFilePeriods);

function convertTimePeriodToName(pTimePeriod) {

    for (let i = 0; i < dailyFilePeriods.length; i++) {

        let period = dailyFilePeriods[i];

        if (period[0] === pTimePeriod) {

            return period[1];

        }
    }

    for (let i = 0; i < marketFilesPeriods.length; i++) {

        let period = marketFilesPeriods[i];

        if (period[0] === pTimePeriod) {

            return period[1];

        }
    }
}


let cloudVM = newCloudVM();
window.AT_BREAKPOINT = false;

const DEBUG_START_UP_DELAY = 0 //3000; // This is a waiting time in case there is a need to debug the very first steps of initialization, to be able to hit F12 on time.
const INITIAL_DEFAULT_MARKET = 2;       // This is the market that will be shown when loading the site for the first time.
const DEFAULT_EXCHANGE = "Poloniex";
const DEFAULT_MARKET = {
    assetA: "USDT",
    assetB: "BTC",
};

const USDT_BTC_HTH = 19900; // This is needed to know the scale of the market time line. 

const WIDHTER_VOLUME_BAR_BASE_FACTOR = 2.5;
const LESS_WIDHTER_VOLUME_BAR_TOP_FACTOR = 1 / 4;

const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
const _12_HOURS_IN_MILISECONDS = 12 * 60 * 60 * 1000;
const _8_HOURS_IN_MILISECONDS = 8 * 60 * 60 * 1000;
const _6_HOURS_IN_MILISECONDS = 6 * 60 * 60 * 1000;
const _4_HOURS_IN_MILISECONDS = 4 * 60 * 60 * 1000;
const _3_HOURS_IN_MILISECONDS = 3 * 60 * 60 * 1000;
const _2_HOURS_IN_MILISECONDS = 2 * 60 * 60 * 1000;
const _1_HOUR_IN_MILISECONDS = 1 * 60 * 60 * 1000;

const _45_MINUTES_IN_MILISECONDS = 45 * 60 * 1000;
const _40_MINUTES_IN_MILISECONDS = 40 * 60 * 1000;
const _30_MINUTES_IN_MILISECONDS = 30 * 60 * 1000;
const _20_MINUTES_IN_MILISECONDS = 20 * 60 * 1000;
const _15_MINUTES_IN_MILISECONDS = 15 * 60 * 1000;
const _10_MINUTES_IN_MILISECONDS = 10 * 60 * 1000;
const _5_MINUTES_IN_MILISECONDS = 5 * 60 * 1000;
const _4_MINUTES_IN_MILISECONDS = 4 * 60 * 1000;
const _3_MINUTES_IN_MILISECONDS = 3 * 60 * 1000;
const _2_MINUTES_IN_MILISECONDS = 2 * 60 * 1000;
const _1_MINUTE_IN_MILISECONDS = 1 * 60 * 1000;

const EARLIEST_DATE = new Date(2014, 0, 18, 4, 26, 8);

const CHART_ASPECT_RATIO = 1 / 10;

let INITIAL_ZOOM_LEVEL = -26;       // This is the zoom level at the view port in which the APP starts.
let INITIAL_TIME_PERIOD = recalculatePeriod(INITIAL_ZOOM_LEVEL);  // This value will be overwritten at the viewPort.initialize if the user had a prevous session with this same browser.

const TOP_SPACE_HEIGHT = 50;
const BOTTOM_SPACE_HEIGHT = 50;
var viewPort = newViewPort();



const PRODUCT_CARD_STATUS = {
    ON: 'on',
    LOADING: 'loading',
    OFF: 'off'
};

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

let INITIAL_DATE = new Date();  // This value will be overwritten at the viewPort.initialize if the user had a prevous session with this same browser.

var maxDate = new Date();
maxDate.setMilliseconds(0);
maxDate.setDate(maxDate.getDate() + 10);

const MAX_PLOTABLE_DATE = maxDate;

function dashboardStart() {

    setTimeout(start, DEBUG_START_UP_DELAY);    
    
}


function start() {

    const ID_EXCHANGE_POLONIEX = 1;

    /* For now, we are supporting only one market. */

    let market = {
        id: 2,
        assetA: "USDT",
        assetB: "BTC"
    };

    markets = new Map(); 

    markets.set(market.id, market);

    canvas = newCanvas();
    canvas.initialize();

}

