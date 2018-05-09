

function newContainer() {

    var container = {
        frame: undefined,
        displacement: undefined,
        eventHandler: undefined,
        parentContainer: undefined,
        isDraggeable: true,
        isClickeable: false,
        isWheelable: false,
        name: undefined,
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
        eventHandler.name = container.name;
        this.eventHandler = eventHandler;

        var displacement = newDisplacement();
        this.displacement = displacement;
        displacement.container = container;

    }
}