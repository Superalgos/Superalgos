function install {
    # install pm2 globally
    Write-Host ""
    Write-Host "superalgos | info | installing pm2 globally for process management"
    Write-Host ""
    npm install -g pm2

    # install all the local modules
    Write-Host ""
    Write-Host "superalgos | info | installing local node dependencies"
    Write-Host ""
    npm install

    # apply security fixes to local modules
    Write-Host ""
    Write-Host "superalgos | info | applying security patches for local dependencies"
    Write-Host ""
    npm audit fix --force

    # install the superalgos command line app
    Write-Host ""
    Write-Host "superalgos | info | installing 'superalgos' cli"
    Write-Host ""
    npm install -g .

    Write-Host ""
    Write-Host "superalgos | info | running node setup script to run prepare the app"
    Write-Host ""
    node setup.js
}

if (Get-Command node -errorAction SilentlyContinue) {
    if ((node -v)) {
        install
    }
} else {
    Write-Host ""
    Write-Host "node is not installed, please install nodejs to run Superalgos"
    Write-Host ""
}