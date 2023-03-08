#! /bin/bash
#
#
### First Up Is All The Functions That Will Be Used.
#
# This is the install control function.
function installController() {
    getSystemInfo
    wait
    getUserInfo
    wait
    giveUserPermissions
    wait
    getDependencies
    wait
    getDocker
    wait
    cloneFork
    wait
    initSetup
    wait
    buildDocker
    wait
    showFinishMessage
}
#
## Here we will gather what system info we can as to install the correct stuff.
function getSystemInfo() {
    #Name the current operating system.
    osName=$(uname)
    #What bit is the system?
    osBit=$(getconf LONG_BIT)
    echo "  "
    echo "We Are Running On A "$osName" System That Is "$osBit"Bits From What We Can Tell."
    sleep 5s
}
#
# Here We Get The Needed User Info To Complete The Install.
function getUserInfo() {
    echo " Does This Device Have An xArm Processor?"
    read -p '(y/n): ' arm
    if [ "$arm" = "y" ]
    then
        armP="y"
        echo " We Will Use The xArm Docker Build File Then."
	sleep 5s
    else
        armP="n"
        echo "We Will Use The Usual Docker Build File Then."
    fi
    echo " What Is Your Github Username?"
    read -p '(UserName): ' username
    echo " Welcome "$username" "
    sleep 2s
    echo " What Is The URL Of Your Superalgos Fork?"
    read -p '(ForkURL): ' fork
    sleep 2s
    echo " What Github Token Would You Like To Use?"
    read -p '(Token): ' token
    sleep 2s
    echo " The Install Script Is About To Begin."
    sleep 3s
    clear
}
#
# Here We Give The User The Needed Permissions.
function giveUserPermissions() {
    user=$(whoami)
    echo "$user"
    echo " Please Input Your User Password To Allow For sudo Commands"
    givesudo='sudo usermod -aG sudo '$user' '
    eval $givesudo
    wait
    giveDocker='sudo usermod -aG docker '$user' '
    eval $giveDocker
    wait
}
#
# Here We Install The Main Dependencies.
function getDependencies() {
    echo "## First Lets Update........................................"
    update='sudo apt update'
    eval $update
    wait
    echo "## Getting curl............................................."
    curl='sudo apt install -y curl'
    eval $curl
    wait
    echo "## Getting Node From NodeSource............................."
    nodeSource='curl -sL https://deb.nodesource.com/setup_17.x | sudo -E bash -'
    eval $nodeSource
    wait
    eval $update
    wait
    node='sudo apt install -y nodejs'
    eval $node
    wait
    sleep 20s
}
#
## If the user wants docker, the user gets docker.
function getDocker() {
if [ "$docker" = "y" ]
then
    echo "## Getting ready to get docker from docker.com............."
    locationD='curl -fsSL https://get.docker.com -o get-docker.sh'
    eval $locationD
    wait
    echo "## Getting docker.........................................."
    getDocker='sudo sh get-docker.sh'
    eval $getDocker
    wait
fi
}
#
# Here We Will Clone Superalgos To The Home Directory.
function cloneFork() {
    echo "## Preparing To Clone Your Fork............................"
    echo "# First We Move To The Home Directory......................"
    movehome='cd ~'
    eval $movehome
    wait
    echo "## Cloning Fork............................................"
    clone='git clone "$fork"'
    eval $clone
    wait
    echo "## Fork Cloned"
    sleep 3s
}
#
## Here We Setup Superalgos By Utilizing The Existing Install Scripts.
function initSetup() {
    echo "## Preparing To Setup Superalgos..........................."
    homeS='cd ~/Superalgos'
    eval $homeS
    wait
    echo "## Switching To Develop Branch............................."
    devBranch='git checkout develop'
    eval $devBranch
    wait
    echo "Running Node Setup Script.................................."
    setup='node setup'
    eval $setup
    wait
    echo "## Running Node SetupPlugins Script........................"
    plugins='node setupPlugins "$username" "$token"'
    eval $plugins
    wait
    echo "## Running updateGithubRepos Script........................"
    github='node updateGithubRepos'
    eval $github
    wait
}
#
## Here we run the docker build command
function buildDocker() {
    btcFactory='cd Bitcoin-Factory'
    eval $btcFactory
    wait
    if [ $armP = "y" ]
    then
        armDocker='cd ArmDockerBuild'
        eval $armDocker
        wait
        buildDockerImageArm='sg docker "docker build -t bitcoin-factory-machine-learning ."'
        eval $buildDockerImageArm
        wait
        moveBack='cd ..'
        eval $moveBack
        wait
    else
        dockerBuild='cd DockerBuild'
        eval $dockerBuild
        wait
        buildDockerImage='sg docker "docker build -t bitcoin-factory-machine-learning ."'
        eval $buildDockerImage
        wait
        cd ..
        wait
    fi
}
#
## Show a Finish Message
function showFinishMessage() {
    clear
    echo "############################################################"
    echo "# This Script has Finished Executing!                      #"
    echo "# Everything should be all setup for you!                  #"
    echo "# Please Restart For All Changes To Take Effect!           #"
    echo "############################################################"
    sleep 15s
} 
#
# Lets Clear the Terminal So Everything Starts Neat And Tidy.
clear
#
# Welcome Message
echo "----------------------------------------"
echo "|  Welcome To The Superalgos Install   |"
echo "----------------------------------------"
echo " "
echo " "
sleep 2s
echo "This Script is Intened To Be Used To Install Superalgos on Ubuntu and *Should* Work On Any Debain Based Distro"
echo "This is A Convience Installation Method"
echo "After A Few Questions This Script Will:"
echo " "
echo " .........Clone Your Superalgos Fork To This Machine"
echo " .........Setup Superalgos Plugins"
echo " .........Optional Docker Install Option For Bitcoin-Factory"
echo " "
echo " "
echo " "
sleep 12s
clear
# Here We Will Find Out What All The User Would Like Us To Do.
echo " Would You Like Us To Install Superalgos?"
echo " ***Note: Superalgos will be installed inside the home directory***"
read -p '(y/n): ' choice
if [ "$choice" = "y" ]
then
    install="y"
    echo " OK"
    sleep 1s
    echo " Would you like us to install docker?"
    read -p '(y/n): ' choice
    if [ "$choice" = "y" ]
    then 
        docker="y"
        echo " OK, We will also install docker!"
    else
	docker="n"
	echo " OK, We will not install docker then!"
    fi
    sleep 2s

    echo " We Will Need To Ask You A Few More Questions To Continue"
    sleep 3s
    installController
else
    install="n"
    echo " OK"
    sleep 2s
    clear
    echo " This Script Is Only Intended To Install Superalgos."
    echo " We Are Not Sure What You Would Like Us To Do."
    sleep 1s
    echo " Please Manually Install Superalgos For Custom Install Options."
    echo "  "
    echo "  "
fi


