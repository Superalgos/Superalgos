Param(
    [Parameter(Mandatory=$true, HelpMessage="Github username")]
    [String]
    $username,
    [Parameter(Mandatory=$true, HelpMessage="Github API token")]
    [String]
    $token
)

$nodeInstalled=$false
$gitInstalled=$false

function installGit {
    Write-Host "Please go to https://git-scm.com/download/win and install git"
}

function checkGit {
    if (Get-Command git -errorAction SilentlyContinue) {
        if ((git -v)) {
            Write-Host ""
            Write-Host "superalgos | info | git already installed"
            Write-Host ""
            $gitInstalled=$true
            return
        }
    }
    installGit
}

function installNode {
    Write-Host "Please go to https://nodejs.org/en/download/ and install nodejs"
}

function checkNode {
    if (Get-Command node -errorAction SilentlyContinue) {
        if ((node -v)) {
            Write-Host ""
            Write-Host "superalgos | info | nodejs already installed"
            Write-Host ""
            $nodeInstalled=$true
            return
        }
    }
    installNode
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

function main {
    checkGit
    checkNode
    if( $gitInstalled && $nodeInstalled ) {
        cloneSuperalgos
        install
    }
}