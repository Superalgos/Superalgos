# Raspberry Pi Installations

Raspberry Pi's are a great platform for installing SuperAlgos as a production trading bot, but this only recommended for live trading with minimal UI use.

## Installation guide

### Requirements

1. Follow the developer instructions on the (main readme)[https://github.com/Superalgos/Superalgos#small_orange_diamond-installation-for-developers-and-contributors] except for installing chrome, you don't want this clogging up your pi as we're going to use remote access anyway!
2. When installing node on the pi it is usually easier to install with [nvm](https://github.com/nvm-sh/nvm).
2. Now you can run `node platform minMemo noBrowser` and you should see some successfull output in your command line.
3. Open a browser on a different machine connected to your network and navigate your pi's address with port 34248 to start the UI. For me this is http://192.168.0.132:34248

### Optional requirements

- A Webserver for reverse proxy I will cover (NGINX)[https://www.nginx.com/resources/wiki/start/topics/tutorials/install/] here as an example
- Process manager I will cover (PM2)[https://pm2.keymetrics.io/docs/usage/quick-start/] here as an example

#### NGINX

If you don't want to remember the port number then you can setup a reverse proxy, having followed the NGINX install guide you can edit the file */etc/nginx/sites-enabled/default* and add a new location of your choice

```conf
server {
    ...
    location /superalgos/ {
        proxy_pass http://localhost:34248/;
    }
}
```
Save the file and restart nginx `sudo service nginx restart`.

This will now allow you to navigate to the url instead of the port.

#### PM2

PM2 is a node based process manager. Using this will mean you run Superalgos permanently on the pi without having it bound to your terminal window. My prefered way to set this up is with the *ecosystem.config.js* file in my home directory which can be used to hold many different process configurations.

```Javascript
module.exports = {
  apps : [{
    name   : "sa", //A process name of your choice
    script : "platform.js", //The start script
    args: "minMemo noBrowser", //Process arguments needed for optimal pi ioperation
    cwd: "/home/pi/trading/Superalgos/" //Directory to execute the process in -- this is where the node_modules folder needs to be
  }]
}
```

With this setup you can now start and stop the process at will. A word of warning, if you're making code changes or merging in *upstream* updates then you will need to restart the app `pm2 restart sa`. You can also tail view the logs `pm2 logs sa`