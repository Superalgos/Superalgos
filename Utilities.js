

function transformThisPoint(point, container) {

    /* We make the point relative to the current frame */

    point = container.frame.frameThisPoint(point);

    /* We add the possible displacement */

    point = container.displacement.displaceThisPoint(point);

    /* We apply the zoom factor. */

    point = container.zoom.zoomThisPoint(point);

    /* We viewport Transformation. */

    point = viewPort.zoomThisPoint(point);

    return point;
}

function unTransformThisPoint(point, container) {

    point = viewPort.unzoomThisPoint(point);
    point = container.zoom.unzoomThisPoint(point);
    point = container.displacement.undisplaceThisPoint(point);
    point = container.frame.unframeThisPoint(point);

    return point;
}

function nextPorwerOf10(number) {

    for (let i = -10; i <= 10; i++) {
        if (number < Math.pow(10, i)) {
            return Math.pow(10, i);
        }
    }
}

function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

function getDateFromPoint(point, container, timeLineCoordinateSystem) {

    point = unTransformThisPoint(point, container);
    point = timeLineCoordinateSystem.unInverseTransform(point, container.frame.height);

    let date = new Date(point.x);

    return date;
}


function getRateFromPoint(point, container, timeLineCoordinateSystem) {

    point = unTransformThisPoint(point, container);
    point = timeLineCoordinateSystem.unInverseTransform(point, container.frame.height);

    return point.y;
}


function getMilisecondsFromPoint(point, container, timeLineCoordinateSystem) {

    point = unTransformThisPoint(point, container);
    point = timeLineCoordinateSystem.unInverseTransform(point, container.frame.height);

    return point.x;
}


function removeTime(datetime) {

    if (datetime === undefined) { return;}

    let dateOnly = new Date(Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS);

    return dateOnly;
}