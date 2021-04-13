function newSuperalgosUtilitiesGitBranches() {
    thisObject = {
        getBranchLabel: getBranchLabel
    }

    return thisObject

    function getBranchLabel(branch) {
        let branchLabel
        switch (branch) {
            case 'master': {
                branchLabel = 'Master'
                break
            }
            case 'develop': {
                branchLabel = 'Develop'
                break
            }
            case 'plugins-docs': {
                branchLabel = 'Plugins/Docs'
                break
            }
        }
        return branchLabel 
    }    
}