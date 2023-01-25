#!/bin/sh

install() {
    # install pm2 globally
    echo "superalgos | info | installing pm2 globally for process management\n"
    npm install -g pm2

    # install all the local modules
    echo "superalgos | info | installing local node dependencies\n"
    npm install

    # apply security fixes to local modules
    echo "superalgos | info | applying security patches for local dependencies\n"
    npm audit fix --force

    # install the superalgos command line app
    echo "superalgos | info | installing 'superalgos' cli\n"
    npm install -g .

    echo "superalgos | info | running node setup script to run prepare the app\n"
    node setup.js
}

if which node > /dev/null
then
    install
else
    echo "node is not installed, please install nodejs to run Superalgos\n"
fi
