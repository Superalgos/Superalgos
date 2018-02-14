/*

The Floating Space is the place where floating elements like balls, live and are rendered. This space has its own physics, preventing balls to overlap.

*/

var balls;                          // This is the array of balls being displayed

function newFloatingSpace() {

    var floatingSpace = {
        physicsLoop: physicsLoop,
        balls: [],
        initialize: initialize
    };

    return floatingSpace;

    function initialize() {

        balls = []; // We initialize this in order to start the calculations in a clean way.
    
    }

    function physicsLoop() {

        /* This function makes all the calculations to apply phisycs on all objects in this space. */

        for (var i = 0; i < balls.length; i++) {

            var ball = balls[i];

            /* Change position based on speed */

            ball.currentPosition.x = ball.currentPosition.x + ball.currentSpeed.x;
            ball.currentPosition.y = ball.currentPosition.y + ball.currentSpeed.y;

            /* Apply some friction to desacelerate */

            ball.currentSpeed.x = ball.currentSpeed.x * ball.friction;  // Desaceleration factor.
            ball.currentSpeed.y = ball.currentSpeed.y * ball.friction;  // Desaceleration factor.

            // Gives a minimun speed towards their taget.

            if (ball.currentPosition.x < ball.targetPosition.x) {
                ball.currentSpeed.x = ball.currentSpeed.x + .005;
            } else {
                ball.currentSpeed.x = ball.currentSpeed.x - .005;
            }

            if (ball.currentPosition.y < ball.targetPosition.y) {
                ball.currentSpeed.y = ball.currentSpeed.y + .005;
            } else {
                ball.currentSpeed.y = ball.currentSpeed.y - .005;
            }

            // The radius also have a target.

            if (ball.currentRadius < ball.targetRadius) {
                ball.currentRadius = ball.currentRadius + .5;
            } else {
                ball.currentRadius = ball.currentRadius - .5;
            }


            /* Collision Control */

            for (var k = i + 1; k < balls.length; k++) {

                if (colliding(balls[i], balls[k])) {

                    resolveCollision(balls[k], balls[i]);
                }
            }

            /* Calculate repulsion force produced by all other balls */

            repulsionForce(i);

            gravityForce(ball);

        }

        for (var i = 0; i < balls.length; i++) {
            var ball = balls[i];
            ball.drawBackground();
        }

        for (var i = 0; i < balls.length; i++) {
            var ball = balls[balls.length - i - 1];
            //var ball = balls[i];
            ball.drawForeground();
        }

    }

}


