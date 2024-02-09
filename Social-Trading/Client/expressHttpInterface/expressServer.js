const express = require('express');
const compression = require('compression');
const cors = require('cors');
const routes = require('./routes');

exports.SocialTradingBackend = (port, SA, ST) => {
    try {

        let server;

        const app = express();

        app.use(function (req, res, next) {
            global.SA = SA;
            global.webAppInterface = ST.socialTradingApp.webAppInterface;
            next();
        });

        // parse json request body
        app.use(express.json({limit: '50mb'}));

        // parse urlencoded request body
        app.use(express.urlencoded({extended: true, limit: '50mb'}));

        // gzip compression
        app.use(compression());

        // enable cors
        app.use(cors());
        app.options('*', cors());

        // routes
        app.use('/', routes);


        server = app.listen(port, () => {
            console.log(`Listening to port ${port}`);
        });

    } catch (error) {
        console.log(error);
    }

}