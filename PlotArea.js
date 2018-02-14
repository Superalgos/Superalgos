/*

The Plot Area object is responsible for defining the area of a data set that is going to be plotted and
to the scales that actual values must be multiplied by in order to fit into a certain space.

*/

function newPlotArea() {

    var plotArea = {
        min: undefined,                     
        max: undefined,                     
        scale: undefined, 
        inverseTransform: inverseTransform,
        inverseTransform2: inverseTransform2,
        unInverseTransform: unInverseTransform,
        inverseTransformUncappedY: inverseTransformUncappedY,
        initializeX: initializeX,
        initializeY: initializeY,
        initialize: initialize
    };

    var min = {
        x: 0,
        y: 0
    };

    var max = {
        x: 0,
        y: 0
    };

    var scale = {
        x: 0,
        y: 0
    };

    plotArea.min = min;
    plotArea.max = max;
    plotArea.scale = scale;

    return plotArea;

    function initialize(minValue, maxValue, maxWidth, maxHeight) {

        /* Defines the min and max value of rate that we are going to transport to the available screen at the center position. */

        plotArea.min.x = minValue.x; // * 0.999; // 0.1% less
        plotArea.max.x = maxValue.x; // * 1.001; // 0.1% more

        plotArea.min.y = minValue.y; // * 0.999; // 0.1% less
        plotArea.max.y = maxValue.y; // * 1.001; // 0.1% more

        /* Defines the initial Zoom level at center position. */

        plotArea.scale.x = maxWidth / (plotArea.max.x - plotArea.min.x);
        plotArea.scale.y = maxHeight / (plotArea.max.y - plotArea.min.y);

    }

    function initializeX(minValue, maxValue, maxWidth) {

        plotArea.min.x = minValue.x; // * 0.999; // 0.1% less
        plotArea.max.x = maxValue.x; // * 1.001; // 0.1% more

        plotArea.scale.x = maxWidth / (plotArea.max.x - plotArea.min.x);

    }

    function initializeY(minValue, maxValue, maxHeight) {

        plotArea.min.y = minValue.y; // * 0.999; // 0.1% less
        plotArea.max.y = maxValue.y; // * 1.001; // 0.1% more

        plotArea.scale.y = maxHeight / (plotArea.max.y - plotArea.min.y);

    }


    function inverseTransform(point, inverseY) {

        point = {
            x: (point.x - this.min.x) * this.scale.x,
            y: inverseY - (point.y - this.min.y) * this.scale.y
        };

        return point;
    }


    function inverseTransform2(point, inverseY) {

        point = {
            x: (point.x - this.min.x) * this.scale.x,
            y: (inverseY - point.y - this.min.y) * this.scale.y
        };

        return point;
    }


    function unInverseTransform(point, inverseY) {

        point = {
            x: (point.x / this.scale.x) + this.min.x,
            y: (inverseY - point.y) / this.scale.y + this.min.y
        };

        return point;
    }


    function inverseTransformUncappedY(point, inverseY) {

        point = {
            x: (point.x - this.min.x) * this.scale.x,
            y: (inverseY - point.y)  * this.scale.y
        };

        return point;
    }

    


}











