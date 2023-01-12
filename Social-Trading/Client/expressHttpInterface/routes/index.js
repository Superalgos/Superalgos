const express = require('express');
const userRoute = require('./user.routes');
const postRoute = require('./post.routes');
const socialRoute = require('./social.routes');

const router = express.Router();

const defaultRoutes = [
    {
        path: '/users',
        route: userRoute
    },
    {
        path: '/posts',
        route: postRoute
    },
    {
        path: '/social',
        route: socialRoute
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;