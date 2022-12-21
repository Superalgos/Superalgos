#!/bin/sh

install() {
    # install pm2 globally
    echo ""
    echo "superalgos | info | installing pm2 globally for process management"
    echo ""
    npm install -g pm2

    # install all the local modules
    echo ""
    echo "superalgos | info | installing local node dependencies"
    echo ""
    npm install

    # apply security fixes to local modules
    echo ""
    echo "superalgos | info | applying security patches for local dependencies"
    echo ""
    npm audit fix --force

    # install the superalgos command line app
    echo ""
    echo "superalgos | info | installing 'superalgos' cli"
    echo ""
    npm install -g .

    echo ""
    echo "superalgos | info | running node setup script to run prepare the app"
    echo ""
    node setup.js
}

if which node > /dev/null
then
    install
else
    echo ""
    echo "node is not installed, please install nodejs to run Superalgos"
    echo ""
fi
