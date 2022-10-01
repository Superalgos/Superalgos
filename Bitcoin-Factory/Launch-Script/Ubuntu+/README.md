# These are Install scripts for the [Superalgos](https://github.com/Superalgos/Superalgos) project.

Currently the available convenience scripts:

  - **Ubuntu**
  --------------------------------------------------_(Should work for most Debian based Operating Systems)_ 
  
  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; --------------------------------------------------_(Confirmed working on Raspberry Pi OS 64 bit)_

## What Exactly is this script going to do?

**This Script is a convenience Installation Method for the Superalgos Project.**

**It is intended to simplify Installation for users not requiring custom Install options.**

This script will:
 - Install needed dependencies
 - Optional Docker install (for Bitcoin-Factory)
 - Install Superalgos in the home directory
 - Run "node setup" script for you
 - Run "node setupPlugins" script for you
 - Run "node updateGithubRepos" script for you
 - Run the docker build command
 
**After script completion please restart your system for all changes to take effect!**

To start script you may need to change its access rights. To do this move to the scripts location and enter:
```
sudo chmod 775 Ubuntu_SA_Installer.sh
```
Then to run the script enter:
```
./Ubuntu_SA_Installer.sh
```

You will be asked to input your:
 - Github Username
 - Github Token
 - Superalgos Fork URL

Finally you may be asked to input your user password to allow for the use of "sudo" during installation.
