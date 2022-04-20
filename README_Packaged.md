# Packaged Application Installation

This is by far the easiest way to get started with Superalgos! 

These packages contain the source code for the Superalgos platform wrapped together in one convenient file.  To find these files you can go to Superalgos' [releases page](https://github.com/Superalgos/Superalgos/releases). The releases are organized into two main categories.  First are the stable releases that come out roughly once a month and are the most tested and bug-free.  Second, are the nightly development snapshots that offer the most up-to-date code, but have not undergone the same rigorous testing. 

> :white_check_mark: **NOTE**: If you are just getting started, it is recommended to begin with installing the most recent stable release before trying out one of the development snapshots.

Once you have chosen which type of release you would like to install, you can then find the proper package for your operating system. Each operating system has its own packaged application to work natively within your operating system.  The following list highlights the currently available packages:  

> :white_check_mark: **IMPORTANT:** These installers are not code-signed (this costs money and Superalgos is completely free for everyone). Therefore, the antivirus will probably flag the file as not secure. You can force the installation to allow the packages to run. A more detailed explanation of this can be found in this [medium article](https://medium.com/superalgos/superalgos-packaged-application-release-8befd2895102). If this makes you uncomfortable, you may look into some of the other installation methods that do not suffer from this limitation.

> :white_check_mark: **NOTE ABOUT ASCENDEX:** An issue with AscendEX API may prevent the Welcome to Superalgos tutorial to run as expected. We suggest you use the fallback/default workspace in the meantime. The issue was reported to the exchange and is currently being investigated. 


## Windows Portable Application

This package requires zero installation! Simply download the package `Superalgos-win-{version}.exe` and you’re good to go. 

All the exchange data that downloaded and the workspaces you save are stored in your default documents folder (My Documents on Windows) under the `Superalgos_Data` folder. This way it's easier for you to backup data and not lose it between reinstallations.

## Windows Setup Package

Also on windows, there is a more traditional installer that installs the application and sets up the correct icons and shortcuts for you. This way you have a nice entry on the programs list. The downloaded data is stored in your Documents folder under the `Superalgos_Data` folder. This way it is easier for you to backup data and not lose it between reinstallations.

## macOS Image

Users of macOS have the option of downloading a DMG package. Installation is as simple as downloading the DMG file, copying it into your Applications folder, and running `xattr -rd com.apple.quarantine Superalgos.app` from the Terminal (Intel/M1) or allow the app in `System Preferences > Security & Privacy > General > Open Anyway` (Intel only)!

Currently, there are two types of DMG packages. The x64 variant (for Intel-based Mac only), as well as the ARM64 variant for the newer Apple Silicon (M1) based machines. All data is stored in the user's Documents folder under the `Superalgos_Data` folder. This way it is easier for you to backup data and not lose it between reinstallations.

For a more detailed walk-through of the ins and outs of Superalgos packaged installations see this [medium article](https://medium.com/superalgos/superalgos-packaged-application-release-8befd2895102).

## Pros and Cons of Packaged Installations

The packaged applications are by far the easiest way to install the Superalgos Platform. All of the day-to-day functionality of the platform is readily available, as well as the ability to create and submit a User Profile to the Governance system! 

The main drawback of this type of installation comes with limitations on the ability to add contributions. Submitting a review, editing and translating the docs, or any kind of code contribution is not possible from a packaged installation.