function install {
    # install pm2 globally
    Write-Host "superalgos | info | installing pm2 globally for process management\n"
    npm install -g pm2

    # install all the local modules
    Write-Host "superalgos | info | installing local node dependencies\n"
    npm install

    # apply security fixes to local modules
    Write-Host "superalgos | info | applying security patches for local dependencies\n"
    npm audit fix --force

    # install the superalgos command line app
    Write-Host "superalgos | info | installing 'superalgos' cli\n"
    npm install -g .

    Write-Host "superalgos | info | running node setup script to run prepare the app\n"
    node setup.js
}

if (Get-Command node -errorAction SilentlyContinue) {
    if ((node -v)) {
        install
    }
} else {
    Write-Host "node is not installed, please install nodejs to run Superalgos"
}