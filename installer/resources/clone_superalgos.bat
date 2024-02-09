@echo off
cd /d %1
set PATH=%PATH%;%2\bin;%4
git init
git remote add origin https://github.com/%3/Superalgos.git
git fetch
git checkout origin/master -ft
node setup
node setupPlugins %3 %5
node updateGithubRepos
pause