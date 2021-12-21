exports.startExpress = (port, SA, DK) => {

    const webAppInterface = DK.projects.socialTrading.modules.webAppInterface.newSocialTradingModulesWebAppInterface();

    const App = require('./app');
    let PostsController = require('./controllers/posts.controller');
    let UsersController = require('./controllers/users.controller');

    const app = new App(
    [
        new PostsController(SA, webAppInterface),
        new UsersController(SA, webAppInterface)
    ],
    port,
    );
    
    app.listen();

}