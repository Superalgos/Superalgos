@echo off
:: BatchGotAdmin
::-------------------------------------
REM  --> Check for permissions
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"

REM --> If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params = %*:"="
    echo UAC.ShellExecute "cmd.exe", "/c %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"

    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
::--------------------------------------
::ENTER YOUR CODE BELOW:
CLS
cd D:\Apps\Superalgos
echo Requesting data.
echo Requesting data confirmed.
echo Asking to launch database.
echo Sucesfull patching database.
echo Welcome to Superalgos.
echo                                                                                 
echo                                                       ,/((//,                   
echo                                                   /(((((((((((((.               
echo                                                 /      ((((((((((*              
echo                                                          (((((((((,             
echo                                                           (((((((((             
echo                                                            ((((((((             
echo                                        (.                  ((((((((             
echo                                     ,((.                   /(((((((             
echo                                  .(((,                     /((((((*             
echo                                ((((,         ((((((.       /((((((              
echo                            /(((((,         /((((((((       .(((((.              
echo                    ,/((((((((((,          /(((((((((/       *((((               
echo               ,((((((((((((((.           /((((((((((/        *(((.              
echo            /(((((((((((((/.            //((((((((((((.        (((/              
echo         .((((((((((((/               (((((((((((((((((         /((              
echo        (((((((((((,              *(((((((((((((((((((((.        (((             
echo       /((((((((/               ((((((((((((((((((((((((((        /(,            
echo       .(((((((               .(((((((((((((((((((((((((((((       .(            
echo        .(((((/                *(((((((((((((((((((((((((((((                    
echo          ,((((*                                  *((((((((((                    
echo              .*//                                     .,*,                      
echo                                .                                                
echo                                  *((((((((((((*.                                
echo                                         ./(((((((((((,                 .(       
echo                                              .(((((((((((/.           *((*      
echo                                                 ,((((((((((((((((((((((((*      
echo                                                    *(((((((((((((((((((((       
echo                                                        /(((((((((((((((*        
echo                                                             ,/((((((*           

echo choose below
ECHO 1.Full Ram requirement
ECHO 2.Less Ram requirement
ECHO.

CHOICE /C 12 /M "Enter your choice:"

pause
:: Note - list ERRORLEVELS in decreasing order
IF ERRORLEVEL 2 GOTO Less Ram requirement
IF ERRORLEVEL 1 GOTO Full Ram requirement

:Full Ram requirement
ECHO Full Ram requirement 
start node run
GOTO End

:Less Ram requirement
ECHO Less Ram requirement 
start node run minMemo
GOTO End

:End