


function updateBallsTargets() {

    /* Whenever there is a change in the currentZoom level, all targets needs to be recalculated in order to fit in the new plotArea. */

    for (var i = 0; i < balls.length; i++) {

        balls[i].updateMass();
        balls[i].updateRadius();
        balls[i].updatePosition();

    }
}