/*
This is to start a new instance of a test desktop app running with identity #3 as 
defined at the Environment.js file.
*/

let APP_ROOT = require('./DesktopRoot.js')
let APP_ROOT_MODULE = APP_ROOT.newDesktopRoot()
APP_ROOT_MODULE.run({DESKTOP_APP_SIGNING_ACCOUNT: 'Social-Trading-Desktop-App-3'})
   python -m pip install git+https://github.com/mamba-org/conda_oci_mirror@main
          echo ${{ env.GHA_PAT }} | oras login https://ghcr.io -u ${{ env.GITHUB_USER }} --password-stdin
          conda-oci mirror --channel ${{ github.event.inputs.channel }} -s ${{ matrix.subdir }} --packages ${{ github.event.inputs.package }}  --user ${{ env.GITHUB_USER }}
