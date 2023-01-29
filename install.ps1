Param(
    [Parameter(Mandatory=$true, HelpMessage="Github username")]
    [String]
    $username,
    [Parameter(Mandatory=$true, HelpMessage="Github API token")]
    [String]
    $token
)

function installGit {
    Write-Host "Please go to https://git-scm.com/download/win and install git"
}

function checkGit {
    if (Get-Command git -errorAction SilentlyContinue) {
        Write-Host ""
        Write-Host "superalgos | info | git already installed"
        Write-Host ""
        return $true
    }
    installGit
    return $false
}

function installNode {
    Write-Host "Please go to https://nodejs.org/en/download/ and install nodejs"
}

function checkNode {
    if (Get-Command node -errorAction SilentlyContinue) {
        Write-Host ""
        Write-Host "superalgos | info | nodejs already installed"
        Write-Host ""
        return $true
    }
    installNode
    return $false
}

function cloneSuperalgos {
    Write-Host ""
    Write-Host "superalgos | info | downloading application code"
    Write-Host ""
    git clone "https://github.com/$username/Superalgos.git"
}

function install {
    # install pm2 globally
    Write-Host ""
    Write-Host "superalgos | info | installing pm2 globally for process management"
    Write-Host ""
    npm install -g pm2

    Write-Host ""
    Write-Host "superalgos | info | running node setup script to run prepare the app"
    Write-Host ""
    node setup.js

    Write-Host ""
    Write-Host "superalgos | info | running node setup script to run prepare the app"
    Write-Host ""
    node setupPlugins.js $username $token

    # install the superalgos command line app
    Write-Host ""
    Write-Host "superalgos | info | installing 'superalgos' cli"
    Write-Host ""
    npm install -g . --omit=optional

    # apply security fixes to local modules
    Write-Host ""
    Write-Host "superalgos | info | applying security patches for local dependencies"
    Write-Host ""
    npm audit fix --force --omit=optional
}


if( checkGit -and checkNode ) {
    cloneSuperalgos
    cd Superalgos
    install
}