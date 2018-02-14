/*

The chart space is where all the charts live. What this space contains is a type of object we call Time Machine. A Time Machine is a cointainer of
charts objects. The idea is simple, all the chart objects are ploted according to the time of the Time Machine object. When the time of the Time Machine 
changes, then all charts in it are replotted with the corresponging data.

*/

function newChartSpace() {

    var chartSpace = {
        container: undefined,
        draw: draw,
        timeMachines: [],
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };


    var container = newContainer();
    container.initialize();
    chartSpace.container = container;

    chartSpace.container.frame.width = browserCanvas.width * 1000;
    chartSpace.container.frame.height = browserCanvas.height * 100;

    container.displacement.containerName = "Chart Space";
    container.zoom.containerName = "Chart Space";
    container.frame.containerName = "Chart Space";

    container.frame.position.x = browserCanvas.width / 2 - chartSpace.container.frame.width / 2;
    container.frame.position.y = browserCanvas.height / 2 - chartSpace.container.frame.height / 2;

    container.isZoomeable = false;
    container.isDraggeable = false;

    return chartSpace;

    function initialize() {


        /* We create the first of many possible time machines that could live at the Chart Space. */

        var timeMachine = newTimeMachine();

        timeMachine.container.displacement.parentDisplacement = this.container.displacement;
        timeMachine.container.zoom.parentZoom = this.container.zoom;
        timeMachine.container.frame.parentFrame = this.container.frame;

        timeMachine.container.parentContainer = this.container;

        /* We make the time machine a little bit smaller than the current space. */

        timeMachine.container.frame.width = this.container.frame.width * 1;           
        timeMachine.container.frame.height = this.container.frame.height * 1;       

        timeMachine.container.frame.position.x = this.container.frame.width / 2 - timeMachine.container.frame.width / 2;   
        timeMachine.container.frame.position.y = this.container.frame.height / 2 - timeMachine.container.frame.height / 2;  

        timeMachine.initialize();

        this.timeMachines.push(timeMachine);


    }

    function draw() {

        chartSpace.container.frame.draw(false, false);

        /* When we draw the chart space, that means we draw all the time machines in it. */

        for (var i = 0; i < chartSpace.timeMachines.length;  i++ ) {

            var timeMachine = chartSpace.timeMachines[i];
            timeMachine.draw();

        }

    }

    function getContainer(point) {

        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point) === true) {

            /* Now we see which is the inner most container that has it */

            for (var i = 0; i < this.timeMachines.length; i++) {

                container = this.timeMachines[i].getContainer(point);

                if (container !== undefined) {

                    /* We found an inner container which has the point. We return it. */

                    return container;
                }
            }

            /* The point does not belong to any inner container, so we return the current container. */

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

}