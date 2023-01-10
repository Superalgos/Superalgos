#!/bin/sh

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


installGit() {
    echo ""
    echo "superalgos | info | installing git"
    echo ""
    add-apt-repository ppa:git-core/ppa
    apt update
    apt install git -y
    echo ""
    echo "superalgos | info | installed git"
    echo ""
}

installNode() {
    echo ""
    echo "superalgos | info | installing nodejs"
    echo ""
    curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - &&\
    sudo apt-get install -y nodejs
    echo ""
    echo "superalgos | info | installed nodejs"
    echo ""
}

checkGit() {
    if which git > /dev/null
    then
        echo ""
        echo "superalgos | info | nodejs already installed"
        echo ""
    else
        installGit
    fi
}

checkNode() {
    if which node > /dev/null
    then
        echo ""
        echo "superalgos | info | git already installed"
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

addOriginRemote() {
    local username = process.args[1]
    if ! [ -z "$username" ]
    then
        echo ""
        echo "superalgos | info | adding user remote as origin to repositories"
        echo ""
        git remote add origin "https://github.com/$username/Superalgos.git"
        local matchDir
        while read -r line
        do 
            local m=$(echo "$line" | grep "^path" | grep -oE "[A-Za-z]+\/[A-Za-z\-]+") # if result cd
            if [ -z "$m" ]
            then 
                matchDir=$m
            fi
            local matchUrl=$(echo "$line" | grep "^url" | grep -oE "http.*" | grep -Eo "[A-Za-z\-]+$") # if result add origin replacing Superalgos with username
            if [ -z $matchDir && -z $matchUrl ]
            then
                cd "$matchDir"
                git remote add origin "https://github.com/$username/$matchUrl.git"
                cd ../..
            fi
        done < .gitmodules
    else
        echo ""
        echo "superalgos | info | adding superalgos remote as origin to repositories"
        echo ""
        git remote add origin "https://github.com/Superalgos/Superalgos.git"
        while read -r line
        do 
            local m=$(echo "$line" | grep "^path" | grep -oE "[A-Za-z]+\/[A-Za-z\-]+") # if result cd
            if [ -z "$m" ]
            then 
                matchDir=$m
            fi
            local matchUrl=$(echo "$line" | grep "^url" | grep -oE "http.*") # if result add origin replacing Superalgos with username
            if [ -z $matchDir && -z $matchUrl ]
            then
                cd "$matchDir"
                git remote add origin "$matchUrl.git"
                cd ../..
            fi
        done < .gitmodules
    fi
}

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

    echo ""
    echo "superalgos | info | running node setup script to run prepare the app"
    echo ""
    node setupPlugins.js $username $token
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