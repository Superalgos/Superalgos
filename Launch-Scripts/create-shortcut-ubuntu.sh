#!/bin/sh
PWD=`pwd`
DIR=${PWD%/*} 

touch Superalgos.desktop

echo "[Desktop Entry]
Type=Application
Encoding=UTF-8
Name=Superalgos
Comment=Launch Shortcut for Superalgos 
Path=$PWD
Exec=gnome-terminal -e $PWD/launch-linux.sh
Terminal=true
Icon=$DIR/Projects/Superalgos/Icons/superalgos.png
Categories=Application;" > Superalgos.desktop

chmod +x Superalgos.desktop

cp Superalgos.desktop ~/Desktop/Superalgos.desktop
cp Superalgos.desktop ~/.local/share/applications/Superalgos.desktop

rm Superalgos.desktop

# Keep terminal open for debugging
#$SHELL