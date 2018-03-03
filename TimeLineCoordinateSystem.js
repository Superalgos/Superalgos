/*

This Object object is responsible for defining the coordinate system in a TimeLine.

The scale on the X axis depends on the time.
The scale on the Y axis depends on the data that wants to be plotted. Usually we need the Max amount on that data to generate a proper scale.

*/

function newTimeLineCoordinateSystem() {

    var thisObject = {
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

    thisObject.min = min;
    thisObject.max = max;
    thisObject.scale = scale;

    return thisObject;

    function initialize(minValue, maxValue, maxWidth, maxHeight) {

        /* Defines the min and max value of rate that we are going to transport to the available screen at the center position. */

        thisObject.min.x = minValue.x; // * 0.999; // 0.1% less
        thisObject.max.x = maxValue.x; // * 1.001; // 0.1% more

        thisObject.min.y = minValue.y; // * 0.999; // 0.1% less
        thisObject.max.y = maxValue.y; // * 1.001; // 0.1% more

        /* Defines the initial Zoom level at center position. */

        thisObject.scale.x = maxWidth / (thisObject.max.x - thisObject.min.x);
        thisObject.scale.y = maxHeight / (thisObject.max.y - thisObject.min.y);

    }

    function initializeX(minValue, maxValue, maxWidth) {

        thisObject.min.x = minValue.x; // * 0.999; // 0.1% less
        thisObject.max.x = maxValue.x; // * 1.001; // 0.1% more

        thisObject.scale.x = maxWidth / (thisObject.max.x - thisObject.min.x);

    }

    function initializeY(minValue, maxValue, maxHeight) {

        thisObject.min.y = minValue.y; // * 0.999; // 0.1% less
        thisObject.max.y = maxValue.y; // * 1.001; // 0.1% more

        thisObject.scale.y = maxHeight / (thisObject.max.y - thisObject.min.y);

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











