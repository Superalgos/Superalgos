/* The Zoom is the factor that amplifies the current container coordinates, and everything included in that container. */


function newZoom() {

    var zoom = {
        containerName: "",          // This is for debugging purposes only.
        parentZoom: undefined,      // Here we store the parent cointainer zoom object. 
        container: undefined,
        levelX: 0,                  // this is the actual zoom level on the x axis.
        incrementX: 0.1,
        levelY: 0,
        incrementY: 0.1,
        levelR: -15,
        incrementR: 0.05,
        levelM: -15,
        incrementM: 0.05,
        xyZoom: xyZoom,
        xZoom: xZoom,
        yZoom: yZoom,
        rZoom: rZoom,
        mZoom: mZoom,
        zoomThisPoint: zoomThisPoint,
        unzoomThisPoint: unzoomThisPoint,
        stack: stack,
        level: level

    };

    return zoom;

    function xyZoom(amount) {

        var tempZoom = newZoom();
        tempZoom.levelX = this.levelX + amount;
        tempZoom.levelY = this.levelY + amount;
        tempZoom.container = this.container;
        tempZoom.parentZoom = this.parentZoom;

        if (this.container.frame.canYouZoomHere(tempZoom)) {

            /* Now we displace */

            this.levelX = this.levelX + amount;
            this.levelY = this.levelY + amount;

            if (this.levelX < -50) {
                this.levelX = -50;          // There is a minimun zoom level.
            }

            if (this.levelY < -50) {
                this.levelY = -50;          // There is a minimun zoom level.
            }

            return true;
        }

        return false;

    }

    function xZoom(amount) {

        this.levelX = this.levelX + amount;

        if (this.levelX < -10) {
            this.levelX = -10;          // There is a minimun zoom level.
        }
        updateBallsTargets();

    }

    function yZoom(amount) {

        this.levelY = this.levelY + amount;

        if (this.levelY < -10) {
            this.levelY = -10;          // There is a minimun zoom level.
        }
        updateBallsTargets();

    }


    function rZoom(amount) {

        this.levelR = this.levelR + amount;

        var zoomLimit = - 1 / this.incrementR;

        if (zoom.levelR <= zoomLimit + 1) {
            zoom.levelR = zoomLimit + 2;          // There is a minimun zoom level.
        }
        updateBallsTargets();

    }

    function mZoom(amount) {

        this.levelM = this.levelM + amount;

        var zoomLimit =  - 1 / this.incrementM;

        if (zoom.levelM <= zoomLimit + 1) {
            zoom.levelM = zoomLimit + 2;          // There is a minimun zoom level.
        }
        updateBallsTargets();

    }

    function zoomThisPoint(point) {

        if (this.parentZoom !== undefined) {

            point = this.parentZoom.zoomThisPoint(point);

        }

        /* The zoom center is needed to calculate the zoom for each point within this container. */

        zoomAxisCenter = {
            x: this.container.frame.width / 2,
            y: this.container.frame.height / 2
        }

        /* Guess what? yes, the axis center itself must be framed and displaced before being used.*/

        zoomAxisCenter = this.container.frame.frameThisPoint(zoomAxisCenter);
        zoomAxisCenter = this.container.displacement.displaceThisPoint(zoomAxisCenter);

        var diffX = point.x - zoomAxisCenter.x ;

        point.x = zoomAxisCenter.x + diffX + diffX * this.incrementX * this.levelX;

        var diffY = point.y - zoomAxisCenter.y;

        point.y = zoomAxisCenter.y + diffY + diffY * this.incrementY * this.levelY;

        return point;
    }

    function unzoomThisPoint(pointWithZoom) {

        if (this.parentZoom !== undefined) {

            pointWithZoom = this.parentZoom.unzoomThisPoint(pointWithZoom);

        }

        /* The zoom center is needed to calculate the zoom for each point within this container. */

        zoomAxisCenter = {
            x: this.container.frame.width / 2,
            y: this.container.frame.height / 2
        }

        /* Guess what? yes, the axis center itself must be framed and displaced before being used.*/

        zoomAxisCenter = this.container.frame.frameThisPoint(zoomAxisCenter);
        zoomAxisCenter = this.container.displacement.displaceThisPoint(zoomAxisCenter);

        var pointWithoutZoom = {
            x: 0,
            y: 0
        }

        pointWithoutZoom.x = (pointWithZoom.x - zoomAxisCenter.x) / (1 + this.incrementX * this.levelX) + zoomAxisCenter.x;
        pointWithoutZoom.y = (pointWithZoom.y - zoomAxisCenter.y) / (1 + this.incrementY * this.levelY) + zoomAxisCenter.y;

        return pointWithoutZoom;

    }




    function level() {

        /* This function provides a sense of the zoom level all through the stack of containers object's zoom. */

        var fullLevel = 0;

        if (this.parentZoom !== undefined) {

            fullLevel = this.parentZoom.level();

        }

        fullLevel = fullLevel + (this.levelX + this.levelY) / 2;

        return fullLevel;
    }

    function stack() {

        /* This function provides the factor by which the stack of cointainers need to be multiplied to aquire the final zoom. */

        var fullStack = {
            x: 1,
            y: 1
        }

        if (this.parentZoom !== undefined) {

            fullStack = this.parentZoom.stack();

        }

        fullStack.x = fullStack.x + fullStack.x * this.levelX * this.incrementX;
        fullStack.y = fullStack.y + fullStack.y * this.levelY * this.incrementY;

        return fullStack;
    }
}







