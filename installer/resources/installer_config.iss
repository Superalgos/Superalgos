; -- installer_config.iss --
; Superalgos installer configuration
; install https://jrsoftware.org/isinfo.php to generate the exe file

; SEE THE DOCUMENTATION FOR DETAILS ON CREATING .ISS SCRIPT FILES!

#define MyAppName "Superalgos"
#define MyAppVersion "1.30"
#define MyAppPublisher "Superalgos"
#define MyAppURL "https://www.superalgos.org"
#define MyAppIcon ".\icon.ico"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{FF378796-5FF9-4B3C-A29A-F4E48C9A40A5}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\{#MyAppName}
DefaultGroupName={#MyAppName}
SetupIconFile={#MyAppIcon}
AllowNoIcons=yes
WizardStyle=modern
Compression=lzma2
SolidCompression=yes
DisableWelcomePage=no
LicenseFile=license.txt
PrivilegesRequired=lowest
DisableDirPage=no
DisableProgramGroupPage=no
OutputDir=..\
OutputBaseFilename=superalgos

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Files]
Source: "clone_superalgos.bat"; DestDir: "{app}"; Flags: deleteafterinstall

[Code]
// Helper function to support both 32 and 64 bit Windows
// https://stackoverflow.com/questions/4429554/inno-setup-regkeyexists-on-64-bit-systems
function GetHKLM(): Integer;
begin
  if IsWin64 then
    Result := HKLM64
  else
    Result := HKLM32;
end;

function GetGitInstallationPath(): String;
var
  GitPath: String;
begin
  Result := 'Git is not installed. Click "Next" to install.';
  if not RegQueryStringValue(GetHKLM(), 'SOFTWARE\GitForWindows', 'InstallPath', GitPath) then
  begin
    Exit;
  end;
  if DirExists(GitPath) then
  begin
    Result := GitPath
  end;
end;

function GetNodejsInstallationPath(): String;
var
  NodejsPath: String;
begin
  Result := 'Node.js is not installed. Click "Next" to install.';
  if not RegQueryStringValue(GetHKLM(), 'SOFTWARE\Node.js', 'InstallPath', NodejsPath) then
  begin
    Exit;
  end;
  if DirExists(NodejsPath) then
  begin
    Result := NodejsPath
  end;
end;

var
  OutputProgressWizardPage: TOutputProgressWizardPage;
  GithubInfoPage: TInputQueryWizardPage;
  GitInfoPage: TOutputMsgWizardPage;
  NodejsInfoPage: TOutputMsgWizardPage;

procedure ValidateGithubInfoPage;
begin
  WizardForm.NextButton.Enabled := (Trim(GithubInfoPage.Values[0]) <> '') and (Trim(GithubInfoPage.Values[1]) <> '');
end;

procedure GithubInfoPageEditChange(Sender: TObject);
begin
  ValidateGithubInfoPage;
end;

procedure GithubInfoPageActivate(Sender: TWizardPage);
begin
  ValidateGithubInfoPage;
end;
  
procedure InitializeWizard;
var
  AfterID: Integer;
begin
  WizardForm.LicenseAcceptedRadio.Checked := True;

  AfterID := wpSelectDir;
     
  GithubInfoPage := CreateInputQueryPage(AfterID, 'Github information', 'This information is needed to proper clone and initialize the Superalgos repository.', 'Make sure that you have already forked a Superalgos repository before continue the installation.');
  GithubInfoPage.OnActivate := @GithubInfoPageActivate;
  GithubInfoPage.Add('Github username:', False);
  GithubInfoPage.Add('Github personal access token:', False);
  GithubInfoPage.Edits[0].OnChange := @GithubInfoPageEditChange;
  GithubInfoPage.Edits[1].OnChange := @GithubInfoPageEditChange;
  AfterID := GithubInfoPage.ID;
  
  GitInfoPage := CreateOutputMsgPage(AfterID, 'Git installation', 'Git installation path:', GetGitInstallationPath());
  AfterID := GitInfoPage.ID;

  NodejsInfoPage := CreateOutputMsgPage(AfterID, 'Node.js installation', 'Node.js installation path:', GetNodejsInstallationPath());
  AfterID := NodejsInfoPage.ID;
  
  OutputProgressWizardPage := CreateOutputProgressPage('', '');
end;

function OnDownloadProgress(const Url, Filename: string; const Progress, ProgressMax: Int64): Boolean;
begin
  if ProgressMax <> 0 then
    OutputProgressWizardPage.SetProgress(Progress, ProgressMax)
  else
    Log(Format('  %d bytes done.', [Progress]));
  Result := True;
end;

function InstallGit(): Boolean;
var
  ResultCode: Integer;
  InstallerUrl: String;
begin
  if IsWin64 then
    InstallerUrl := 'https://github.com/git-for-windows/git/releases/download/v2.40.1.windows.1/Git-2.40.1-64-bit.exe'
  else
    InstallerUrl := 'https://github.com/git-for-windows/git/releases/download/v2.40.1.windows.1/Git-2.40.1-32-bit.exe';

  OutputProgressWizardPage.SetText('Downloading Git.', 'Please wait till Git installer will start.');
  OutputProgressWizardPage.Show;
  // Download the Git installer to the user's temp directory
  DownloadTemporaryFile(InstallerUrl, 'gitinstaller.exe', '', @OnDownloadProgress);

  if not Exec(ExpandConstant('{tmp}\gitinstaller.exe'), '/NORESTART', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then begin
    Result := False;
  end;
  Result := True;
  OutputProgressWizardPage.Hide;
  // Reset progress bar
  OutputProgressWizardPage.SetProgress(0, 0);
end;

function InstallNodejs(): Boolean;
var
  ResultCode: Integer;
  InstallerUrl: String;
begin
  if IsWin64 then
    InstallerUrl := 'https://nodejs.org/dist/v18.16.0/node-v18.16.0-x64.msi'
  else
    InstallerUrl := 'https://nodejs.org/dist/v18.16.0/node-v18.16.0-x86.msi';

  OutputProgressWizardPage.SetText('Downloading Node.js.', 'Please wait till Node.js installer will start.');
  OutputProgressWizardPage.Show;
  // Download the Node.js installer to the user's temp directory
  DownloadTemporaryFile(InstallerUrl, 'nodeinstaller.msi', '', @OnDownloadProgress);
  if not Exec(ExpandConstant('{sys}\msiexec.exe'), '/i "' + ExpandConstant('{tmp}\nodeinstaller.msi'), '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then begin
    Result := False;
  end;
  Result := True;
  OutputProgressWizardPage.Hide;
  // Reset progress bar
  OutputProgressWizardPage.SetProgress(0, 0);
end;

function InstallSuperalgosRepository(): Boolean;
var
  ProgressFileName, BatchPath, Command, Params: String;
  ErrorCode: Integer;
begin
  BatchPath := ExpandConstant('{app}') + '\clone_superalgos.bat';
  Params := ExpandConstant('{app}') + ' "' + GetGitInstallationPath() + '" ' + GithubInfoPage.Values[0] + ' "' + GetNodejsInstallationPath() + '" ' + GithubInfoPage.Values[1];
  ProgressFileName := ExpandConstant('{app}') + '\repo_progress.txt';
  Command := Format('%s %s', [BatchPath, Params]);
    Log('Command: ' + Command);
  if Exec(ExpandConstant('{cmd}'), '/C ' + Command, '', SW_SHOW, ewWaitUntilTerminated, ErrorCode) then
  begin
    Log('Superalgos repository cloned');
    Result := True;
  end
  else
  begin
    Log('Failed to clone Superalgos repository. Setup will now exit.');
    Result := False;
    Exit;
  end;
end;

function BoolToStr(Value : Boolean) : String; 
begin
  if Value then
    result := 'true'
  else
    result := 'false';
end;

function UpdateReadyMemo(Space, NewLine, MemoUserInfoInfo, MemoDirInfo, MemoTypeInfo,
  MemoComponentsInfo, MemoGroupInfo, MemoTasksInfo: String): String;
var
  S: String;
begin
  S := '';
  S := S + MemoDirInfo + NewLine;
  S := S + NewLine;
  S := S + 'Github Information:' + NewLine;
  S := S + Space + 'Username: ' + GithubInfoPage.Values[0] + NewLine;
  S := S + Space + 'Token: ' + GithubInfoPage.Values[1] + NewLine;
  S := S + NewLine;
  Result := S;
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  if CurPageID = GitInfoPage.ID then begin
    if pos('not installed', GetGitInstallationPath()) > 0 then begin
      InstallGit();
    end;
  end;
  if CurPageID = NodejsInfoPage.ID then begin
    if pos('not installed', GetNodejsInstallationPath()) > 0 then begin
      InstallNodejs();
    end;
  end;

  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    InstallSuperalgosRepository();
  end;
end;
