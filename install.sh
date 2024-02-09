#!/bin/sh

if which apt > /dev/null
then
    operator="apt"
elif which yum > /dev/null
then
    operator="yum"
fi

while getopts u:t: flag
do
    case "${flag}" in
        u) username=${OPTARG};;
        t) token=${OPTARG};;
    esac
done

if [ -z "$username" ]
then
    echo "Please supply your Github username"
fi
if [ -z "$token" ]
then
    echo "Please supply a Github token with repository write access"
fi

installed() {
    echo ""
    echo "superalgos | info | installed $1"
    echo ""
}

installGit() {
    echo ""
    echo "superalgos | info | installing git"
    echo ""
    if [ "$operator" = "apt" ]
    then
        add-apt-repository ppa:git-core/ppa
        apt update
        apt install git -y
        installed "git"
    elif [ "$operator" = "yum" ]
    then
        yum install git -y
        installed "git"
    else
        echo "superalgos | error | unable to install git on this linux distribution please contact support to see if it can be added to the install script"
        echo "===================="
        exit 1
    fi
}

installNode() {
    echo ""
    echo "superalgos | info | installing nodejs"
    echo ""
    if [ "$operator" = "apt" ]
    then
        curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - &&\
        sudo apt-get install -y nodejs
        installed "nodejs"
    elif [ "$operator" = "yum" ]
    then
        curl -sL https://rpm.nodesource.com/setup_19.x | sudo bash -
        sudo yum install nodejs
        installed "nodejs"
    else
        echo "superalgos | error | unable to install nodejs on this linux distribution please contact support to see if it can be added to the install script"
        echo "===================="
        exit 1
    fi
}

checkGit() {
    if which git > /dev/null
    then
        echo ""
        echo "superalgos | info | git already installed"
        echo ""
    else
        installGit
    fi
}

checkNode() {
    if which node > /dev/null
    then
        echo ""
        echo "superalgos | info | nodejs already installed"
        echo ""
    else
        installNode
    fi
}

cloneSuperalgos() {
    echo ""
    echo "superalgos | info | downloading application code"
    echo ""
    git clone "https://github.com/$username/Superalgos.git"
}

install() {
    # install pm2 globally
    echo ""
    echo "superalgos | info | installing pm2 globally for process management"
    echo ""
    npm install -g pm2

    echo ""
    echo "superalgos | info | running node setup script to run prepare the app"
    echo ""
    node setup.js

    echo ""
    echo "superalgos | info | running node setup script to run prepare the app"
    echo ""
    node setupPlugins.js $username $token

    # install the superalgos command line app
    echo ""
    echo "superalgos | info | installing 'superalgos' cli"
    echo ""
    npm install -g . --omit=optional
}

main() {
    checkGit
    checkNode
    cloneSuperalgos
    cd Superalgos
    install
}

if [ -z "$username" ] || [ -z "$token" ]
then
    exit 1
fi

main