set TARGET='%CD%\launch-windows.bat'
set SHORTCUT='%USERPROFILE%\Desktop\Superalgos.lnk'
set ICON='%CD%\superalgos.ico'
set PWS=powershell.exe -ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile

%PWS% -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut(%SHORTCUT%); $S.TargetPath = %Target%; $S.IconLocation = %ICON%; $S.Save()"

#Keep terminal open for debug
#cmd /k echo "keep open"