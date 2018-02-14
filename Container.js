

function newContainer() {

    var container = {
        frame: undefined,
        displacement: undefined,
        zoom: undefined,
        eventHandler: undefined,
        parentContainer: undefined,
        isDraggeable: true,
        isZoomeable: true,
        isClickeable: false,
        initialize: initialize
    };

    return container;

    function initialize() {

        var frame = newFrame();
        frame.initialize();
        this.frame = frame;
        frame.container = container;

        var eventHandler = newEventHandler();
        eventHandler.initialize();
        this.eventHandler = eventHandler;

        var displacement = newDisplacement();
        this.displacement = displacement;
        displacement.container = container;

        var zoom = newZoom();
        this.zoom = zoom;
        zoom.container = container;

    }


}